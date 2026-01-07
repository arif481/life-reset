/**
 * @fileoverview Tasks Data Layer
 * @description Handles all Firebase/Firestore operations for tasks
 * @version 2.0.0
 * 
 * This module is responsible for:
 * - Reading/writing task completion states to Firestore
 * - Managing custom tasks in Firestore
 * - Caching data locally via OfflineManager
 * - Setting up real-time listeners
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let tasksRealtimeUnsubscribe = null;
let customTasksRealtimeUnsubscribe = null;

// ============================================================================
// Task Completion Data Operations
// ============================================================================

/**
 * Save a single task's completion state to Firestore
 * Handles offline queueing automatically
 * @param {string} taskId - The task ID
 * @param {boolean} completed - Completion state
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} totalTasks - Total task count for the day
 * @returns {Promise<void>}
 */
async function saveTaskCompletion(taskId, completed, dateString, totalTasks) {
    const data = {
        [taskId]: completed,
        _totalTasks: totalTasks,
        _updatedAt: new Date()
    };
    
    const isOnline = navigator.onLine && window.db && window.appState?.currentUser;
    
    if (isOnline) {
        try {
            // Flag to prevent realtime listener from triggering re-render
            window.isLocalTaskUpdate = true;
            
            await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('tasks').doc(dateString)
                .set(data, { merge: true });
            
            setTimeout(() => { window.isLocalTaskUpdate = false; }, 100);
            
            // Backup to local cache
            if (window.OfflineManager) {
                await window.OfflineManager.cacheData(`tasks_${dateString}`, 'tasks', data);
            }
        } catch (error) {
            console.warn('[TasksData] Error saving online, queueing for offline:', error);
            window.isLocalTaskUpdate = false;
            
            // Queue for later sync
            if (window.OfflineManager) {
                await window.OfflineManager.queueWrite('tasks', dateString, data, 'set');
                await window.OfflineManager.cacheData(`tasks_${dateString}`, 'tasks', data);
            }
        }
    } else {
        // Queue write for offline sync
        if (window.OfflineManager) {
            await window.OfflineManager.queueWrite('tasks', dateString, data, 'set');
            await window.OfflineManager.cacheData(`tasks_${dateString}`, 'tasks', data);
        }
    }
}

/**
 * Load task completion states for a specific date
 * Falls back to cached data if offline
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Task completion data or null
 */
async function loadTasksForDate(dateString) {
    let data = null;
    
    // Try Firebase first
    if (window.db && window.appState?.currentUser) {
        try {
            const doc = await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('tasks').doc(dateString).get();
            
            if (doc.exists) {
                data = doc.data();
                
                // Cache locally
                if (window.OfflineManager) {
                    await window.OfflineManager.cacheData(`tasks_${dateString}`, 'tasks', data);
                }
            }
        } catch (error) {
            console.error('[TasksData] Error loading from Firebase:', error);
        }
    }
    
    // Fallback to cache
    if (!data && window.OfflineManager) {
        try {
            data = await window.OfflineManager.getCachedData(`tasks_${dateString}`);
        } catch (cacheError) {
            console.error('[TasksData] Error loading from cache:', cacheError);
        }
    }
    
    return data;
}

/**
 * Load task completion history for analytics
 * @param {number} daysBack - Number of days to load
 * @returns {Promise<Object>} Map of dateString -> { completed, total, rate }
 */
async function loadTasksHistory(daysBack = 30) {
    const history = {};
    
    if (!window.db || !window.appState?.currentUser || !window.firebase?.firestore) {
        return history;
    }
    
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (daysBack - 1));
        
        const startId = start.toISOString().split('T')[0];
        const endId = end.toISOString().split('T')[0];
        
        const fieldPath = window.firebase.firestore.FieldPath.documentId();
        const snap = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('tasks')
            .orderBy(fieldPath)
            .startAt(startId)
            .endAt(endId)
            .get();
        
        snap.forEach(doc => {
            const data = doc.data() || {};
            const completed = Object.keys(data).filter(k => !k.startsWith('_') && data[k] === true).length;
            const total = data._totalTasks || Object.keys(data).filter(k => !k.startsWith('_')).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            history[doc.id] = { completed, total, rate };
        });
    } catch (error) {
        console.warn('[TasksData] Error loading history:', error);
    }
    
    return history;
}

