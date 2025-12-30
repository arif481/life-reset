/**
 * @fileoverview Application State Management
 * @description Centralized state management, configuration, and utility functions
 * @version 1.0.0
 * @license MIT
 */

'use strict';

/* ==========================================================================
   Application Configuration
   ========================================================================== */

const APP_CONFIG = {
    appName: 'Life Reset: Recovery & Growth Platform',
    version: '1.0.0'
};

/* ==========================================================================
   Firebase References
   ========================================================================== */

// Firebase auth and db are initialized in firebase-config.js (loaded first)
// Global variables: auth, db

/* ==========================================================================
   Application State
   ========================================================================== */

const appState = {
    currentUser: null,
    currentView: 'dashboard',
    currentDate: new Date(),
    selectedMood: null,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    userTasks: {},
    // Computed/loaded history maps for analytics
    tasksHistory: {}, // { 'YYYY-MM-DD': { completed: number, total: number, rate: number } }
    xpDailyHistory: {}, // { 'YYYY-MM-DD': number }
    userGoals: [],
    journalEntries: [],
    moodHistory: [],
    badHabits: {},
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

/* ==========================================================================
   Chart Instances
   ========================================================================== */

let moodChart = null;
let completionChart = null;

/* ==========================================================================
   Default Task Configuration
   ========================================================================== */

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

/* ==========================================================================
   Achievement Badge Definitions
   ========================================================================== */

const badgesData = [
    { id: 'first_task', name: 'First Step', icon: '👣', description: 'Complete your first task', condition: 'appState.userStats.tasksCompleted >= 1' },
    { id: 'task_master', name: 'Task Master', icon: '✅', description: 'Complete 50 tasks', condition: 'appState.userStats.tasksCompleted >= 50' },
    { id: 'mood_tracker', name: 'Mood Watcher', icon: '🎯', description: 'Log mood 10 times', condition: 'appState.userStats.moodLogged >= 10' },
    { id: 'journal_starter', name: 'Story Teller', icon: '📖', description: 'Write 5 journal entries', condition: 'appState.userStats.journalEntries >= 5' },
    { id: 'week_warrior', name: 'Week Warrior', icon: '⚔️', description: 'Maintain 7-day streak', condition: 'appState.userStats.streak >= 7' },
    { id: 'month_champion', name: 'Month Champion', icon: '👑', description: 'Maintain 30-day streak', condition: 'appState.userStats.streak >= 30' },
    { id: 'health_guru', name: 'Health Guru', icon: '🧘', description: 'Reach 80+ health score', condition: 'appState.userStats.healthScore >= 80' },
    { id: 'consistency_king', name: 'Consistency King', icon: '⭐', description: 'Maintain 90% consistency', condition: 'appState.userStats.consistency >= 90' }
];

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/**
 * Display a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} type - Notification type: 'info' | 'success' | 'warning' | 'error'
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Guard against missing DOM elements
    if (!toast || !toastMessage) {
        console.warn('Toast elements not found:', message);
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Set icon based on type
    if (toastIcon) {
        if (type === 'success') toastIcon.className = 'fas fa-check-circle';
        else if (type === 'error') toastIcon.className = 'fas fa-exclamation-circle';
        else if (type === 'warning') toastIcon.className = 'fas fa-exclamation-triangle';
        else toastIcon.className = 'fas fa-info-circle';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Format a date object to a human-readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Monday, January 1, 2024")
 */
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Convert a date to ISO date string format
 * @param {Date} date - The date to convert
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getDateString(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} HTML-escaped string safe for DOM insertion
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
