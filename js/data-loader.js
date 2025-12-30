/**
 * @fileoverview Data Loading & Synchronization Module
 * @description Handles Firebase data loading and real-time synchronization
 * @version 1.0.0
 */



/* ==========================================================================
   Real-time Listener References
   ========================================================================== */

let moodRealtimeUnsubscribe = null;
let journalRealtimeUnsubscribe = null;
let xpDailyRealtimeUnsubscribe = null;

/* ==========================================================================
   Polling Intervals
   ========================================================================== */

let moodPollingInterval = null;
let journalPollingInterval = null;
let xpDailyPollingInterval = null;
let dateMonitorInterval = null;

function cleanupRealtimeListeners() {
    try {
        if (moodRealtimeUnsubscribe) moodRealtimeUnsubscribe();
        if (journalRealtimeUnsubscribe) journalRealtimeUnsubscribe();
        if (xpDailyRealtimeUnsubscribe) xpDailyRealtimeUnsubscribe();
    } catch (_) {
        // ignore
    }
    moodRealtimeUnsubscribe = null;
    journalRealtimeUnsubscribe = null;
    xpDailyRealtimeUnsubscribe = null;

    if (moodPollingInterval) clearInterval(moodPollingInterval);
    if (journalPollingInterval) clearInterval(journalPollingInterval);
    if (xpDailyPollingInterval) clearInterval(xpDailyPollingInterval);
    moodPollingInterval = null;
    journalPollingInterval = null;
    xpDailyPollingInterval = null;
    
    // Clear date monitor interval
    if (dateMonitorInterval) {
        clearInterval(dateMonitorInterval);
        dateMonitorInterval = null;
    }
    
    // Clear Firestore polling fallback
    if (window.firestorePollingInterval) {
        clearInterval(window.firestorePollingInterval);
        window.firestorePollingInterval = null;
    }

    if (window.firestoreUnsubscribers && Array.isArray(window.firestoreUnsubscribers)) {
        window.firestoreUnsubscribers.forEach(fn => {
            try { if (typeof fn === 'function') fn(); } catch (_) {}
        });
    }
    window.firestoreUnsubscribers = [];
}

// Debounce helper for real-time saves
let saveTimers = {};
function debouncedSave(key, saveFunction, delay = 500) {
    if (saveTimers[key]) clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(() => {
        saveFunction();
        delete saveTimers[key];
    }, delay);
}

// Load all user data once on login
async function loadAllUserData() {
    if (!appState.currentUser || !db) return;
    
    try {
        const userDoc = await db.collection('users').doc(appState.currentUser.uid).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            
            // Load stats
            if (data.stats) {
                appState.userStats = { ...appState.userStats, ...data.stats };
            }
            
            // Load goals
            if (data.goals) {
                appState.userGoals = data.goals;
            }
            
            // Load bad habits
            if (data.badHabits) {
                appState.badHabits = data.badHabits;
            }
            
            // Load dark mode preference
            if (data.darkMode !== undefined) {
                appState.isDarkMode = data.darkMode;
                if (appState.isDarkMode) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
            
            // Update UI
            updateGamificationUI();
            renderBadges();
            renderGoals();
            renderHabitChain();
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Setup real-time listeners for collaborative features (optional)
function setupRealtimeListeners() {
    if (!appState.currentUser || !db) return;

    cleanupRealtimeListeners();
    
    try {
        // Listen for changes made from other devices/sessions
        const unsubscribe = db.collection('users').doc(appState.currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists && !window.isLocalUpdate) {
                    const data = doc.data();
                    
                    // Update from remote changes
                    if (data.stats) {
                        appState.userStats = { ...appState.userStats, ...data.stats };
                        updateGamificationUI();
                        if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                            initAnalytics();
                        }
                    }
                    
                    if (data.goals) {
                        appState.userGoals = data.goals;
                        renderGoals();
                        if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                            initAnalytics();
                        }
                    }
                    
                    if (data.badHabits) {
                        appState.badHabits = data.badHabits;
                        renderBadHabits();
                        if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                            initAnalytics();
                        }
                    }
                }
            }, (error) => {
                console.error('Error in real-time listener:', error);
                // Fallback: start polling if onSnapshot is blocked (e.g., adblock in localhost)
                if (!window.firestorePollingInterval) {
                    window.firestorePollingInterval = setInterval(async () => {
                        try {
                            const doc = await db.collection('users').doc(appState.currentUser.uid).get();
                            if (doc.exists && !window.isLocalUpdate) {
                                const data = doc.data();
                                if (data.stats) {
                                    appState.userStats = { ...appState.userStats, ...data.stats };
                                    updateGamificationUI();
                                    if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                                        initAnalytics();
                                    }
                                }
                                if (data.goals) {
                                    appState.userGoals = data.goals;
                                    renderGoals();
                                    if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                                        initAnalytics();
                                    }
                                }
                                if (data.badHabits) {
                                    appState.badHabits = data.badHabits;
                                    renderBadHabits();
                                    if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                                        initAnalytics();
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn('Polling fallback failed:', e);
                        }
                    }, 5000);
                }
            });
        
        // Store unsubscribe function for cleanup
        if (!window.firestoreUnsubscribers) {
            window.firestoreUnsubscribers = [];
        }
        window.firestoreUnsubscribers.push(unsubscribe);
    } catch (error) {
        console.log('Error setting up real-time listener:', error);
    }

    setupMoodRealtimeListener();
    setupJournalRealtimeListener();
    setupXPDailyRealtimeListener();
}

