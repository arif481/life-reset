// Data Loading Functions

async function loadUserData() {
    if (!appState.currentUser || !db) return;
    
    try {
        const unsubscribe = db.collection('users').doc(appState.currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Load stats
                    if (data.stats) {
                        appState.userStats = { ...appState.userStats, ...data.stats };
                    }
                    
                    // Load goals
                    if (data.goals) {
                        appState.userGoals = data.goals;
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
                    
                    updateGamificationUI();
                    renderBadges();
                    renderGoals();
                    renderHabitChain();
                }
            }, (error) => {
                console.error('Error loading user data:', error);
                // Don't let Firestore errors stop the app
            });
        
        // Store unsubscribe function if needed for cleanup
        if (!window.firestoreUnsubscribers) {
            window.firestoreUnsubscribers = [];
        }
        window.firestoreUnsubscribers.push(unsubscribe);
    } catch (error) {
        console.log('Error setting up user data listener:', error);
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
