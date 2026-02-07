/**
 * @fileoverview Smart Reminders & Notifications System
 * @description Push notifications for tasks, streaks, moods with smart timing
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Reminder Configuration
   ========================================================================== */

const REMINDER_TYPES = {
    TASK: 'task',
    STREAK: 'streak',
    MOOD: 'mood',
    JOURNAL: 'journal',
    HABIT: 'habit',
    CHALLENGE: 'challenge',
    CUSTOM: 'custom'
};

const DEFAULT_REMINDER_SETTINGS = {
    enabled: true,
    dailyTaskReminder: {
        enabled: true,
        time: '09:00',
        message: 'Start your day with your tasks!'
    },
    eveningReview: {
        enabled: true,
        time: '20:00',
        message: 'Time to review your day and log your mood'
    },
    streakProtection: {
        enabled: true,
        threshold: 18, // Hour of day (6 PM)
        message: 'Don\'t lose your streak! Complete a task now.'
    },
    moodReminder: {
        enabled: true,
        times: ['12:00', '20:00'],
        message: 'How are you feeling right now?'
    },
    smartReminders: {
        enabled: true,
        learnPatterns: true
    }
};

let reminderSettings = { ...DEFAULT_REMINDER_SETTINGS };
let scheduledReminders = [];
let notificationPermission = 'default';

/* ==========================================================================
   Initialization
   ========================================================================== */

/**
 * Initialize reminders system
 */
async function initReminders() {
    console.log('[Reminders] Initializing...');
    
    // Load settings
    await loadReminderSettings();
    
    // Request notification permission
    await requestNotificationPermission();
    
    // Set up scheduled reminders
    scheduleAllReminders();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for app events
    document.addEventListener('taskCompleted', handleTaskCompleted);
    document.addEventListener('moodLogged', handleMoodLogged);
    
    console.log('[Reminders] Initialized with permission:', notificationPermission);
}

/**
 * Load reminder settings from storage
 */
async function loadReminderSettings() {
    try {
        // Try Firebase first
        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('reminders')
                .get();
            
            if (doc.exists) {
                reminderSettings = { ...DEFAULT_REMINDER_SETTINGS, ...doc.data() };
            }
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('reminderSettings');
            if (saved) {
                reminderSettings = { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
            }
        }
    } catch (error) {
        console.error('[Reminders] Error loading settings:', error);
    }
}

/**
 * Save reminder settings
 */
async function saveReminderSettings() {
    try {
        localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
        
        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('reminders')
                .set(reminderSettings, { merge: true });
        }
    } catch (error) {
        console.error('[Reminders] Error saving settings:', error);
    }
}

/* ==========================================================================
   Notification Permission
   ========================================================================== */

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('[Reminders] Notifications not supported');
        notificationPermission = 'denied';
        return false;
    }
    
    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            notificationPermission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('[Reminders] Permission error:', error);
            return false;
        }
    }
    
    notificationPermission = 'denied';
    return false;
}

/**
 * Check if notifications are available
 */
function canSendNotifications() {
    return notificationPermission === 'granted' && reminderSettings.enabled;
}

/* ==========================================================================
   Notification Sending
   ========================================================================== */

/**
 * Send a notification
 */
function sendNotification(title, options = {}) {
    if (!canSendNotifications()) {
        console.log('[Reminders] Cannot send notification:', title);
        return null;
    }
    
    const defaultOptions = {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        tag: 'life-reset',
        requireInteraction: false,
        silent: false,
        ...options
    };
    
    try {
        const notification = new Notification(title, defaultOptions);
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) options.onClick();
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
        
        console.log('[Reminders] Sent notification:', title);
        return notification;
    } catch (error) {
        console.error('[Reminders] Error sending notification:', error);
        return null;
    }
}

/**
 * Send notification via Service Worker (for background)
 */
async function sendSWNotification(title, options = {}) {
    if (!('serviceWorker' in navigator) || !canSendNotifications()) {
        return sendNotification(title, options);
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [100, 50, 100],
            ...options
        });
        return true;
    } catch (error) {
        console.error('[Reminders] SW notification error:', error);
        return sendNotification(title, options);
    }
}

/* ==========================================================================
   Scheduled Reminders
   ========================================================================== */

/**
 * Schedule all reminders based on settings
 */
