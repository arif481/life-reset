/**
 * @fileoverview Analytics Data Layer
 * @description Handles data aggregation for analytics
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get date range based on period
 * @param {string} period - 'week' | 'month' | 'year'
 * @returns {{ start: Date, end: Date }}
 */
function getDateRange(period) {
    const end = new Date();
    let start = new Date();
    
    switch (period) {
        case 'week':
            start.setDate(end.getDate() - 7);
            break;
        case 'month':
            start.setDate(end.getDate() - 30);
            break;
        case 'year':
            start.setFullYear(end.getFullYear() - 1);
            break;
        default:
            start.setDate(end.getDate() - 7);
    }
    
    return { start, end };
}

/**
 * Get date labels for chart
 * @param {string} period - Period type
 * @returns {string[]}
 */
function getDateLabels(period) {
    const labels = [];
    const { start, end } = getDateRange(period);
    const current = new Date(start);
    
    while (current <= end) {
        if (period === 'year') {
            labels.push(current.toLocaleString('default', { month: 'short' }));
            current.setMonth(current.getMonth() + 1);
        } else {
            labels.push(current.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' }));
            current.setDate(current.getDate() + 1);
        }
    }
    
    return labels;
}

// ============================================================================
// Task Analytics
// ============================================================================

/**
 * Get task completion data
 * @param {string} period - Period type
 * @returns {Promise<Object>}
 */
async function getTaskCompletionData(period = 'week') {
    if (!window.db || !window.appState?.currentUser) {
        return { labels: [], completed: [], total: [] };
    }
    
    const { start, end } = getDateRange(period);
    const labels = getDateLabels(period);
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('tasks')
            .where('createdAt', '>=', start)
            .get();
        
        const dailyData = {};
        
        snapshot.forEach(doc => {
            const task = doc.data();
            const dateKey = task.date || (task.createdAt?.toDate?.() || new Date()).toISOString().split('T')[0];
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { total: 0, completed: 0 };
            }
            
            dailyData[dateKey].total++;
            if (task.completed) dailyData[dateKey].completed++;
        });
        
        const completed = [];
        const total = [];
        const current = new Date(start);
        
        while (current <= end) {
            const dateKey = current.toISOString().split('T')[0];
            const dayData = dailyData[dateKey] || { total: 0, completed: 0 };
            
            completed.push(dayData.completed);
            total.push(dayData.total);
            
            current.setDate(current.getDate() + 1);
        }
        
        return { labels, completed, total };
    } catch (error) {
        console.error('[AnalyticsData] Error getting task data:', error);
        return { labels, completed: [], total: [] };
    }
}

/**
 * Get task statistics
 * @returns {Promise<Object>}
 */
async function getTaskStats() {
    if (!window.db || !window.appState?.currentUser) {
        return { total: 0, completed: 0, rate: 0 };
    }
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('tasks').get();
        
        let total = 0;
        let completed = 0;
        
        snapshot.forEach(doc => {
            total++;
            if (doc.data().completed) completed++;
        });
        
        return {
            total,
            completed,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    } catch (error) {
        console.error('[AnalyticsData] Error getting task stats:', error);
        return { total: 0, completed: 0, rate: 0 };
    }
}

// ============================================================================
// Habit Analytics
// ============================================================================

/**
 * Get habit streak data
 * @param {string} period - Period type
 * @returns {Promise<Object>}
 */
async function getHabitData(period = 'week') {
    if (!window.db || !window.appState?.currentUser) {
        return { labels: [], streaks: [], habits: [] };
    }
    
    const labels = getDateLabels(period);
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('habits').get();
        
        const habits = [];
        snapshot.forEach(doc => {
            habits.push({ id: doc.id, ...doc.data() });
        });
        
        const streaks = habits.map(h => h.currentStreak || 0);
        
        return {
            labels: habits.map(h => h.name),
            streaks,
            habits
        };
    } catch (error) {
        console.error('[AnalyticsData] Error getting habit data:', error);
        return { labels: [], streaks: [], habits: [] };
    }
}

/**
 * Get habit completion rate
 * @returns {Promise<number>}
 */
