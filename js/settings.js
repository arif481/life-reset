// Advanced Settings System

// Settings state
const appSettings = {
    notifications: {
        enabled: localStorage.getItem('notificationsEnabled') !== 'false',
        taskReminders: localStorage.getItem('taskReminders') !== 'false',
        goalReminders: localStorage.getItem('goalReminders') !== 'false',
        moodReminders: localStorage.getItem('moodReminders') !== 'false',
        achievementNotifications: localStorage.getItem('achievementNotifications') !== 'false',
        soundEnabled: localStorage.getItem('soundEnabled') !== 'false'
    },
    appearance: {
        darkMode: localStorage.getItem('darkMode') === 'true',
        theme: localStorage.getItem('theme') || 'default',
        fontSize: localStorage.getItem('fontSize') || 'medium',
        animations: localStorage.getItem('animations') !== 'false',
        compactMode: localStorage.getItem('compactMode') === 'true'
    },
    privacy: {
        shareStats: localStorage.getItem('shareStats') === 'true',
        publicProfile: localStorage.getItem('publicProfile') === 'true',
        analytics: localStorage.getItem('analytics') !== 'false'
    },
    reminders: {
        dailyCheckIn: localStorage.getItem('dailyCheckIn') || '09:00',
        eveningReflection: localStorage.getItem('eveningReflection') || '21:00',
        moodTracking: localStorage.getItem('moodTracking') || '12:00'
    },
    backup: {
        autoBackup: localStorage.getItem('autoBackup') !== 'false',
        backupFrequency: localStorage.getItem('backupFrequency') || 'daily',
        lastBackup: localStorage.getItem('lastBackup') || 'Never'
    },
    gamification: {
        showXP: localStorage.getItem('showXP') !== 'false',
        showLevel: localStorage.getItem('showLevel') !== 'false',
        showBadges: localStorage.getItem('showBadges') !== 'false',
        celebrateAchievements: localStorage.getItem('celebrateAchievements') !== 'false',
        competitiveMode: localStorage.getItem('competitiveMode') === 'true'
    }
};

// Initialize settings
function initSettings() {
    loadSettingsUI();
    applySavedSettings();
}