function scheduleAllReminders() {
    // Clear existing timers
    scheduledReminders.forEach(id => clearTimeout(id));
    scheduledReminders = [];
    
    if (!reminderSettings.enabled) return;
    
    const now = new Date();
    
    // Daily task reminder
    if (reminderSettings.dailyTaskReminder.enabled) {
        scheduleTimeBasedReminder(
            reminderSettings.dailyTaskReminder.time,
            () => sendDailyTaskReminder()
        );
    }
    
    // Evening review
    if (reminderSettings.eveningReview.enabled) {
        scheduleTimeBasedReminder(
            reminderSettings.eveningReview.time,
            () => sendEveningReviewReminder()
        );
    }
    
    // Mood reminders
    if (reminderSettings.moodReminder.enabled) {
        reminderSettings.moodReminder.times.forEach(time => {
            scheduleTimeBasedReminder(time, () => sendMoodReminder());
        });
    }
    
    // Streak protection check
    if (reminderSettings.streakProtection.enabled) {
        scheduleStreakProtectionCheck();
    }
    
    console.log('[Reminders] Scheduled', scheduledReminders.length, 'reminders');
}

/**
 * Schedule a time-based reminder
 */
function scheduleTimeBasedReminder(timeStr, callback) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }
    
    const delay = target.getTime() - now.getTime();
    const timerId = setTimeout(() => {
        callback();
        // Reschedule for next day
        scheduleTimeBasedReminder(timeStr, callback);
    }, delay);
    
    scheduledReminders.push(timerId);
}

/**
 * Schedule streak protection check
 */
function scheduleStreakProtectionCheck() {
    const now = new Date();
    const hour = now.getHours();
    const threshold = reminderSettings.streakProtection.threshold;
    
    if (hour >= threshold) {
        // Check now if past threshold
        checkStreakProtection();
    }
    
    // Schedule check at threshold hour
    const target = new Date(now);
    target.setHours(threshold, 0, 0, 0);
    
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }
    
    const delay = target.getTime() - now.getTime();
    const timerId = setTimeout(() => {
        checkStreakProtection();
        scheduleStreakProtectionCheck();
    }, delay);
    
    scheduledReminders.push(timerId);
}

/* ==========================================================================
   Reminder Types
   ========================================================================== */

/**
 * Send daily task reminder
 */
function sendDailyTaskReminder() {
    const todaysTasks = appState.tasks?.filter(t => !t.completed) || [];
    const taskCount = todaysTasks.length;
    
    if (taskCount === 0) {
        sendNotification('🎉 All Clear!', {
            body: 'No pending tasks. Time to set some goals!',
            tag: 'daily-tasks'
        });
    } else {
        const priority = todaysTasks.find(t => t.priority === 'high');
        sendNotification(`📋 ${taskCount} Tasks Today`, {
            body: priority ? `Priority: ${priority.title}` : reminderSettings.dailyTaskReminder.message,
            tag: 'daily-tasks',
            onClick: () => showView('tracker')
        });
    }
}

/**
 * Send evening review reminder
 */
function sendEveningReviewReminder() {
    const streak = appState.userStats?.streak || 0;
    const todaysTasks = appState.tasks?.filter(t => !t.completed) || [];
    const completedToday = appState.tasks?.filter(t => t.completed && isToday(t.completedAt)) || [];
    
    let body = '';
    if (completedToday.length > 0) {
        body = `You completed ${completedToday.length} tasks today! `;
    }
    
    if (todaysTasks.length > 0) {
        body += `${todaysTasks.length} remaining.`;
    }
    
    if (streak >= 3) {
        body += ` 🔥 ${streak}-day streak!`;
    }
    
    sendNotification('🌙 Evening Review', {
        body: body || reminderSettings.eveningReview.message,
        tag: 'evening-review',
        onClick: () => showView('mood')
    });
}

/**
 * Send mood reminder
 */
function sendMoodReminder() {
    // Check if mood already logged recently
    const lastMood = appState.moodHistory?.[0];
    if (lastMood) {
        const lastMoodTime = lastMood.timestamp?.toDate?.() || new Date(lastMood.timestamp);
        const hoursSince = (Date.now() - lastMoodTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSince < 4) {
            console.log('[Reminders] Mood logged recently, skipping reminder');
            return;
        }
    }
    
    const messages = [
        'How are you feeling right now?',
        'Take a moment to check in with yourself',
        'Quick mood check! How\'s your day going?',
        'Pause and reflect: What\'s your mood?'
    ];
    
    sendNotification('😊 Mood Check', {
        body: messages[Math.floor(Math.random() * messages.length)],
        tag: 'mood-check',
        onClick: () => {
            showView('mood');
            // Could auto-open mood picker
        }
    });
}