// ============================================================================
// Custom Tasks Data Operations
// ============================================================================

/**
 * Save custom tasks for a specific category
 * @param {string} category - Task category
 * @param {Array} tasks - Array of custom task objects
 * @returns {Promise<void>}
 */
async function saveCustomTasks(category, tasks) {
    if (!window.db || !window.appState?.currentUser) return;
    
    const customTasks = tasks
        .filter(t => t && t.isCustom)
        .map(t => ({ id: t.id, name: t.name || 'Untitled task' }));
    
    try {
        await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('customTasks').doc(category)
            .set({ tasks: customTasks, updatedAt: new Date() }, { merge: true });
    } catch (error) {
        console.error('[TasksData] Error saving custom tasks:', error);
        throw error;
    }
}

/**
 * Load all custom tasks for the user
 * @returns {Promise<Object>} Map of category -> custom tasks array
 */
async function loadCustomTasks() {
    const customTasks = {};
    
    if (!window.db || !window.appState?.currentUser) {
        return customTasks;
    }
    
    try {
        const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('customTasks').get();
        
        snapshot.forEach(doc => {
            const category = doc.id;
            const data = doc.data();
            customTasks[category] = Array.isArray(data?.tasks) ? data.tasks : [];
        });
    } catch (error) {
        console.error('[TasksData] Error loading custom tasks:', error);
    }
    
    return customTasks;
}

// ============================================================================
// Real-time Listeners
// ============================================================================

/**
 * Set up real-time listener for task completions
 * @param {string} dateString - Date to listen for
 * @param {Function} onUpdate - Callback when data changes
 * @returns {Function} Unsubscribe function
 */
function setupTasksListener(dateString, onUpdate) {
    if (!window.db || !window.appState?.currentUser) return () => {};
    
    // Clean up existing listener
    if (tasksRealtimeUnsubscribe) {
        tasksRealtimeUnsubscribe();
    }
    
    tasksRealtimeUnsubscribe = window.db.collection('users').doc(window.appState.currentUser.uid)
        .collection('tasks').doc(dateString)
        .onSnapshot((doc) => {
            // Skip if this is a local update
            if (window.isLocalTaskUpdate) return;
            
            const data = doc.exists ? doc.data() : null;
            onUpdate(data);
        }, (error) => {
            console.warn('[TasksData] Realtime listener error:', error);
        });
    
    return tasksRealtimeUnsubscribe;
}

/**
 * Set up real-time listener for custom tasks
 * @param {Function} onUpdate - Callback when data changes
 * @returns {Function} Unsubscribe function
 */
function setupCustomTasksListener(onUpdate) {
    if (!window.db || !window.appState?.currentUser) return () => {};
    
    if (customTasksRealtimeUnsubscribe) {
        customTasksRealtimeUnsubscribe();
    }
    
    customTasksRealtimeUnsubscribe = window.db.collection('users').doc(window.appState.currentUser.uid)
        .collection('customTasks')
        .onSnapshot((snapshot) => {
            const customTasks = {};
            snapshot.forEach(doc => {
                const category = doc.id;
                const data = doc.data();
                customTasks[category] = Array.isArray(data?.tasks) ? data.tasks : [];
            });
            onUpdate(customTasks);
        }, (error) => {
            console.warn('[TasksData] Custom tasks listener error:', error);
        });
    
    return customTasksRealtimeUnsubscribe;
}

/**
 * Clean up all real-time listeners
 */
function cleanupListeners() {
    if (tasksRealtimeUnsubscribe) {
        tasksRealtimeUnsubscribe();
        tasksRealtimeUnsubscribe = null;
    }
    if (customTasksRealtimeUnsubscribe) {
        customTasksRealtimeUnsubscribe();
        customTasksRealtimeUnsubscribe = null;
    }
}

// ============================================================================
// Exports (for ES modules) & Global Registration
// ============================================================================

export const TasksData = {
    saveTaskCompletion,
    loadTasksForDate,
    loadTasksHistory,
    saveCustomTasks,
    loadCustomTasks,
    setupTasksListener,
    setupCustomTasksListener,
    cleanupListeners
};

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.TasksData = TasksData;
}