// Load settings UI
function loadSettingsUI() {
    const container = document.getElementById('settings-view');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-header">
            <h1><i class="fas fa-cog"></i> Settings</h1>
            <p class="settings-subtitle">Customize your Life Reset experience</p>
        </div>

        <!-- Settings Tabs -->
        <div class="settings-tabs">
            <button class="settings-tab active" onclick="switchSettingsTab('general', this)">
                <i class="fas fa-sliders-h"></i> General
            </button>
            <button class="settings-tab" onclick="switchSettingsTab('notifications', this)">
                <i class="fas fa-bell"></i> Notifications
            </button>
            <button class="settings-tab" onclick="switchSettingsTab('appearance', this)">
                <i class="fas fa-palette"></i> Appearance
            </button>
            <button class="settings-tab" onclick="switchSettingsTab('privacy', this)">
                <i class="fas fa-shield-alt"></i> Privacy
            </button>
            <button class="settings-tab" onclick="switchSettingsTab('account', this)">
                <i class="fas fa-user"></i> Account
            </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
            <!-- General Settings -->
            <div id="general-settings" class="settings-panel active">
                <div class="settings-grid">
                    <!-- Profile Info -->
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-user-circle"></i>
                            <div class="setting-title">Profile Information</div>
                        </div>
                        <div class="setting-body">
                            <div class="profile-info">
                                <div class="profile-avatar">
                                    <div class="avatar-circle" id="userAvatar">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <button class="btn btn-sm btn-secondary" onclick="changeAvatar()">
                                        <i class="fas fa-camera"></i> Change
                                    </button>
                                </div>
                                <div class="profile-details">
                                    <div class="form-group">
                                        <label>Display Name</label>
                                        <input type="text" id="displayName" class="form-control" placeholder="Your name">
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" id="userEmailSetting" class="form-control" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Bio</label>
                                        <textarea id="userBio" class="form-control" rows="3" placeholder="Tell us about yourself..."></textarea>
                                    </div>
                                    <button class="btn btn-primary" onclick="saveProfileInfo()">
                                        <i class="fas fa-save"></i> Save Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Language & Region -->
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-globe"></i>
                            <div class="setting-title">Language & Region</div>
                        </div>
                        <div class="setting-body">
                            <div class="form-group">
                                <label>Language</label>
                                <select class="form-control" id="languageSetting" onchange="changeLanguage()">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Timezone</label>
                                <select class="form-control" id="timezoneSetting" onchange="changeTimezone()">
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Date Format</label>
                                <select class="form-control" id="dateFormat" onchange="changeDateFormat()">
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Gamification Settings -->
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-trophy"></i>
                            <div class="setting-title">Gamification</div>
                        </div>
                        <div class="setting-body">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Show XP Points</span>
                                    <span class="toggle-desc">Display experience points in UI</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="showXP" onchange="toggleSetting('gamification', 'showXP')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Show Level</span>
                                    <span class="toggle-desc">Display your current level</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="showLevel" onchange="toggleSetting('gamification', 'showLevel')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Show Badges</span>
                                    <span class="toggle-desc">Display earned badges</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="showBadges" onchange="toggleSetting('gamification', 'showBadges')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Celebrate Achievements</span>
                                    <span class="toggle-desc">Show popup animations for achievements</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="celebrateAchievements" onchange="toggleSetting('gamification', 'celebrateAchievements')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notifications Settings -->
            <div id="notifications-settings" class="settings-panel">
                <div class="settings-grid">
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-bell"></i>
                            <div class="setting-title">Notification Preferences</div>
                        </div>
                        <div class="setting-body">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Enable Notifications</span>
                                    <span class="toggle-desc">Master switch for all notifications</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notificationsEnabled" onchange="toggleSetting('notifications', 'enabled')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Task Reminders</span>
                                    <span class="toggle-desc">Get reminded about incomplete tasks</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="taskReminders" onchange="toggleSetting('notifications', 'taskReminders')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Goal Reminders</span>
                                    <span class="toggle-desc">Track progress on your goals</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="goalReminders" onchange="toggleSetting('notifications', 'goalReminders')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Mood Tracking</span>
                                    <span class="toggle-desc">Daily mood check-in reminders</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="moodReminders" onchange="toggleSetting('notifications', 'moodReminders')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Achievement Notifications</span>
                                    <span class="toggle-desc">Celebrate unlocked achievements</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="achievementNotifications" onchange="toggleSetting('notifications', 'achievementNotifications')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Sound Effects</span>
                                    <span class="toggle-desc">Play sounds for notifications</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="soundEnabled" onchange="toggleSetting('notifications', 'soundEnabled')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-clock"></i>
                            <div class="setting-title">Reminder Times</div>
                        </div>
                        <div class="setting-body">
                            <div class="form-group">
                                <label>Daily Check-In</label>
                                <input type="time" id="dailyCheckIn" class="form-control" onchange="updateReminderTime('dailyCheckIn')">
                                <small class="form-text">Start your day with motivation</small>
                            </div>
                            <div class="form-group">
                                <label>Evening Reflection</label>
                                <input type="time" id="eveningReflection" class="form-control" onchange="updateReminderTime('eveningReflection')">
                                <small class="form-text">Review your day's progress</small>
                            </div>
                            <div class="form-group">
                                <label>Mood Tracking</label>
                                <input type="time" id="moodTracking" class="form-control" onchange="updateReminderTime('moodTracking')">
                                <small class="form-text">Log how you're feeling</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Appearance Settings -->
            <div id="appearance-settings" class="settings-panel">
                <div class="settings-grid">
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-palette"></i>
                            <div class="setting-title">Theme & Colors</div>
                        </div>
                        <div class="setting-body">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Dark Mode</span>
                                    <span class="toggle-desc">Easy on the eyes</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="darkModeSetting" onchange="toggleDarkModeSetting()">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label>Color Theme</label>
                                <div class="theme-selector">
                                    <div class="theme-option" onclick="selectTheme('default')" data-theme="default">
                                        <div class="theme-preview default-theme"></div>
                                        <span>Default</span>
                                    </div>
                                    <div class="theme-option" onclick="selectTheme('ocean')" data-theme="ocean">
                                        <div class="theme-preview ocean-theme"></div>
                                        <span>Ocean</span>
                                    </div>
                                    <div class="theme-option" onclick="selectTheme('sunset')" data-theme="sunset">
                                        <div class="theme-preview sunset-theme"></div>
                                        <span>Sunset</span>
                                    </div>
                                    <div class="theme-option" onclick="selectTheme('forest')" data-theme="forest">
                                        <div class="theme-preview forest-theme"></div>
                                        <span>Forest</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-text-height"></i>
                            <div class="setting-title">Display Options</div>
                        </div>
                        <div class="setting-body">
                            <div class="form-group">
                                <label>Font Size</label>
                                <select class="form-control" id="fontSizeSetting" onchange="changeFontSize()">
                                    <option value="small">Small</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xlarge">Extra Large</option>
                                </select>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Animations</span>
                                    <span class="toggle-desc">Enable smooth transitions</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="animations" onchange="toggleSetting('appearance', 'animations')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Compact Mode</span>
                                    <span class="toggle-desc">Reduce spacing for more content</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="compactMode" onchange="toggleSetting('appearance', 'compactMode')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Privacy Settings -->
            <div id="privacy-settings" class="settings-panel">
                <div class="settings-grid">
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-shield-alt"></i>
                            <div class="setting-title">Privacy & Security</div>
                        </div>
                        <div class="setting-body">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Public Profile</span>
                                    <span class="toggle-desc">Allow others to see your profile</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="publicProfile" onchange="toggleSetting('privacy', 'publicProfile')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Share Statistics</span>
                                    <span class="toggle-desc">Share progress on leaderboards</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="shareStats" onchange="toggleSetting('privacy', 'shareStats')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Usage Analytics</span>
                                    <span class="toggle-desc">Help improve the app</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="analytics" onchange="toggleSetting('privacy', 'analytics')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-database"></i>
                            <div class="setting-title">Data Management</div>
                        </div>
                        <div class="setting-body">
                            <div class="toggle-item">
                                <div class="toggle-info">
                                    <span class="toggle-label">Auto Backup</span>
                                    <span class="toggle-desc">Automatically backup your data</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoBackup" onchange="toggleSetting('backup', 'autoBackup')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label>Backup Frequency</label>
                                <select class="form-control" id="backupFrequency" onchange="changeBackupFrequency()">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div class="backup-info">
                                <p><strong>Last Backup:</strong> <span id="lastBackupTime">Never</span></p>
                            </div>
                            <div class="button-group">
                                <button class="btn btn-primary" onclick="backupDataNow()">
                                    <i class="fas fa-cloud-upload-alt"></i> Backup Now
                                </button>
                                <button class="btn btn-secondary" onclick="exportData()">
                                    <i class="fas fa-download"></i> Export Data
                                </button>
                                <button class="btn btn-secondary" onclick="importData()">
                                    <i class="fas fa-upload"></i> Import Data
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="setting-card danger-zone">
                        <div class="setting-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div class="setting-title">Danger Zone</div>
                        </div>
                        <div class="setting-body">
                            <div class="warning-box">
                                <p><strong>⚠️ Warning:</strong> These actions cannot be undone.</p>
                            </div>
                            <div class="button-group">
                                <button class="btn btn-danger" onclick="clearAllData()">
                                    <i class="fas fa-trash"></i> Clear All Data
                                </button>
                                <button class="btn btn-danger" onclick="resetToDefaults()">
                                    <i class="fas fa-undo"></i> Reset to Defaults
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Account Settings -->
            <div id="account-settings" class="settings-panel">
                <div class="settings-grid">
                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-user-circle"></i>
                            <div class="setting-title">Account Information</div>
                        </div>
                        <div class="setting-body">
                            <div class="account-info">
                                <div class="info-row">
                                    <span class="info-label">User ID:</span>
                                    <span class="info-value" id="userId">Not logged in</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Account Type:</span>
                                    <span class="info-value" id="accountType">Free</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Member Since:</span>
                                    <span class="info-value" id="memberSince">N/A</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Last Login:</span>
                                    <span class="info-value" id="lastLogin">Now</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-key"></i>
                            <div class="setting-title">Security</div>
                        </div>
                        <div class="setting-body">
                            <button class="btn btn-primary btn-block" onclick="changePassword()">
                                <i class="fas fa-lock"></i> Change Password
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="enableTwoFactor()">
                                <i class="fas fa-shield-alt"></i> Enable 2FA
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="viewLoginActivity()">
                                <i class="fas fa-history"></i> Login Activity
                            </button>
                        </div>
                    </div>

                    <div class="setting-card">
                        <div class="setting-header">
                            <i class="fas fa-sign-out-alt"></i>
                            <div class="setting-title">Account Actions</div>
                        </div>
                        <div class="setting-body">
                            <button class="btn btn-secondary btn-block" onclick="handleLogout()">
                                <i class="fas fa-sign-out-alt"></i> Log Out
                            </button>
                            <button class="btn btn-danger btn-block" onclick="deleteAccount()">
                                <i class="fas fa-user-times"></i> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load saved values
    loadSavedSettings();
}

