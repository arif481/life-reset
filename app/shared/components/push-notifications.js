/**
 * @fileoverview Push Notification Manager
 * @description Handles push notification subscription and display
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Configuration
// ============================================================================

const NOTIFICATION_CONFIG = {
    // Default notification settings
    defaults: {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        requireInteraction: false,
        silent: false
    },
    
    // Notification types with their configurations
    types: {
        taskReminder: {
            title: 'Task Reminder 📋',
            tag: 'task-reminder',
            actions: [
                { action: 'open', title: 'Open App' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        },
        moodReminder: {
            title: 'How are you feeling? 😊',
            tag: 'mood-reminder',
            actions: [
                { action: 'log', title: 'Log Mood' },
                { action: 'dismiss', title: 'Later' }
            ]
        },
        streakAlert: {
            title: 'Streak Alert! 🔥',
            tag: 'streak-alert',
            requireInteraction: true
        },
        levelUp: {
            title: 'Level Up! 🎉',
            tag: 'level-up',
            vibrate: [200, 100, 200, 100, 200]
        },
        badgeUnlocked: {
            title: 'Badge Unlocked! 🏆',
            tag: 'badge-unlocked'
        },
        general: {
            title: 'Life Reset',
            tag: 'general'
        }
    }
};

// ============================================================================
// Permission Management
// ============================================================================

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
function isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Check current notification permission
 * @returns {'granted' | 'denied' | 'default'}
 */
function getNotificationPermission() {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
}

/**
 * Request notification permission from user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        console.warn('[Notifications] Not supported in this browser');
        return 'denied';
    }
    
    if (Notification.permission === 'granted') {
        return 'granted';
    }
    
    if (Notification.permission === 'denied') {
        console.warn('[Notifications] Permission previously denied');
        return 'denied';
    }
    
    try {
        const permission = await Notification.requestPermission();
        console.log('[Notifications] Permission:', permission);
        
        if (permission === 'granted') {
            // Subscribe to push notifications if available
            await subscribeToPush();
        }
        
        return permission;
    } catch (error) {
        console.error('[Notifications] Permission request failed:', error);
        return 'denied';
    }
}

// ============================================================================
// Push Subscription
// ============================================================================

/**
 * Subscribe to push notifications
 * @returns {Promise<PushSubscription|null>}
 */
async function subscribeToPush() {
    if (!('PushManager' in window)) {
        console.warn('[Push] PushManager not supported');
        return null;
    }
    
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            console.log('[Push] Existing subscription found');
            return subscription;
        }
        
        // Create new subscription
        // Note: In production, you'd use your VAPID public key
        const vapidPublicKey = localStorage.getItem('vapidPublicKey');
        
        if (!vapidPublicKey) {
            console.log('[Push] No VAPID key configured, using local notifications only');
            return null;
        }
        
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        console.log('[Push] Subscribed:', subscription.endpoint);
        
        // Save subscription to server (if backend is available)
        await saveSubscriptionToServer(subscription);
        
        return subscription;
    } catch (error) {
        console.error('[Push] Subscription failed:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>}
 */
async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            console.log('[Push] Unsubscribed');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('[Push] Unsubscribe failed:', error);
        return false;
    }
}

/**
 * Convert VAPID key to Uint8Array
 * @param {string} base64String - Base64 encoded VAPID key
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
}

/**
 * Save subscription to server
 * @param {PushSubscription} subscription - Push subscription
 */
async function saveSubscriptionToServer(subscription) {
    // In production, send this to your backend
    // For now, just store locally as a placeholder
    if (window.db && window.appState?.currentUser) {
        try {
            await window.db.collection('users').doc(window.appState.currentUser.uid)
                .set({
                    pushSubscription: JSON.parse(JSON.stringify(subscription))
                }, { merge: true });
            console.log('[Push] Subscription saved to Firestore');
        } catch (error) {
            console.warn('[Push] Failed to save subscription:', error);
        }
    }
}

// ============================================================================
// Local Notifications
// ============================================================================

/**
 * Show a local notification
 * @param {string} type - Notification type from NOTIFICATION_CONFIG
 * @param {Object} options - Additional options
 * @returns {Promise<Notification|null>}
 */
async function showNotification(type, options = {}) {
    if (getNotificationPermission() !== 'granted') {
        console.warn('[Notifications] Permission not granted');
        return null;
    }
    
    const typeConfig = NOTIFICATION_CONFIG.types[type] || NOTIFICATION_CONFIG.types.general;
    
    const notificationOptions = {
        ...NOTIFICATION_CONFIG.defaults,
        ...typeConfig,
        ...options,
        body: options.body || options.message || '',
        data: {
            type,
            url: options.url || '/',
            timestamp: Date.now(),
            ...options.data
        }
    };
    
    // Remove title from options (it's a separate parameter)
    const title = options.title || typeConfig.title;
    delete notificationOptions.title;
    
    try {
        // Use Service Worker notifications for better reliability
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
        console.log('[Notifications] Shown:', type, title);
        return true;
    } catch (error) {
        // Fallback to regular Notification API
        try {
            const notification = new Notification(title, notificationOptions);
            
            notification.onclick = () => {
                window.focus();
                if (options.url) {
                    window.location.hash = options.url;
                }
                notification.close();
            };
            
            return notification;
        } catch (fallbackError) {
            console.error('[Notifications] Failed to show:', fallbackError);
            return null;
        }
    }
}

// ============================================================================
// Scheduled Notifications
// ============================================================================