async function getHabitCompletionRate() {
    if (!window.db || !window.appState?.currentUser) return 0;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('habits').get();
        
        let completedToday = 0;
        let total = 0;
        
        snapshot.forEach(doc => {
            const habit = doc.data();
            total++;
            if (habit.completedDates && habit.completedDates.includes(today)) {
                completedToday++;
            }
        });
        
        return total > 0 ? Math.round((completedToday / total) * 100) : 0;
    } catch (error) {
        console.error('[AnalyticsData] Error getting habit rate:', error);
        return 0;
    }
}

// ============================================================================
// Mood Analytics
// ============================================================================

/**
 * Get mood data
 * @param {string} period - Period type
 * @returns {Promise<Object>}
 */
async function getMoodData(period = 'week') {
    if (!window.db || !window.appState?.currentUser) {
        return { labels: [], values: [], entries: [] };
    }
    
    const { start, end } = getDateRange(period);
    const labels = getDateLabels(period);
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('moods')
            .where('timestamp', '>=', start)
            .orderBy('timestamp')
            .get();
        
        const moodValues = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };
        const dailyMoods = {};
        
        snapshot.forEach(doc => {
            const mood = doc.data();
            const dateKey = mood.date || (mood.timestamp?.toDate?.() || new Date()).toISOString().split('T')[0];
            
            dailyMoods[dateKey] = moodValues[mood.mood] || 3;
        });
        
        const values = [];
        const current = new Date(start);
        
        while (current <= end) {
            const dateKey = current.toISOString().split('T')[0];
            values.push(dailyMoods[dateKey] || null);
            current.setDate(current.getDate() + 1);
        }
        
        return { labels, values };
    } catch (error) {
        console.error('[AnalyticsData] Error getting mood data:', error);
        return { labels, values: [] };
    }
}

/**
 * Get mood distribution
 * @param {string} period - Period type  
 * @returns {Promise<Object>}
 */
async function getMoodDistribution(period = 'month') {
    if (!window.db || !window.appState?.currentUser) {
        return { 'very-sad': 0, 'sad': 0, 'okay': 0, 'good': 0, 'great': 0 };
    }
    
    const { start } = getDateRange(period);
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('moods')
            .where('timestamp', '>=', start)
            .get();
        
        const distribution = { 'very-sad': 0, 'sad': 0, 'okay': 0, 'good': 0, 'great': 0 };
        
        snapshot.forEach(doc => {
            const mood = doc.data().mood;
            if (distribution.hasOwnProperty(mood)) {
                distribution[mood]++;
            }
        });
        
        return distribution;
    } catch (error) {
        console.error('[AnalyticsData] Error getting mood distribution:', error);
        return { 'very-sad': 0, 'sad': 0, 'okay': 0, 'good': 0, 'great': 0 };
    }
}

// ============================================================================
// Journal Analytics
// ============================================================================

/**
 * Get journal stats
 * @param {string} period - Period type
 * @returns {Promise<Object>}
 */
async function getJournalStats(period = 'month') {
    if (!window.db || !window.appState?.currentUser) {
        return { count: 0, avgWords: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } };
    }
    
    const { start } = getDateRange(period);
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('journal')
            .where('timestamp', '>=', start)
            .get();
        
        let count = 0;
        let totalWords = 0;
        const sentiment = { positive: 0, neutral: 0, negative: 0 };
        
        snapshot.forEach(doc => {
            const entry = doc.data();
            count++;
            totalWords += entry.wordCount || 0;
            
            if (entry.sentiment && sentiment.hasOwnProperty(entry.sentiment)) {
                sentiment[entry.sentiment]++;
            }
        });
        
        return {
            count,
            avgWords: count > 0 ? Math.round(totalWords / count) : 0,
            sentiment
        };
    } catch (error) {
        console.error('[AnalyticsData] Error getting journal stats:', error);
        return { count: 0, avgWords: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } };
    }
}

// ============================================================================
// Exports
// ============================================================================

const AnalyticsData = {
    getDateRange,
    getDateLabels,
    getTaskCompletionData,
    getTaskStats,
    getHabitData,
    getHabitCompletionRate,
    getMoodData,
    getMoodDistribution,
    getJournalStats
};

window.AnalyticsData = AnalyticsData;