// Switch between settings tabs
function switchSettingsTab(tab, element) {
    // Update active tab button
    document.querySelectorAll('.settings-tab').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    // Update active panel
    document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(tab + '-settings').classList.add('active');
}

// Load saved settings into UI
function loadSavedSettings() {
    // Notifications
    document.getElementById('notificationsEnabled').checked = appSettings.notifications.enabled;
    document.getElementById('taskReminders').checked = appSettings.notifications.taskReminders;
    document.getElementById('goalReminders').checked = appSettings.notifications.goalReminders;
    document.getElementById('moodReminders').checked = appSettings.notifications.moodReminders;
    document.getElementById('achievementNotifications').checked = appSettings.notifications.achievementNotifications;
    document.getElementById('soundEnabled').checked = appSettings.notifications.soundEnabled;
    
    // Appearance
    document.getElementById('darkModeSetting').checked = appSettings.appearance.darkMode;
    document.getElementById('fontSizeSetting').value = appSettings.appearance.fontSize;
    document.getElementById('animations').checked = appSettings.appearance.animations;
    document.getElementById('compactMode').checked = appSettings.appearance.compactMode;
    
    // Privacy
    document.getElementById('publicProfile').checked = appSettings.privacy.publicProfile;
    document.getElementById('shareStats').checked = appSettings.privacy.shareStats;
    document.getElementById('analytics').checked = appSettings.privacy.analytics;
    
    // Reminders
    document.getElementById('dailyCheckIn').value = appSettings.reminders.dailyCheckIn;
    document.getElementById('eveningReflection').value = appSettings.reminders.eveningReflection;
    document.getElementById('moodTracking').value = appSettings.reminders.moodTracking;
    
    // Backup
    document.getElementById('autoBackup').checked = appSettings.backup.autoBackup;
    document.getElementById('backupFrequency').value = appSettings.backup.backupFrequency;
    document.getElementById('lastBackupTime').textContent = appSettings.backup.lastBackup;
    
    // Gamification
    document.getElementById('showXP').checked = appSettings.gamification.showXP;
    document.getElementById('showLevel').checked = appSettings.gamification.showLevel;
    document.getElementById('showBadges').checked = appSettings.gamification.showBadges;
    document.getElementById('celebrateAchievements').checked = appSettings.gamification.celebrateAchievements;
    
    // Account info
    if (appState.currentUser) {
        document.getElementById('userId').textContent = appState.currentUser.uid.substring(0, 10) + '...';
        document.getElementById('displayName').value = appState.currentUser.displayName || '';
        document.getElementById('userEmailSetting').value = appState.currentUser.email || '';
        
        // Set member since date
        if (appState.currentUser.metadata && appState.currentUser.metadata.creationTime) {
            const date = new Date(appState.currentUser.metadata.creationTime);
            document.getElementById('memberSince').textContent = date.toLocaleDateString();
        }
    }
    
    // Select active theme
    const activeTheme = document.querySelector(`.theme-option[data-theme="${appSettings.appearance.theme}"]`);
    if (activeTheme) activeTheme.classList.add('active');
}

