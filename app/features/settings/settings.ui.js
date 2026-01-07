/**
 * @fileoverview Settings UI Components
 * @description Renders settings interface
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Theme Management
// ============================================================================

/**
 * Apply dark mode
 * @param {boolean} isDark - Whether to enable dark mode
 */
function applyDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update meta theme color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.content = isDark ? '#1a1a2e' : '#4361ee';
    }
}

/**
 * Toggle dark mode
 * @returns {boolean} New dark mode state
 */
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    applyDarkMode(isDark);
    return isDark;
}

// ============================================================================
// Settings Form
// ============================================================================

/**
 * Render settings form
 * @param {string} containerId - Container element ID
 * @param {Object} settings - Current settings
 * @param {Object} handlers - Event handlers
 */
function renderSettingsForm(containerId, settings, handlers = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-section">
            <h3><i class="fas fa-palette"></i> Appearance</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Dark Mode</label>
                    <span class="setting-description">Use dark theme for better night viewing</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="darkModeToggle" ${settings.darkMode ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-bell"></i> Notifications</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Push Notifications</label>
                    <span class="setting-description">Get reminders for your tasks and habits</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="notificationsToggle" ${settings.notifications ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Daily Reminder Time</label>
                    <span class="setting-description">When to receive your daily reminder</span>
                </div>
                <input type="time" id="reminderTimeInput" value="${settings.reminderTime || '09:00'}" class="setting-input">
            </div>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-target"></i> Goals</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Weekly Task Goal</label>
                    <span class="setting-description">Number of tasks to complete each week</span>
                </div>
                <input type="number" id="weeklyGoalInput" value="${settings.weeklyGoal || 5}" min="1" max="50" class="setting-input">
            </div>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-volume-up"></i> Sounds</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Sound Effects</label>
                    <span class="setting-description">Play sounds for achievements and completions</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="soundEffectsToggle" ${settings.soundEffects ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-database"></i> Data</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <label>Export Format</label>
                    <span class="setting-description">Format for data exports</span>
                </div>
                <select id="dataExportFormat" class="setting-select">
                    <option value="json" ${settings.dataExport === 'json' ? 'selected' : ''}>JSON</option>
                    <option value="csv" ${settings.dataExport === 'csv' ? 'selected' : ''}>CSV</option>
                </select>
            </div>
            <div class="settings-actions">
                <button class="btn btn-secondary" id="exportDataBtn">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button class="btn btn-secondary" id="importDataBtn">
                    <i class="fas fa-upload"></i> Import Data
                </button>
                <input type="file" id="importFileInput" accept=".json" style="display: none;">
            </div>
        </div>
        
        <div class="settings-section danger-zone">
            <h3><i class="fas fa-exclamation-triangle"></i> Danger Zone</h3>
            <div class="settings-actions">
                <button class="btn btn-danger" id="resetSettingsBtn">
                    <i class="fas fa-undo"></i> Reset Settings
                </button>
                <button class="btn btn-danger" id="deleteAllDataBtn">
                    <i class="fas fa-trash"></i> Delete All Data
                </button>
            </div>
        </div>
    `;
    
    // Attach event listeners
    attachSettingsEventListeners(handlers);
}

/**
 * Attach event listeners to settings form
 * @param {Object} handlers - Event handlers
 */
function attachSettingsEventListeners(handlers) {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if (handlers.onDarkModeChange) {
                handlers.onDarkModeChange(e.target.checked);
            }
        });
    }
    
    // Notifications toggle
    const notificationsToggle = document.getElementById('notificationsToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            if (handlers.onNotificationsChange) {
                handlers.onNotificationsChange(e.target.checked);
            }
        });
    }
    
    // Reminder time
    const reminderTimeInput = document.getElementById('reminderTimeInput');
    if (reminderTimeInput) {
        reminderTimeInput.addEventListener('change', (e) => {
            if (handlers.onReminderTimeChange) {
                handlers.onReminderTimeChange(e.target.value);
            }
        });
    }
    
    // Weekly goal
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');
    if (weeklyGoalInput) {
        weeklyGoalInput.addEventListener('change', (e) => {
            if (handlers.onWeeklyGoalChange) {
                handlers.onWeeklyGoalChange(parseInt(e.target.value, 10));
            }
        });
    }
    
    // Sound effects
    const soundEffectsToggle = document.getElementById('soundEffectsToggle');
    if (soundEffectsToggle) {
        soundEffectsToggle.addEventListener('change', (e) => {
            if (handlers.onSoundEffectsChange) {
                handlers.onSoundEffectsChange(e.target.checked);
            }
        });
    }
    
    // Export format
    const dataExportFormat = document.getElementById('dataExportFormat');
    if (dataExportFormat) {
        dataExportFormat.addEventListener('change', (e) => {
            if (handlers.onExportFormatChange) {
                handlers.onExportFormatChange(e.target.value);
            }
        });
    }
    
    // Export button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            if (handlers.onExportData) handlers.onExportData();
        });
    }
    
    // Import button
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        importFileInput.addEventListener('change', (e) => {
            if (handlers.onImportData && e.target.files[0]) {
                handlers.onImportData(e.target.files[0]);
            }
        });
    }
    
    // Reset settings
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (handlers.onResetSettings) handlers.onResetSettings();
        });
    }
    
    // Delete all data
    const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
    if (deleteAllDataBtn) {
        deleteAllDataBtn.addEventListener('click', () => {
            if (handlers.onDeleteAllData) handlers.onDeleteAllData();
        });
    }
}

// ============================================================================
// Profile UI
// ============================================================================

/**
 * Render profile section
 * @param {string} containerId - Container element ID
 * @param {Object} user - User data
 * @param {Object} profile - Profile data
 */
function renderProfileSection(containerId, user, profile) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const displayName = profile?.displayName || user?.displayName || 'User';
    const email = user?.email || 'Not logged in';
    const photoURL = profile?.photoURL || user?.photoURL || null;
    
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                ${photoURL ? 
                    `<img src="${photoURL}" alt="Profile" />` : 
                    `<i class="fas fa-user"></i>`
                }
            </div>
            <div class="profile-info">
                <h2 class="profile-name">${escapeHtml(displayName)}</h2>
                <p class="profile-email">${escapeHtml(email)}</p>
            </div>
        </div>
    `;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// Exports
// ============================================================================

export const SettingsUI = {
    applyDarkMode,
    toggleDarkMode,
    renderSettingsForm,
    renderProfileSection,
    attachSettingsEventListeners
};

if (typeof window !== 'undefined') {
    window.SettingsUI = SettingsUI;
    window.applyDarkMode = applyDarkMode;
    window.toggleDarkMode = toggleDarkMode;
}