function setupMoodRealtimeListener(limitCount = 120) {
    if (!appState.currentUser || !db) return;

    const query = db.collection('users').doc(appState.currentUser.uid)
        .collection('mood')
        .orderBy('date', 'desc')
        .limit(limitCount);

    try {
        moodRealtimeUnsubscribe = query.onSnapshot((snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            // Keep most-recent first like the query
            appState.moodHistory = items;

            if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') initAnalytics();
            if (appState.currentView === 'dashboard' && typeof initDashboard === 'function') initDashboard();
            if (appState.currentView === 'mood' && typeof window.loadMoodStats === 'function') window.loadMoodStats();
        }, (error) => {
            console.error('Error in mood real-time listener:', error);
            if (!moodPollingInterval) {
                moodPollingInterval = setInterval(() => {
                    loadMoodHistoryState(limitCount);
                }, 5000);
            }
        });
        window.firestoreUnsubscribers.push(moodRealtimeUnsubscribe);
    } catch (error) {
        console.log('Error setting up mood real-time listener:', error);
    }
}

function setupJournalRealtimeListener(limitCount = 50) {
    if (!appState.currentUser || !db) return;

    const query = db.collection('users').doc(appState.currentUser.uid)
        .collection('journal')
        .orderBy('timestamp', 'desc')
        .limit(limitCount);

    try {
        journalRealtimeUnsubscribe = query.onSnapshot((snapshot) => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            appState.journalEntries = items;

            if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') initAnalytics();
            if (appState.currentView === 'dashboard' && typeof initDashboard === 'function') initDashboard();
            if (appState.currentView === 'journal' && typeof window.loadJournalEntries === 'function') window.loadJournalEntries();
        }, (error) => {
            console.error('Error in journal real-time listener:', error);
            if (!journalPollingInterval) {
                journalPollingInterval = setInterval(() => {
                    loadJournalEntriesState(limitCount);
                }, 5000);
            }
        });
        window.firestoreUnsubscribers.push(journalRealtimeUnsubscribe);
    } catch (error) {
        console.log('Error setting up journal real-time listener:', error);
    }
}

function setupXPDailyRealtimeListener(limitCount = 120) {
    if (!appState.currentUser || !db || !firebase || !firebase.firestore) return;

    const idPath = firebase.firestore.FieldPath.documentId();
    const query = db.collection('users').doc(appState.currentUser.uid)
        .collection('xpDaily')
        .orderBy(idPath, 'desc')
        .limit(limitCount);

    try {
        xpDailyRealtimeUnsubscribe = query.onSnapshot((snapshot) => {
            appState.xpDailyHistory = appState.xpDailyHistory || {};
            snapshot.forEach(doc => {
                const data = doc.data() || {};
                if (typeof data.xp === 'number') {
                    appState.xpDailyHistory[doc.id] = data.xp;
                }
            });

            if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') initAnalytics();
            if (appState.currentView === 'dashboard' && typeof initDashboard === 'function') initDashboard();
        }, (error) => {
            console.error('Error in xpDaily real-time listener:', error);
            if (!xpDailyPollingInterval) {
                xpDailyPollingInterval = setInterval(() => {
                    if (typeof loadXPDailyHistory === 'function') loadXPDailyHistory(30);
                }, 5000);
            }
        });
        window.firestoreUnsubscribers.push(xpDailyRealtimeUnsubscribe);
    } catch (error) {
        console.log('Error setting up xpDaily real-time listener:', error);
    }
}

// Load journal entries into appState for analytics/dashboard (does not render UI)
async function loadJournalEntriesState(limitCount = 50) {
    if (!appState.currentUser || !db) return;
    
    try {
        const entriesSnapshot = await db.collection('users')
            .doc(appState.currentUser.uid)
            .collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(limitCount)
            .get();
        
        appState.journalEntries = [];
        entriesSnapshot.forEach(doc => {
            appState.journalEntries.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.log('Error loading journal entries:', error);
    }
}

// Load mood history into appState for analytics/dashboard (does not render UI)
async function loadMoodHistoryState(limitCount = 120) {
    if (!appState.currentUser || !db) return;
    
    try {
        const moodSnapshot = await db.collection('users')
            .doc(appState.currentUser.uid)
            .collection('mood')
            .orderBy('date', 'desc')
            .limit(limitCount)
            .get();
        
        appState.moodHistory = [];
        moodSnapshot.forEach(doc => {
            appState.moodHistory.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.log('Error loading mood stats:', error);
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Firebase is initialized in firebase-config.js
    // Just check if it's ready
    if (!auth || !db) {
        console.warn('Firebase not ready yet, retrying...');
        setTimeout(() => {
            if (!auth || !db) {
                console.warn('Firebase not available. App will work in offline mode.');
            }
        }, 500);
    }
    
    // Set up auth listener (will retry internally if Firebase not ready)
    initAuthListener();
    
    // Initialize UI regardless of Firebase status
    initApp();
    
    // Start monitoring date changes for new day detection
    startDateMonitor();
});

// Monitor date changes and update app after midnight
function startDateMonitor() {
    // Clear existing interval if any
    if (dateMonitorInterval) {
        clearInterval(dateMonitorInterval);
    }
    // Check if date has changed every minute
    dateMonitorInterval = setInterval(() => {
        const now = new Date();
        const oldDate = getDateString(appState.currentDate);
        const newDate = getDateString(now);
        
        if (oldDate !== newDate) {
            console.log(`[Date] Updated from ${oldDate} to ${newDate}`);
            appState.currentDate = now;
            
            // Reset task view for new day
            if (typeof loadTasksForDate === 'function') {
                loadTasksForDate();
            }
            if (typeof updateProgress === 'function') {
                updateProgress();
            }
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
            
            showToast('✨ New day! Fresh tasks loaded', 'success');
        }
    }, 60000); // Check every minute
}
