// Offline Storage Manager - Local storage fallback for Firestore
// Handles offline data persistence and sync when back online

const OfflineManager = {
    DB_NAME: 'lifereset_offline',
    DB_VERSION: 1,
    db: null,

    // Initialize IndexedDB for offline storage
    async init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('[Offline] IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[Offline] IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for pending writes (queue when offline)
                if (!db.objectStoreNames.contains('pendingWrites')) {
                    const store = db.createObjectStore('pendingWrites', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('collection', 'collection', { unique: false });
                }

                // Store for cached data (local copy of Firestore data)
                if (!db.objectStoreNames.contains('cachedData')) {
                    const cache = db.createObjectStore('cachedData', { keyPath: 'key' });
                    cache.createIndex('type', 'type', { unique: false });
                    cache.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Store for app state backup
                if (!db.objectStoreNames.contains('appState')) {
                    db.createObjectStore('appState', { keyPath: 'key' });
                }

                console.log('[Offline] IndexedDB schema created');
            };
        });
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // Queue a write operation for later sync
    async queueWrite(collection, docId, data, operation = 'set') {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingWrites'], 'readwrite');
            const store = transaction.objectStore('pendingWrites');

            const writeOp = {
                collection,
                docId,
                data,
                operation,
                timestamp: Date.now(),
                retries: 0
            };

            const request = store.add(writeOp);
            request.onsuccess = () => {
                console.log('[Offline] Write queued:', collection, docId);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    },

    // Get all pending writes
    async getPendingWrites() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingWrites'], 'readonly');
            const store = transaction.objectStore('pendingWrites');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    // Remove a pending write after successful sync
    async removePendingWrite(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingWrites'], 'readwrite');
            const store = transaction.objectStore('pendingWrites');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Cache data locally
    async cacheData(key, type, data) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cachedData'], 'readwrite');
            const store = transaction.objectStore('cachedData');

            const cacheEntry = {
                key,
                type,
                data,
                updatedAt: Date.now()
            };

            const request = store.put(cacheEntry);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Get cached data
    async getCachedData(key) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cachedData'], 'readonly');
            const store = transaction.objectStore('cachedData');
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => reject(request.error);
        });
    },

    // Save app state
    async saveAppState(key, value) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['appState'], 'readwrite');
            const store = transaction.objectStore('appState');
            const request = store.put({ key, value, updatedAt: Date.now() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Load app state
    async loadAppState(key) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['appState'], 'readonly');
            const store = transaction.objectStore('appState');
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result?.value || null);
            request.onerror = () => reject(request.error);
        });
    },

    // Sync pending writes to Firestore
    async syncPendingWrites() {
        if (!this.isOnline() || !window.db || !window.appState?.currentUser) {
            return { synced: 0, failed: 0 };
        }

        const pending = await this.getPendingWrites();
        let synced = 0;
        let failed = 0;

        for (const write of pending) {
            try {
                const uid = window.appState.currentUser.uid;
                let ref;

                // Build the document reference
                if (write.collection.includes('/')) {
                    // Nested collection path
                    ref = window.db.collection('users').doc(uid);
                    const parts = write.collection.split('/');
                    for (const part of parts) {
                        ref = ref.collection(part);
                    }
                    if (write.docId) {
                        ref = ref.doc(write.docId);
                    }
                } else {
                    ref = window.db.collection('users').doc(uid)
                        .collection(write.collection).doc(write.docId);
                }

                // Perform the operation
                switch (write.operation) {
                    case 'set':
                        await ref.set(write.data, { merge: true });
                        break;
                    case 'update':
                        await ref.update(write.data);
                        break;
                    case 'delete':
                        await ref.delete();
                        break;
                }

                await this.removePendingWrite(write.id);
                synced++;
                console.log('[Offline] Synced:', write.collection, write.docId);

            } catch (error) {
                console.error('[Offline] Sync failed:', write, error);
                failed++;
            }
        }

        if (synced > 0) {
            console.log(`[Offline] Sync complete: ${synced} synced, ${failed} failed`);
            if (typeof showToast === 'function') {
                showToast(`Synced ${synced} offline changes`, 'success');
            }
        }

        return { synced, failed };
    },

    // Save current user data for offline access
    async backupUserData() {
        if (!window.appState) return;

        const backup = {
            userStats: window.appState.userStats,
            userGoals: window.appState.userGoals,
            userTasks: window.appState.userTasks,
            badHabits: window.appState.badHabits,
            moodHistory: window.appState.moodHistory,
            journalEntries: window.appState.journalEntries,
            tasksHistory: window.appState.tasksHistory,
            xpDailyHistory: window.appState.xpDailyHistory,
            currentDate: window.appState.currentDate?.toISOString()
        };

        await this.saveAppState('userDataBackup', backup);
        console.log('[Offline] User data backed up');
    },

    // Restore user data from offline backup
    async restoreUserData() {
        const backup = await this.loadAppState('userDataBackup');
        if (!backup || !window.appState) return false;

        // Merge backup into appState (don't overwrite if we have fresh data)
        if (!window.appState.userStats.xp && backup.userStats) {
            window.appState.userStats = { ...window.appState.userStats, ...backup.userStats };
        }
        if ((!window.appState.userGoals || !window.appState.userGoals.length) && backup.userGoals) {
            window.appState.userGoals = backup.userGoals;
        }
        if (backup.userTasks && Object.keys(window.appState.userTasks).every(k => !window.appState.userTasks[k].length)) {
            window.appState.userTasks = backup.userTasks;
        }
        if (backup.badHabits && !Object.keys(window.appState.badHabits).length) {
            window.appState.badHabits = backup.badHabits;
        }
        if (backup.moodHistory && !window.appState.moodHistory?.length) {
            window.appState.moodHistory = backup.moodHistory;
        }
        if (backup.journalEntries && !window.appState.journalEntries?.length) {
            window.appState.journalEntries = backup.journalEntries;
        }
        if (backup.tasksHistory) {
            window.appState.tasksHistory = { ...backup.tasksHistory, ...(window.appState.tasksHistory || {}) };
        }
        if (backup.xpDailyHistory) {
            window.appState.xpDailyHistory = { ...backup.xpDailyHistory, ...(window.appState.xpDailyHistory || {}) };
        }

        console.log('[Offline] User data restored from backup');
        return true;
    }
};

