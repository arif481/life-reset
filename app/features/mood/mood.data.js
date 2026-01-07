/**
 * @fileoverview Mood Data Layer
 * @description Handles Firebase/Firestore operations for mood entries
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Mood Entry Operations
// ============================================================================

/**
 * Save a mood entry for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {Object} moodData - Mood entry data
 * @returns {Promise<void>}
 */
async function saveMoodEntry(dateString, moodData) {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    const entry = {
        mood: moodData.mood,
        intensity: moodData.intensity,
        note: moodData.note || '',
        triggers: moodData.triggers || [],
        timestamp: new Date(),
        date: dateString
    };
    
    await window.db.collection('users').doc(window.appState.currentUser.uid)
        .collection('mood').doc(dateString)
        .set(entry, { merge: true });
    
    // Cache locally
    if (window.OfflineManager) {
        await window.OfflineManager.cacheData(`mood_${dateString}`, 'mood', entry);
    }
}

/**
 * Get mood entry for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>}
 */
async function getMoodForDate(dateString) {
    if (!window.db || !window.appState?.currentUser) {
        return null;
    }
    
    try {
        const doc = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('mood').doc(dateString).get();
        
        if (doc.exists) {
            const data = doc.data();
            // Cache locally
            if (window.OfflineManager) {
                await window.OfflineManager.cacheData(`mood_${dateString}`, 'mood', data);
            }
            return data;
        }
    } catch (error) {
        console.error('[MoodData] Error loading mood:', error);
        
        // Try cache fallback
        if (window.OfflineManager) {
            return await window.OfflineManager.getCachedData(`mood_${dateString}`);
        }
    }
    
    return null;
}

/**
 * Get mood entries for a date range
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD (optional, defaults to today)
 * @returns {Promise<Array>}
 */
async function getMoodRange(startDate, endDate = null) {
    if (!window.db || !window.appState?.currentUser) {
        return [];
    }
    
    const end = endDate || new Date().toISOString().split('T')[0];
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('mood')
            .where('date', '>=', startDate)
            .where('date', '<=', end)
            .orderBy('date', 'desc')
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });
        
        return entries;
    } catch (error) {
        console.error('[MoodData] Error loading mood range:', error);
        return [];
    }
}

/**
 * Get mood entries for the last N days
 * @param {number} days - Number of days
 * @returns {Promise<Array>}
 */
async function getMoodHistory(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return getMoodRange(startDate.toISOString().split('T')[0]);
}

/**
 * Check if mood is logged for today
 * @returns {Promise<boolean>}
 */
async function isMoodLoggedToday() {
    const today = new Date().toISOString().split('T')[0];
    const mood = await getMoodForDate(today);
    return mood !== null;
}

// ============================================================================
// Exports
// ============================================================================

export const MoodData = {
    saveMoodEntry,
    getMoodForDate,
    getMoodRange,
    getMoodHistory,
    isMoodLoggedToday
};

if (typeof window !== 'undefined') {
    window.MoodData = MoodData;
}