// Store for scheduled notifications
const scheduledNotifications = new Map();

/**
 * Schedule a notification for a specific time
 * @param {string} id - Unique identifier for this notification
 * @param {string} type - Notification type
 * @param {Date|number} time - When to show the notification
 * @param {Object} options - Notification options
 */
function scheduleNotification(id, type, time, options = {}) {
    // Cancel existing scheduled notification with same ID
    cancelScheduledNotification(id);
    
    const targetTime = time instanceof Date ? time.getTime() : time;
    const delay = targetTime - Date.now();
    
    if (delay <= 0) {
        console.warn('[Notifications] Scheduled time is in the past');
        return;
    }
    
    const timeoutId = setTimeout(() => {
        showNotification(type, options);
        scheduledNotifications.delete(id);
    }, delay);
    
    scheduledNotifications.set(id, {
        timeoutId,
        targetTime,
        type,
        options
    });
    
    console.log(`[Notifications] Scheduled: ${id} at ${new Date(targetTime).toLocaleString()}`);
}

/**
 * Cancel a scheduled notification
 * @param {string} id - Notification ID
 */
function cancelScheduledNotification(id) {
    const scheduled = scheduledNotifications.get(id);
    if (scheduled) {
        clearTimeout(scheduled.timeoutId);
        scheduledNotifications.delete(id);
        console.log(`[Notifications] Cancelled: ${id}`);
    }
}

/**
 * Cancel all scheduled notifications
 */
function cancelAllScheduledNotifications() {
    scheduledNotifications.forEach((scheduled, id) => {
        clearTimeout(scheduled.timeoutId);
    });
    scheduledNotifications.clear();
    console.log('[Notifications] All scheduled notifications cancelled');
}

// ============================================================================
// Daily Reminders
// ============================================================================

/**
 * Set up daily task reminder
 * @param {string} time - Time in HH:MM format
 */
function setDailyTaskReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }
        
        scheduleNotification('daily-task-reminder', 'taskReminder', target, {
            body: 'Time to check your daily tasks and stay on track!',
            url: '/tracker'
        });
        
        // Schedule the next one
        setTimeout(scheduleNext, target.getTime() - now.getTime() + 1000);
    };
    
    scheduleNext();
    localStorage.setItem('dailyTaskReminderTime', time);
}

/**
 * Set up daily mood check-in reminder
 * @param {string} time - Time in HH:MM format
 */
function setDailyMoodReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }
        
        scheduleNotification('daily-mood-reminder', 'moodReminder', target, {
            body: 'Take a moment to log how you\'re feeling today.',
            url: '/mood'
        });
        
        setTimeout(scheduleNext, target.getTime() - now.getTime() + 1000);
    };
    
    scheduleNext();
    localStorage.setItem('dailyMoodReminderTime', time);
}

/**
 * Initialize reminders from saved settings
 */
function initializeReminders() {
    const taskTime = localStorage.getItem('dailyTaskReminderTime');
    const moodTime = localStorage.getItem('dailyMoodReminderTime');
    
    if (taskTime) setDailyTaskReminder(taskTime);
    if (moodTime) setDailyMoodReminder(moodTime);
}

// ============================================================================
// Achievement Notifications
// ============================================================================

/**
 * Show level up notification
 * @param {number} newLevel - New level achieved
 */
function notifyLevelUp(newLevel) {
    showNotification('levelUp', {
        body: `Congratulations! You've reached Level ${newLevel}! 🚀`,
        vibrate: [200, 100, 200, 100, 200]
    });
}

/**
 * Show badge unlocked notification
 * @param {string} badgeName - Name of the badge
 * @param {string} badgeIcon - Badge emoji/icon
 */
function notifyBadgeUnlocked(badgeName, badgeIcon = '🏆') {
    showNotification('badgeUnlocked', {
        body: `You've unlocked the "${badgeName}" badge! ${badgeIcon}`,
        icon: badgeIcon
    });
}

/**
 * Show streak warning notification
 * @param {number} currentStreak - Current streak count
 */
function notifyStreakWarning(currentStreak) {
    showNotification('streakAlert', {
        body: `Don't lose your ${currentStreak}-day streak! Complete today's tasks to keep it going.`,
        requireInteraction: true
    });
}

// ============================================================================
// Initialize
// ============================================================================

// Auto-initialize reminders when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (getNotificationPermission() === 'granted') {
            initializeReminders();
        }
    });
}

// ============================================================================
// Exports
// ============================================================================

export const PushNotifications = {
    // Permission
    isSupported: isNotificationSupported,
    getPermission: getNotificationPermission,
    requestPermission: requestNotificationPermission,
    
    // Push subscription
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
    
    // Local notifications
    show: showNotification,
    
    // Scheduling
    schedule: scheduleNotification,
    cancel: cancelScheduledNotification,
    cancelAll: cancelAllScheduledNotifications,
    
    // Daily reminders
    setTaskReminder: setDailyTaskReminder,
    setMoodReminder: setDailyMoodReminder,
    initReminders: initializeReminders,
    
    // Achievement notifications
    notifyLevelUp,
    notifyBadgeUnlocked,
    notifyStreakWarning,
    
    // Config
    config: NOTIFICATION_CONFIG
};

if (typeof window !== 'undefined') {
    window.PushNotifications = PushNotifications;
    window.requestNotificationPermission = requestNotificationPermission;
    window.showNotification = showNotification;
    window.scheduleNotification = scheduleNotification;
}