// Apply saved settings on load
function applySavedSettings() {
    // Apply font size
    changeFontSize();
    
    // Apply animations
    if (!appSettings.appearance.animations) {
        document.body.classList.add('no-animations');
    }
    
    // Apply compact mode
    if (appSettings.appearance.compactMode) {
        document.body.classList.add('compact-mode');
    }

    // Apply theme
    applyTheme(appSettings.appearance.theme);
}

function applyTheme(theme) {
    const allowed = ['default', 'ocean', 'sunset', 'forest'];
    const safeTheme = allowed.includes(theme) ? theme : 'default';
    appSettings.appearance.theme = safeTheme;
    document.body.setAttribute('data-theme', safeTheme);
}

// Toggle setting
function toggleSetting(category, setting) {
    const checkbox = document.getElementById(setting === 'enabled' ? 'notificationsEnabled' : setting);
    appSettings[category][setting] = checkbox.checked;
    localStorage.setItem(setting, checkbox.checked);
    showToast(`Setting updated: ${setting}`, 'success');
}

// Toggle dark mode
function toggleDarkModeSetting() {
    const isDark = document.getElementById('darkModeSetting').checked;
    appSettings.appearance.darkMode = isDark;
    appState.isDarkMode = isDark;
    localStorage.setItem('darkMode', isDark);
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update dark mode toggle in header if it exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    }
    
    showToast('Dark mode ' + (isDark ? 'enabled' : 'disabled'), 'success');
}

// Change font size
function changeFontSize() {
    const size = document.getElementById('fontSizeSetting').value;
    appSettings.appearance.fontSize = size;
    localStorage.setItem('fontSize', size);
    
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    document.body.classList.add('font-' + size);
    
    showToast('Font size updated', 'success');
}