// Network status monitor
const NetworkMonitor = {
    _listeners: [],
    _isOnline: navigator.onLine,

    init() {
        window.addEventListener('online', () => this._handleOnline());
        window.addEventListener('offline', () => this._handleOffline());
        
        // Also check periodically (navigator.onLine isn't always reliable)
        setInterval(() => this._checkConnection(), 30000);
        
        this._updateUI();
        console.log('[Network] Monitor initialized, status:', this._isOnline ? 'online' : 'offline');
    },

    _handleOnline() {
        if (!this._isOnline) {
            this._isOnline = true;
            console.log('[Network] Back online');
            this._updateUI();
            this._notifyListeners('online');
            
            // Sync pending changes
            setTimeout(() => {
                OfflineManager.syncPendingWrites();
            }, 1000);
        }
    },

    _handleOffline() {
        if (this._isOnline) {
            this._isOnline = false;
            console.log('[Network] Gone offline');
            this._updateUI();
            this._notifyListeners('offline');
            
            // Backup current data
            OfflineManager.backupUserData();
        }
    },

    async _checkConnection() {
        try {
            const response = await fetch('/manifest.webmanifest', { 
                method: 'HEAD',
                cache: 'no-store'
            });
            if (response.ok && !this._isOnline) {
                this._handleOnline();
            }
        } catch (e) {
            if (this._isOnline) {
                this._handleOffline();
            }
        }
    },

    _updateUI() {
        // Update offline indicator
        let indicator = document.getElementById('offlineIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offlineIndicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline - Changes will sync when connected';
            document.body.appendChild(indicator);
        }

        if (this._isOnline) {
            indicator.classList.remove('show');
        } else {
            indicator.classList.add('show');
        }
    },

    _notifyListeners(status) {
        this._listeners.forEach(callback => {
            try {
                callback(status);
            } catch (e) {
                console.error('[Network] Listener error:', e);
            }
        });
    },

    onStatusChange(callback) {
        this._listeners.push(callback);
    },

    isOnline() {
        return this._isOnline;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    OfflineManager.init().then(() => {
        NetworkMonitor.init();
        
        // Try to restore data if offline
        if (!NetworkMonitor.isOnline()) {
            OfflineManager.restoreUserData();
        }
    });
});

// Periodic backup while app is running
setInterval(() => {
    if (window.appState?.currentUser) {
        OfflineManager.backupUserData();
    }
}, 60000); // Every minute

// Export for use in other modules
window.OfflineManager = OfflineManager;
window.NetworkMonitor = NetworkMonitor;