/**
 * Check and send streak protection reminder
 */
function checkStreakProtection() {
    const streak = appState.userStats?.streak || 0;
    if (streak === 0) return;
    
    // Check if any tasks completed today
    const completedToday = appState.tasks?.filter(t => {
        if (!t.completed || !t.completedAt) return false;
        return isToday(t.completedAt);
    }) || [];
    
    if (completedToday.length === 0) {
        sendNotification(`🔥 Protect Your ${streak}-Day Streak!`, {
            body: reminderSettings.streakProtection.message,
            tag: 'streak-protection',
            requireInteraction: true,
            onClick: () => showView('tracker')
        });
    }
}

/**
 * Send challenge reminder
 */
function sendChallengeReminder(challenge) {
    const remaining = challenge.target - challenge.progress;
    const deadline = new Date(challenge.endDate);
    const hoursLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    
    let urgency = '';
    if (hoursLeft < 24) urgency = '⏰ Less than 24h left! ';
    else if (hoursLeft < 48) urgency = '⚡ 2 days remaining! ';
    
    sendNotification(`🏆 Challenge: ${challenge.title}`, {
        body: `${urgency}${remaining} more to go!`,
        tag: `challenge-${challenge.id}`,
        onClick: () => showView('dashboard')
    });
}

/* ==========================================================================
   Smart Timing
   ========================================================================== */

/**
 * Learn user patterns for smart reminder timing
 */
function analyzeUserPatterns() {
    const patterns = {
        taskCompletionHours: {},
        moodLoggingHours: {},
        activeHours: []
    };
    
    // Analyze task completion times
    appState.tasks?.forEach(task => {
        if (task.completedAt) {
            const hour = new Date(task.completedAt).getHours();
            patterns.taskCompletionHours[hour] = (patterns.taskCompletionHours[hour] || 0) + 1;
        }
    });
    
    // Analyze mood logging times
    appState.moodHistory?.forEach(mood => {
        const time = mood.timestamp?.toDate?.() || new Date(mood.timestamp);
        const hour = time.getHours();
        patterns.moodLoggingHours[hour] = (patterns.moodLoggingHours[hour] || 0) + 1;
    });
    
    // Find peak hours
    const taskHours = Object.entries(patterns.taskCompletionHours)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
    
    patterns.activeHours = taskHours;
    
    return patterns;
}

/**
 * Get smart reminder time based on patterns
 */
function getSmartReminderTime(type) {
    if (!reminderSettings.smartReminders.learnPatterns) {
        return null;
    }
    
    const patterns = analyzeUserPatterns();
    
    switch (type) {
        case 'task':
            // Suggest reminder 1 hour before typical completion time
            if (patterns.activeHours.length > 0) {
                const peakHour = patterns.activeHours[0];
                return `${String(Math.max(0, peakHour - 1)).padStart(2, '0')}:00`;
            }
            break;
        case 'mood':
            // Suggest times when user typically logs mood
            const moodHours = Object.entries(patterns.moodLoggingHours)
                .sort((a, b) => b[1] - a[1]);
            if (moodHours.length > 0) {
                return `${String(moodHours[0][0]).padStart(2, '0')}:00`;
            }
            break;
    }
    
    return null;
}

/* ==========================================================================
   Event Handlers
   ========================================================================== */

/**
 * Handle visibility change (app focus)
 */
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Reschedule reminders when app becomes visible
        scheduleAllReminders();
    }
}

/**
 * Handle task completion
 */
function handleTaskCompleted(event) {
    const task = event.detail?.task;
    
    // Check for streak milestone
    const streak = appState.userStats?.streak || 0;
    if (streak > 0 && streak % 7 === 0) {
        sendNotification(`🎉 ${streak}-Day Streak!`, {
            body: 'Amazing consistency! Keep it going!',
            tag: 'streak-milestone'
        });
    }
}

/**
 * Handle mood logging
 */
