/**
 * @fileoverview Settings Data Layer
 * @description Handles user settings persistence
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS = {
    darkMode: false,
    notifications: true,
    reminderTime: '09:00',
    weeklyGoal: 5,
    soundEffects: true,
    dataExport: 'json',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Get user settings
 * @returns {Promise<Object>}
 */
async function getSettings() {
    // Try to get from Firebase first
    if (window.db && window.appState?.currentUser) {
        try {
            const doc = await window.db.collection('users').doc(window.appState.currentUser.uid).get();
            if (doc.exists && doc.data().settings) {
                return { ...DEFAULT_SETTINGS, ...doc.data().settings };
            }
        } catch (error) {
            console.error('[SettingsData] Firebase error:', error);
        }
    }
    
    // Fall back to localStorage
    const stored = localStorage.getItem('lifeResetSettings');
    if (stored) {
        try {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
            console.error('[SettingsData] Parse error:', e);
        }
    }
    
    return { ...DEFAULT_SETTINGS };
}

/**
 * Save user settings
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
async function saveSettings(settings) {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    
    // Save to localStorage always
    localStorage.setItem('lifeResetSettings', JSON.stringify(merged));
    
    // Save to Firebase if logged in
    if (window.db && window.appState?.currentUser) {
        try {
            await window.db.collection('users').doc(window.appState.currentUser.uid).set({
                settings: merged
            }, { merge: true });
        } catch (error) {
            console.error('[SettingsData] Firebase save error:', error);
            throw error;
        }
    }
}

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @returns {Promise<void>}
 */
async function updateSetting(key, value) {
    const current = await getSettings();
    current[key] = value;
    await saveSettings(current);
}

/**
 * Reset settings to defaults
 * @returns {Promise<void>}
 */
async function resetSettings() {
    await saveSettings(DEFAULT_SETTINGS);
}

// ============================================================================
// User Profile Operations
// ============================================================================

/**
 * Get user profile
 * @returns {Promise<Object>}
 */
async function getUserProfile() {
    if (!window.db || !window.appState?.currentUser) {
        return null;
    }
    
    try {
        const doc = await window.db.collection('users').doc(window.appState.currentUser.uid).get();
        if (doc.exists) {
            return doc.data().profile || null;
        }
    } catch (error) {
        console.error('[SettingsData] Profile load error:', error);
    }
    
    return null;
}

/**
 * Update user profile
 * @param {Object} profile - Profile data
 * @returns {Promise<void>}
 */
async function updateUserProfile(profile) {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    await window.db.collection('users').doc(window.appState.currentUser.uid).set({
        profile: profile
    }, { merge: true });
}

// ============================================================================
// Data Export/Import
// ============================================================================

/**
 * Export all user data
 * @returns {Promise<Object>}
 */
async function exportAllData() {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    const uid = window.appState.currentUser.uid;
    const exportData = {
        exportDate: new Date().toISOString(),
        settings: await getSettings(),
        tasks: [],
        habits: [],
        moods: [],
        journal: [],
        gamification: null
    };
    
    try {
        // Export tasks
        const tasksSnapshot = await window.db.collection('users').doc(uid)
            .collection('tasks').get();
        tasksSnapshot.forEach(doc => {
            exportData.tasks.push({ id: doc.id, ...doc.data() });
        });
        
        // Export habits
        const habitsSnapshot = await window.db.collection('users').doc(uid)
            .collection('habits').get();
        habitsSnapshot.forEach(doc => {
            exportData.habits.push({ id: doc.id, ...doc.data() });
        });
        
        // Export moods
        const moodsSnapshot = await window.db.collection('users').doc(uid)
            .collection('moods').limit(1000).get();
        moodsSnapshot.forEach(doc => {
            exportData.moods.push({ id: doc.id, ...doc.data() });
        });
        
        // Export journal
        const journalSnapshot = await window.db.collection('users').doc(uid)
            .collection('journal').limit(1000).get();
        journalSnapshot.forEach(doc => {
            exportData.journal.push({ id: doc.id, ...doc.data() });
        });
        
        // Export gamification data
        const userDoc = await window.db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            exportData.gamification = userDoc.data().gamification || null;
        }
        
    } catch (error) {
        console.error('[SettingsData] Export error:', error);
        throw error;
    }
    
    return exportData;
}

/**
 * Import user data
 * @param {Object} data - Data to import
 * @returns {Promise<Object>} Import results
 */
async function importData(data) {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    const uid = window.appState.currentUser.uid;
    const results = {
        settings: false,
        tasks: 0,
        habits: 0,
        moods: 0,
        journal: 0
    };
    
    try {
        // Import settings
        if (data.settings) {
            await saveSettings(data.settings);
            results.settings = true;
        }
        
        // Import tasks
        if (data.tasks && Array.isArray(data.tasks)) {
            for (const task of data.tasks) {
                const { id, ...taskData } = task;
                await window.db.collection('users').doc(uid)
                    .collection('tasks').add(taskData);
                results.tasks++;
            }
        }
        
        // Import habits
        if (data.habits && Array.isArray(data.habits)) {
            for (const habit of data.habits) {
                const { id, ...habitData } = habit;
                await window.db.collection('users').doc(uid)
                    .collection('habits').add(habitData);
                results.habits++;
            }
        }
        
        // Import moods
        if (data.moods && Array.isArray(data.moods)) {
            for (const mood of data.moods) {
                const { id, ...moodData } = mood;
                await window.db.collection('users').doc(uid)
                    .collection('moods').add(moodData);
                results.moods++;
            }
        }
        
        // Import journal
        if (data.journal && Array.isArray(data.journal)) {
            for (const entry of data.journal) {
                const { id, ...entryData } = entry;
                await window.db.collection('users').doc(uid)
                    .collection('journal').add(entryData);
                results.journal++;
            }
        }
        
    } catch (error) {
        console.error('[SettingsData] Import error:', error);
        throw error;
    }
    
    return results;
}

/**
 * Delete all user data
 * @returns {Promise<void>}
 */
async function deleteAllData() {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    const uid = window.appState.currentUser.uid;
    const collections = ['tasks', 'habits', 'moods', 'journal'];
    
    for (const collectionName of collections) {
        const snapshot = await window.db.collection('users').doc(uid)
            .collection(collectionName).get();
        
        const batch = window.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    }
    
    // Clear localStorage
    localStorage.removeItem('lifeResetSettings');
}

// ============================================================================
// Exports
// ============================================================================

export const SettingsData = {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    getUserProfile,
    updateUserProfile,
    exportAllData,
    importData,
    deleteAllData
};

if (typeof window !== 'undefined') {
    window.SettingsData = SettingsData;
}