// Select theme
function selectTheme(theme) {
    appSettings.appearance.theme = theme;
    localStorage.setItem('theme', theme);
    
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');

    applyTheme(theme);
    showToast('Theme updated', 'success');
}

// Update reminder time
function updateReminderTime(reminder) {
    const time = document.getElementById(reminder).value;
    appSettings.reminders[reminder] = time;
    localStorage.setItem(reminder, time);
    showToast('Reminder time updated', 'success');
}

// Change backup frequency
function changeBackupFrequency() {
    const freq = document.getElementById('backupFrequency').value;
    appSettings.backup.backupFrequency = freq;
    localStorage.setItem('backupFrequency', freq);
    showToast('Backup frequency updated', 'success');
}

// Backup data now
async function backupDataNow() {
    if (!appState.currentUser || !db) {
        showToast('Please login to backup data', 'error');
        return;
    }
    
    try {
        showToast('Creating backup...', 'info');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            stats: appState.userStats,
            goals: appState.userGoals,
            tasks: appState.userTasks,
            badHabits: appState.badHabits,
            settings: appSettings
        };
        
        await db.collection('users').doc(appState.currentUser.uid)
            .collection('backups').add(backupData);
        
        const now = new Date().toLocaleString();
        appSettings.backup.lastBackup = now;
        localStorage.setItem('lastBackup', now);
        document.getElementById('lastBackupTime').textContent = now;
        
        showToast('Backup created successfully! ✓', 'success');
    } catch (error) {
        console.error('Backup error:', error);
        showToast('Backup failed', 'error');
    }
}

// Export data
function exportData() {
    const data = {
        exportDate: new Date().toISOString(),
        stats: appState.userStats,
        goals: appState.userGoals,
        tasks: appState.userTasks,
        badHabits: appState.badHabits,
        settings: appSettings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-reset-backup-${Date.now()}.json`;
    a.click();
    
    showToast('Data exported successfully!', 'success');
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('This will replace all current data. Continue?')) {
                    if (data.stats) appState.userStats = data.stats;
                    if (data.goals) appState.userGoals = data.goals;
                    if (data.tasks) appState.userTasks = data.tasks;
                    if (data.badHabits) appState.badHabits = data.badHabits;
                    
                    showToast('Data imported successfully!', 'success');
                    location.reload();
                }
            } catch (error) {
                showToast('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ This will delete ALL your data permanently. Are you absolutely sure?')) {
        if (confirm('This cannot be undone! Type YES in the next prompt to confirm.')) {
            const confirmation = prompt('Type YES to confirm deletion:');
            if (confirmation === 'YES') {
                localStorage.clear();
                if (db && appState.currentUser) {
                    db.collection('users').doc(appState.currentUser.uid).delete();
                }
                showToast('All data cleared', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        }
    }
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Reset all settings to default values?')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('notifications') || key.startsWith('appearance') || 
                key.startsWith('privacy') || key.startsWith('backup')) {
                localStorage.removeItem(key);
            }
        });
        showToast('Settings reset to defaults', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// Save profile info
async function saveProfileInfo() {
    const displayName = document.getElementById('displayName').value;
    const bio = document.getElementById('userBio').value;
    
    if (appState.currentUser && auth) {
        try {
            await appState.currentUser.updateProfile({ displayName });
            
            if (db) {
                await db.collection('users').doc(appState.currentUser.uid).update({
                    displayName,
                    bio,
                    updatedAt: new Date()
                }, { merge: true });
            }
            
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast('Error updating profile', 'error');
        }
    }
}

// Placeholder functions (can be implemented later)
function changeAvatar() {
    showToast('Avatar change coming soon!', 'info');
}

function changeLanguage() {
    showToast('Language change coming soon!', 'info');
}

function changeTimezone() {
    showToast('Timezone updated', 'success');
}

function changeDateFormat() {
    showToast('Date format updated', 'success');
}

function changePassword() {
    showToast('Password change coming soon!', 'info');
}

function enableTwoFactor() {
    showToast('2FA coming soon!', 'info');
}

function viewLoginActivity() {
    showToast('Login activity coming soon!', 'info');
}

function deleteAccount() {
    if (confirm('⚠️ Delete your account permanently? This CANNOT be undone!')) {
        if (appState.currentUser && auth) {
            appState.currentUser.delete().then(() => {
                showToast('Account deleted', 'success');
                setTimeout(() => location.reload(), 1000);
            }).catch(() => {
                showToast('Error deleting account', 'error');
            });
        }
    }
}