function handleMoodLogged(event) {
    const mood = event.detail?.mood;
    
    // If mood is low, offer support
    if (mood === 'very-sad' || mood === 'sad') {
        setTimeout(() => {
            sendNotification('💙 We\'re here for you', {
                body: 'Consider journaling or reaching out to someone.',
                tag: 'mood-support'
            });
        }, 60000); // 1 minute later
    }
}

/* ==========================================================================
   Settings UI
   ========================================================================== */

/**
 * Render reminder settings UI
 */
function renderReminderSettings() {
    const container = document.getElementById('reminderSettingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="reminder-settings">
            <div class="setting-group">
                <div class="setting-header">
                    <h4>🔔 Notifications</h4>
                    <label class="toggle-switch">
                        <input type="checkbox" id="remindersEnabled" 
                               ${reminderSettings.enabled ? 'checked' : ''}
                               onchange="toggleReminders(this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                <p class="setting-description">
                    Permission: ${notificationPermission === 'granted' ? '✅ Granted' : '❌ Not granted'}
                    ${notificationPermission !== 'granted' ? '<button class="btn-link" onclick="requestNotificationPermission()">Request</button>' : ''}
                </p>
            </div>
            
            <div class="setting-group ${!reminderSettings.enabled ? 'disabled' : ''}">
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-icon">☀️</span>
                        <div>
                            <span class="setting-label">Morning Task Reminder</span>
                            <span class="setting-time">${reminderSettings.dailyTaskReminder.time}</span>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               ${reminderSettings.dailyTaskReminder.enabled ? 'checked' : ''}
                               onchange="updateReminderSetting('dailyTaskReminder', 'enabled', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-icon">🌙</span>
                        <div>
                            <span class="setting-label">Evening Review</span>
                            <span class="setting-time">${reminderSettings.eveningReview.time}</span>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               ${reminderSettings.eveningReview.enabled ? 'checked' : ''}
                               onchange="updateReminderSetting('eveningReview', 'enabled', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-icon">🔥</span>
                        <div>
                            <span class="setting-label">Streak Protection</span>
                            <span class="setting-time">After ${reminderSettings.streakProtection.threshold}:00</span>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               ${reminderSettings.streakProtection.enabled ? 'checked' : ''}
                               onchange="updateReminderSetting('streakProtection', 'enabled', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-icon">😊</span>
                        <div>
                            <span class="setting-label">Mood Check-ins</span>
                            <span class="setting-time">${reminderSettings.moodReminder.times.join(', ')}</span>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               ${reminderSettings.moodReminder.enabled ? 'checked' : ''}
                               onchange="updateReminderSetting('moodReminder', 'enabled', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <span class="setting-icon">🧠</span>
                        <div>
                            <span class="setting-label">Smart Timing</span>
                            <span class="setting-desc">Learn from your patterns</span>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               ${reminderSettings.smartReminders.enabled ? 'checked' : ''}
                               onchange="updateReminderSetting('smartReminders', 'enabled', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="setting-actions">
                <button class="btn-secondary btn-sm" onclick="sendTestNotification()">
                    🔔 Test Notification
                </button>
            </div>
        </div>
    `;
}

/**
 * Toggle all reminders
 */
function toggleReminders(enabled) {
    reminderSettings.enabled = enabled;
    saveReminderSettings();
    scheduleAllReminders();
    renderReminderSettings();
}

/**
 * Update a specific reminder setting
 */
function updateReminderSetting(category, key, value) {
    if (reminderSettings[category]) {
        reminderSettings[category][key] = value;
        saveReminderSettings();
        scheduleAllReminders();
    }
}

/**
 * Send test notification
 */
function sendTestNotification() {
    sendNotification('🔔 Test Notification', {
        body: 'Your notifications are working perfectly!',
        tag: 'test'
    });
}

/* ==========================================================================
   Utility Functions
   ========================================================================== */

/**
 * Check if a date is today
 */
function isToday(date) {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initReminders = initReminders;
window.loadReminderSettings = loadReminderSettings;
window.saveReminderSettings = saveReminderSettings;
window.requestNotificationPermission = requestNotificationPermission;
window.sendNotification = sendNotification;
window.sendSWNotification = sendSWNotification;
window.scheduleAllReminders = scheduleAllReminders;
window.renderReminderSettings = renderReminderSettings;
window.toggleReminders = toggleReminders;
window.updateReminderSetting = updateReminderSetting;
window.sendTestNotification = sendTestNotification;
window.sendChallengeReminder = sendChallengeReminder;
