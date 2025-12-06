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
            });
        
        // Store unsubscribe function if needed for cleanup
        if (!window.firestoreUnsubscribers) {
            window.firestoreUnsubscribers = [];
        }
        window.firestoreUnsubscribers.push(unsubscribe);
    } catch (error) {
        console.log('Error loading user data:', error);
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    initAuthListener();
    initApp();
});
