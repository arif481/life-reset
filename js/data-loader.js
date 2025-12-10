// Data Loading Functions

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
                    }
                    
                    if (data.goals) {
                        appState.userGoals = data.goals;
                        renderGoals();
                    }
                    
                    if (data.badHabits) {
                        appState.badHabits = data.badHabits;
                        renderBadHabits();
                    }
                }
            }, (error) => {
                console.error('Error in real-time listener:', error);
            });
        
        // Store unsubscribe function for cleanup
        if (!window.firestoreUnsubscribers) {
            window.firestoreUnsubscribers = [];
        }
        window.firestoreUnsubscribers.push(unsubscribe);
    } catch (error) {
        console.log('Error setting up real-time listener:', error);
    }
}

async function loadCustomTasks() {
    if (!appState.currentUser || !db) return;
    
    try {
        const tasksSnapshot = await db.collection('users')
            .doc(appState.currentUser.uid)
            .collection('customTasks')
            .get();
        
        tasksSnapshot.forEach(doc => {
            const task = doc.data();
            if (!appState.userTasks[task.category]) {
                appState.userTasks[task.category] = [];
            }
            appState.userTasks[task.category].push({
                id: doc.id,
                ...task
            });
        });
    } catch (error) {
        console.log('Error loading custom tasks:', error);
    }
}

// Load journal entries
async function loadJournalEntries(daysBack = 30) {
    if (!appState.currentUser || !db) return;
    
    try {
        const entriesSnapshot = await db.collection('users')
            .doc(appState.currentUser.uid)
            .collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(daysBack)
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

// Load mood statistics for analytics
async function loadMoodStats(daysBack = 30) {
    if (!appState.currentUser || !db) return;
    
    try {
        const moodSnapshot = await db.collection('users')
            .doc(appState.currentUser.uid)
            .collection('mood')
            .orderBy('timestamp', 'desc')
            .limit(daysBack)
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
    // Initialize Firebase first
    if (!initializeFirebase()) {
        // Retry if Firebase didn't load yet
        setTimeout(() => {
            if (!initializeFirebase()) {
                console.warn('Firebase not available. App will work in offline mode.');
            }
        }, 500);
    }
    
    // Set up auth listener (will retry internally if Firebase not ready)
    initAuthListener();
    
    // Initialize UI regardless of Firebase status
    initApp();
});
