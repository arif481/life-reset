// App Configuration and Global State
const APP_CONFIG = {
    appName: 'Life Reset: Recovery & Growth Platform',
    version: '1.0.0'
};

// Firebase initialization will happen after firebase-config.js loads
let auth, db;

function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
    } else {
        console.error('Firebase SDK not loaded');
    }
}

// Global app state
const appState = {
    currentUser: null,
    currentView: 'dashboard',
    currentDate: new Date(),
    selectedMood: null,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    userTasks: {},
    userGoals: [],
    userStats: {
        level: 1,
        xp: 0,
        xpNeeded: 100,
        tasksCompleted: 0,
        moodLogged: 0,
        journalEntries: 0,
        streak: 0,
        totalDays: 0,
        healthScore: 0,
        consistency: 0,
        unlockedBadges: []
    }
};

// Chart instances
let moodChart = null;
let completionChart = null;

// Default tasks organized by categories
const defaultTasks = {
    morning: [
        { id: 'wake_early', name: 'Wake up early', completed: false },
        { id: 'exercise', name: 'Do light exercise', completed: false },
        { id: 'breakfast', name: 'Eat a healthy breakfast', completed: false }
    ],
    health: [
        { id: 'water', name: 'Drink 8 glasses of water', completed: false },
        { id: 'meditation', name: 'Practice meditation (10 mins)', completed: false },
        { id: 'healthy_meal', name: 'Eat a balanced meal', completed: false }
    ],
    productivity: [
        { id: 'work', name: 'Complete work tasks', completed: false },
        { id: 'learning', name: 'Learn something new', completed: false },
        { id: 'organize', name: 'Organize workspace', completed: false }
    ],
    evening: [
        { id: 'reflect', name: 'Reflect on the day', completed: false },
        { id: 'gratitude', name: 'Write down 3 things you are grateful for', completed: false },
        { id: 'sleep', name: 'Go to bed by 10 PM', completed: false }
    ],
    custom: []
};

// Badges System Data
const badgesData = [
    { id: 'first_task', name: 'First Step', icon: '👣', description: 'Complete your first task', condition: 'tasksCompleted >= 1' },
    { id: 'task_master', name: 'Task Master', icon: '✅', description: 'Complete 50 tasks', condition: 'tasksCompleted >= 50' },
    { id: 'mood_tracker', name: 'Mood Watcher', icon: '🎯', description: 'Log mood 10 times', condition: 'moodLogged >= 10' },
    { id: 'journal_starter', name: 'Story Teller', icon: '📖', description: 'Write 5 journal entries', condition: 'journalEntries >= 5' },
    { id: 'week_warrior', name: 'Week Warrior', icon: '⚔️', description: 'Maintain 7-day streak', condition: 'streak >= 7' },
    { id: 'month_champion', name: 'Month Champion', icon: '👑', description: 'Maintain 30-day streak', condition: 'streak >= 30' },
    { id: 'health_guru', name: 'Health Guru', icon: '🧘', description: 'Reach 80+ health score', condition: 'healthScore >= 80' },
    { id: 'consistency_king', name: 'Consistency King', icon: '⭐', description: 'Maintain 90% consistency', condition: 'consistency >= 90' }
];

// Utility function: Show toast notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Set icon based on type
    if (type === 'success') toastIcon.className = 'fas fa-check-circle';
    else if (type === 'error') toastIcon.className = 'fas fa-exclamation-circle';
    else if (type === 'warning') toastIcon.className = 'fas fa-exclamation-triangle';
    else toastIcon.className = 'fas fa-info-circle';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility function: Format date to readable string
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Utility function: Get date string (YYYY-MM-DD)
function getDateString(date) {
    return date.toISOString().split('T')[0];
}
