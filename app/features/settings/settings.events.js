/**
 * @fileoverview Settings Event Handlers
 * @description Orchestrates settings functionality
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let currentSettings = null;

// ============================================================================
// Initialize Settings
// ============================================================================

/**
 * Initialize settings
 */
async function initSettings() {
    console.log('[SettingsEvents] Initializing settings');
    
    // Load settings
    currentSettings = window.SettingsData ? 
        await window.SettingsData.getSettings() : 
        { darkMode: false, notifications: true, reminderTime: '09:00', weeklyGoal: 5, soundEffects: true, dataExport: 'json' };
    
    // Apply dark mode immediately
    if (window.SettingsUI) {
        window.SettingsUI.applyDarkMode(currentSettings.darkMode);
    } else {
        if (currentSettings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Render settings form
    if (window.SettingsUI) {
        window.SettingsUI.renderSettingsForm('settingsFormContainer', currentSettings, {
            onDarkModeChange: handleDarkModeChange,
            onNotificationsChange: handleNotificationsChange,
            onReminderTimeChange: handleReminderTimeChange,
            onWeeklyGoalChange: handleWeeklyGoalChange,
            onSoundEffectsChange: handleSoundEffectsChange,
            onExportFormatChange: handleExportFormatChange,
            onExportData: handleExportData,
            onImportData: handleImportData,
            onResetSettings: handleResetSettings,
            onDeleteAllData: handleDeleteAllData
        });
    }
    
    // Render profile
    if (window.SettingsUI && window.appState?.currentUser) {
        const profile = window.SettingsData ? await window.SettingsData.getUserProfile() : null;
        window.SettingsUI.renderProfileSection('profileContainer', window.appState.currentUser, profile);
    }
}

// ============================================================================
// Setting Change Handlers
// ============================================================================

/**
 * Handle dark mode change
 * @param {boolean} isDark - Dark mode enabled
 */
async function handleDarkModeChange(isDark) {
    currentSettings.darkMode = isDark;
    
    if (window.SettingsUI) {
        window.SettingsUI.applyDarkMode(isDark);
    } else {
        document.body.classList.toggle('dark-mode', isDark);
    }
    
    await saveSetting('darkMode', isDark);
    
    if (typeof showToast === 'function') {
        showToast(isDark ? 'Dark mode enabled' : 'Dark mode disabled', 'success');
    }
}

/**
 * Handle notifications change
 * @param {boolean} enabled - Notifications enabled
 */
async function handleNotificationsChange(enabled) {
    if (enabled) {
        // Request notification permission
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                if (typeof showToast === 'function') {
                    showToast('Notification permission denied', 'error');
                }
                // Revert toggle
                const toggle = document.getElementById('notificationsToggle');
                if (toggle) toggle.checked = false;
                return;
            }
        }
    }
    
    currentSettings.notifications = enabled;
    await saveSetting('notifications', enabled);
    
    if (typeof showToast === 'function') {
        showToast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'success');
    }
}

/**
 * Handle reminder time change
 * @param {string} time - New reminder time
 */
async function handleReminderTimeChange(time) {
    currentSettings.reminderTime = time;
    await saveSetting('reminderTime', time);
    
    if (typeof showToast === 'function') {
        showToast(`Reminder set for ${time}`, 'success');
    }
}

/**
 * Handle weekly goal change
 * @param {number} goal - New weekly goal
 */
async function handleWeeklyGoalChange(goal) {
    currentSettings.weeklyGoal = goal;
    await saveSetting('weeklyGoal', goal);
    
    if (typeof showToast === 'function') {
        showToast(`Weekly goal set to ${goal} tasks`, 'success');
    }
}

/**
 * Handle sound effects change
 * @param {boolean} enabled - Sound effects enabled
 */
async function handleSoundEffectsChange(enabled) {
    currentSettings.soundEffects = enabled;
    await saveSetting('soundEffects', enabled);
    
    if (typeof showToast === 'function') {
        showToast(enabled ? 'Sound effects enabled' : 'Sound effects disabled', 'success');
    }
}

/**
 * Handle export format change
 * @param {string} format - Export format
 */
async function handleExportFormatChange(format) {
    currentSettings.dataExport = format;
    await saveSetting('dataExport', format);
}

/**
 * Save a single setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
async function saveSetting(key, value) {
    if (window.SettingsData) {
        await window.SettingsData.updateSetting(key, value);
    } else {
        // Fallback
        localStorage.setItem('lifeResetSettings', JSON.stringify(currentSettings));
    }
}

// ============================================================================
// Data Operations
// ============================================================================

/**
 * Handle data export
 */
async function handleExportData() {
    if (!window.appState?.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    try {
        if (typeof showToast === 'function') {
            showToast('Exporting data...', 'info');
        }
        
        let data;
        if (window.SettingsData) {
            data = await window.SettingsData.exportAllData();
        } else {
            // Fallback: basic export
            data = { exportDate: new Date().toISOString(), settings: currentSettings };
        }
        
        const format = currentSettings.dataExport || 'json';
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-reset-backup-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof showToast === 'function') {
            showToast('Data exported successfully!', 'success');
        }
    } catch (error) {
        console.error('[SettingsEvents] Export error:', error);
        if (typeof showToast === 'function') {
            showToast('Error exporting data: ' + error.message, 'error');
        }
    }
}

/**
 * Handle data import
 * @param {File} file - File to import
 */
async function handleImportData(file) {
    if (!window.appState?.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    if (!confirm('Import will add to your existing data. Continue?')) {
        return;
    }
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (typeof showToast === 'function') {
            showToast('Importing data...', 'info');
        }
        
        let results;
        if (window.SettingsData) {
            results = await window.SettingsData.importData(data);
        } else {
            results = { success: false };
        }
        
        if (typeof showToast === 'function') {
            showToast(`Import complete! Tasks: ${results.tasks}, Habits: ${results.habits}`, 'success');
        }
        
        // Reload the page to reflect changes
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (error) {
        console.error('[SettingsEvents] Import error:', error);
        if (typeof showToast === 'function') {
            showToast('Error importing data: ' + error.message, 'error');
        }
    }
}

/**
 * Handle settings reset
 */
async function handleResetSettings() {
    if (!confirm('Reset all settings to defaults?')) {
        return;
    }
    
    try {
        if (window.SettingsData) {
            await window.SettingsData.resetSettings();
        } else {
            localStorage.removeItem('lifeResetSettings');
        }
        
        if (typeof showToast === 'function') {
            showToast('Settings reset!', 'success');
        }
        
        // Reload settings
        await initSettings();
        
    } catch (error) {
        console.error('[SettingsEvents] Reset error:', error);
        if (typeof showToast === 'function') {
            showToast('Error resetting settings', 'error');
        }
    }
}

/**
 * Handle delete all data
 */
async function handleDeleteAllData() {
    if (!window.appState?.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    if (!confirm('DELETE ALL DATA? This cannot be undone!')) {
        return;
    }
    
    if (!confirm('Are you absolutely sure? All your tasks, habits, journal entries, and progress will be permanently deleted.')) {
        return;
    }
    
    try {
        if (typeof showToast === 'function') {
            showToast('Deleting all data...', 'info');
        }
        
        if (window.SettingsData) {
            await window.SettingsData.deleteAllData();
        }
        
        if (typeof showToast === 'function') {
            showToast('All data deleted', 'success');
        }
        
        // Reload the page
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (error) {
        console.error('[SettingsEvents] Delete error:', error);
        if (typeof showToast === 'function') {
            showToast('Error deleting data: ' + error.message, 'error');
        }
    }
}

// ============================================================================
// Legacy Support
// ============================================================================

/**
 * Legacy toggle dark mode
 */
function toggleDarkMode() {
    const isDark = !currentSettings.darkMode;
    handleDarkModeChange(isDark);
    
    // Update toggle if exists
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = isDark;
    
    return isDark;
}

/**
 * Get current settings
 * @returns {Object}
 */
function getSettings() {
    return currentSettings;
}

// ============================================================================
// Exports
// ============================================================================

export const SettingsEvents = {
    initSettings,
    handleDarkModeChange,
    handleNotificationsChange,
    handleReminderTimeChange,
    handleWeeklyGoalChange,
    handleSoundEffectsChange,
    handleExportData,
    handleImportData,
    handleResetSettings,
    handleDeleteAllData,
    toggleDarkMode,
    getSettings
};

if (typeof window !== 'undefined') {
    window.SettingsEvents = SettingsEvents;
    // Legacy support
    window.initSettings = initSettings;
    window.toggleDarkMode = toggleDarkMode;
    window.exportData = handleExportData;
    window.importData = handleImportData;
}
