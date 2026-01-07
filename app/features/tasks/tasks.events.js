/**
 * @fileoverview Tasks Event Handlers
 * @description Wires event listeners and connects UI actions to logic
 * @version 2.0.0
 * 
 * This module is responsible for:
 * - Setting up event listeners for task interactions
 * - Coordinating between data, logic, and UI modules
 * - Managing task-related timers (midnight refresh)
 * 
 * This is the main entry point that orchestrates the tasks feature
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let midnightRefreshTimer = null;
let isInitialized = false;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the tasks feature
 * Called after user login and data is ready
 */
async function initTasks() {
    if (isInitialized) return;
    
    // Load custom tasks and merge with defaults
    await loadAndInitializeTasks();
    
    // Load today's completion states
    await loadTasksForCurrentDate();
    
    // Set up real-time listeners
    setupRealtimeListeners();
    
    // Schedule midnight refresh
    scheduleMidnightRefresh();
    
    // Render initial UI
    renderCurrentTasks();
    
    isInitialized = true;
    console.log('[Tasks] Feature initialized');
}

/**
 * Clean up tasks feature (on logout)
 */
function cleanupTasks() {
    // Clear midnight timer
    if (midnightRefreshTimer) {
        clearTimeout(midnightRefreshTimer);
        midnightRefreshTimer = null;
    }
    
    // Clean up listeners via data module
    if (window.TasksData) {
        window.TasksData.cleanupListeners();
    }
    
    isInitialized = false;
}

// ============================================================================
// Task Loading & State Management
// ============================================================================

/**
 * Load custom tasks and initialize task state
 */
async function loadAndInitializeTasks() {
    let customTasks = {};
    
    if (window.TasksData) {
        customTasks = await window.TasksData.loadCustomTasks();
    }
    
    // Use TasksLogic to merge defaults with custom tasks
    if (window.TasksLogic) {
        window.appState.userTasks = window.TasksLogic.initializeTasks(customTasks);
    } else {
        // Fallback: copy defaults
        window.appState.userTasks = JSON.parse(JSON.stringify(window.defaultTasks || {}));
    }
}

/**
 * Load task completion states for the current date
 */
async function loadTasksForCurrentDate() {
    const dateString = getDateString(window.appState.currentDate);
    
    // Reset all completions first
    if (window.TasksLogic) {
        window.appState.userTasks = window.TasksLogic.resetCompletionStates(window.appState.userTasks);
    } else {
        for (const category in window.appState.userTasks) {
            window.appState.userTasks[category].forEach(task => task.completed = false);
        }
    }
    
    // Load completion data
    let completionData = null;
    if (window.TasksData) {
        completionData = await window.TasksData.loadTasksForDate(dateString);
    }
    
    // Apply completion states
    if (completionData) {
        if (window.TasksLogic) {
            window.appState.userTasks = window.TasksLogic.applyCompletionData(
                window.appState.userTasks, 
                completionData
            );
        } else {
            for (const category in window.appState.userTasks) {
                window.appState.userTasks[category].forEach(task => {
                    if (completionData[task.id] !== undefined) {
                        task.completed = completionData[task.id];
                    }
                });
            }
        }
    }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle task toggle (checkbox change)
 * @param {string} taskId - Task ID that was toggled
 */
async function handleTaskToggle(taskId) {
    // Find the task and toggle its state
    let found = null;
    for (const category in window.appState.userTasks) {
        const task = window.appState.userTasks[category].find(t => t.id === taskId);
        if (task) {
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            found = { task, category, wasCompleted };
            break;
        }
    }
    
    if (!found) return;
    
    // Update gamification stats
    if (found.task.completed) {
        window.appState.userStats.tasksCompleted++;
        if (typeof addXP === 'function') addXP(10);
    } else {
        window.appState.userStats.tasksCompleted = Math.max(0, window.appState.userStats.tasksCompleted - 1);
        // Save stats without removing XP (earned XP stays)
        if (typeof saveUserStatsRealtime === 'function') saveUserStatsRealtime();
    }
    
    // Save to Firestore with debouncing
    const dateString = getDateString(window.appState.currentDate);
    const totalTasks = getTotalTaskCountLocal();
    
    if (typeof debouncedSave === 'function' && window.TasksData) {
        debouncedSave(`task_${taskId}`, () => {
            window.TasksData.saveTaskCompletion(taskId, found.task.completed, dateString, totalTasks);
        }, 300);
    }
    
    // Update UI
    updateProgressAndUI();
    
    // Check badges
    if (typeof checkAndUnlockBadges === 'function') {
        checkAndUnlockBadges();
    }
}

/**
 * Handle edit custom task
 * @param {string} taskId - Task ID to edit
 */
function handleEditTask(taskId) {
    const found = findTaskByIdLocal(taskId);
    if (!found || !found.task.isCustom) return;
    
    const newName = window.TasksUI ? 
        window.TasksUI.showEditTaskPrompt(found.task.name || '') :
        prompt('Edit task name:', found.task.name || '');
    
    if (!newName || !newName.trim()) return;
    
    // Update local state
    found.task.name = newName.trim();
    
    // Save to Firestore
    saveCustomTasksForCategory(found.category);
    
    // Re-render
    renderCurrentTasks();
    
    if (typeof showToast === 'function') {
        showToast('Task updated', 'success');
    }
}

/**
 * Handle delete custom task
 * @param {string} taskId - Task ID to delete
 */
function handleDeleteTask(taskId) {
    const found = findTaskByIdLocal(taskId);
    if (!found || !found.task.isCustom) return;
    
    const confirmed = window.TasksUI ?
        window.TasksUI.showDeleteConfirmation(found.task.name) :
        confirm('Delete this custom task?');
    
    if (!confirmed) return;
    
    // Remove from local state
    window.appState.userTasks[found.category] = window.appState.userTasks[found.category]
        .filter(t => t && t.id !== taskId);
    
    // Save to Firestore
    saveCustomTasksForCategory(found.category);
    
    // Re-render
    renderCurrentTasks();
    updateProgressAndUI();
    
    if (typeof showToast === 'function') {
        showToast('Task deleted', 'info');
    }
}

/**
 * Handle add custom task from modal
 */
async function handleAddCustomTask() {
    const values = window.TasksUI ? 
        window.TasksUI.getAddTaskModalValues() :
        { 
            name: document.getElementById('customTaskName')?.value?.trim(),
            category: document.getElementById('taskCategory')?.value
        };
    
    if (!values || !values.name) {
        if (typeof showToast === 'function') {
            showToast('Please enter a task name', 'error');
        }
        return;
    }
    
    // Validate name
    if (window.validateTaskName) {
        const validation = window.validateTaskName(values.name);
        if (!validation.valid) {
            if (typeof showToast === 'function') {
                showToast(validation.error, 'error');
            }
            return;
        }
    }
    
    // Create new task
    const newTask = {
        id: 'custom_' + Date.now(),
        name: values.name,
        completed: false,
        isCustom: true
    };
    
    // Add to local state
    if (!window.appState.userTasks[values.category]) {
        window.appState.userTasks[values.category] = [];
    }
    window.appState.userTasks[values.category].push(newTask);
    
    // Save to Firestore
    saveCustomTasksForCategory(values.category);
    
    // Close modal and re-render
    if (window.TasksUI) {
        window.TasksUI.hideAddTaskModal();
    } else {
        const modal = document.getElementById('addTaskModal');
        if (modal) modal.classList.remove('show');
    }
    
    renderCurrentTasks();
    
    // Clear input
    const input = document.getElementById('customTaskName');
    if (input) input.value = '';
    
    if (typeof showToast === 'function') {
        showToast('Task added successfully!', 'success');
    }
}

/**
 * Handle date navigation
 * @param {number} delta - Days to move (+1 or -1)
 */
async function handleDateChange(delta) {
    window.appState.currentDate.setDate(window.appState.currentDate.getDate() + delta);
    
    // Update date display
    if (typeof updateDateDisplay === 'function') {
        updateDateDisplay();
    }
    
    // Reload tasks for new date
    await loadTasksForCurrentDate();
    
    // Re-render and set up listener for new date
    renderCurrentTasks();
    setupTasksRealtimeForCurrentDate();
}

// ============================================================================
// Real-time Listeners
// ============================================================================

/**
 * Set up real-time listeners for tasks and custom tasks
 */
function setupRealtimeListeners() {
    setupTasksRealtimeForCurrentDate();
    setupCustomTasksRealtime();
}

/**
 * Set up listener for current date's task completions
 */
function setupTasksRealtimeForCurrentDate() {
    if (!window.TasksData) return;
    
    const dateString = getDateString(window.appState.currentDate);
    
    window.TasksData.setupTasksListener(dateString, (data) => {
        // Apply completion data from realtime update
        if (data) {
            for (const category in window.appState.userTasks) {
                window.appState.userTasks[category].forEach(task => {
                    task.completed = false;
                    if (data[task.id] !== undefined) {
                        task.completed = !!data[task.id];
                    }
                });
            }
            
            // Update history for analytics
            const historyEntry = window.TasksLogic ? 
                window.TasksLogic.extractHistoryEntry(data) :
                { completed: 0, total: 0, rate: 0 };
            window.appState.tasksHistory[dateString] = historyEntry;
        }
        
        renderCurrentTasks();
        updateProgressAndUI();
        
        // Refresh analytics if visible
        if (window.appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
            initAnalytics();
        }
        if (window.appState.currentView === 'dashboard' && typeof initDashboard === 'function') {
            initDashboard();
        }
    });
}

/**
 * Set up listener for custom tasks changes
 */
function setupCustomTasksRealtime() {
    if (!window.TasksData) return;
    
    window.TasksData.setupCustomTasksListener((customTasks) => {
        // Re-merge custom tasks with defaults
        if (window.TasksLogic) {
            const newTasks = window.TasksLogic.initializeTasks(customTasks);
            
            // Preserve current completion states
            for (const category in window.appState.userTasks) {
                (window.appState.userTasks[category] || []).forEach(oldTask => {
                    const newTask = (newTasks[category] || []).find(t => t.id === oldTask.id);
                    if (newTask) {
                        newTask.completed = oldTask.completed;
                    }
                });
            }
            
            window.appState.userTasks = newTasks;
        }
        
        // Reload completion data for the day
        loadTasksForCurrentDate().then(() => {
            renderCurrentTasks();
        });
    });
}

// ============================================================================
// Midnight Refresh
// ============================================================================

/**
 * Schedule task refresh at midnight
 */
function scheduleMidnightRefresh() {
    if (!window.appState?.currentUser) return;
    
    if (midnightRefreshTimer) {
        clearTimeout(midnightRefreshTimer);
    }
    
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 1, 0); // 00:00:01 next day
    
    const ms = next.getTime() - now.getTime();
    
    midnightRefreshTimer = setTimeout(() => {
        // Reset to today
        window.appState.currentDate = new Date();
        
        // Update display
        if (typeof updateDateDisplay === 'function') {
            updateDateDisplay();
        }
        
        // Reload tasks
        loadTasksForCurrentDate().then(() => {
            renderCurrentTasks();
            setupTasksRealtimeForCurrentDate();
        });
        
        // Reschedule for next midnight
        scheduleMidnightRefresh();
    }, ms);
}

// ============================================================================
// UI Update Helpers
// ============================================================================

/**
 * Render current tasks with event handlers attached
 */
function renderCurrentTasks() {
    if (window.TasksUI) {
        window.TasksUI.renderTaskCategories(window.appState.userTasks, {
            onToggle: handleTaskToggle,
            onEdit: handleEditTask,
            onDelete: handleDeleteTask
        });
    } else if (typeof renderTaskCategories === 'function') {
        // Fallback to global function
        renderTaskCategories();
    }
}

/**
 * Update progress display and gamification UI
 */
function updateProgressAndUI() {
    const progress = window.TasksLogic ?
        window.TasksLogic.calculateProgress(window.appState.userTasks) :
        calculateProgressLocal();
    
    if (window.TasksUI) {
        window.TasksUI.updateProgressUI(progress);
    } else if (typeof updateProgress === 'function') {
        updateProgress();
    }
    
    // Update consistency
    const consistency = window.TasksLogic ?
        window.TasksLogic.calculateConsistency(window.appState.tasksHistory, progress.percentage) :
        progress.percentage;
    window.appState.userStats.consistency = consistency;
    
    // Update gamification UI
    if (typeof updateGamificationUI === 'function') {
        updateGamificationUI();
    }
}

// ============================================================================
// Local Helper Functions (fallbacks)
// ============================================================================

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

function getTotalTaskCountLocal() {
    let count = 0;
    for (const category in window.appState.userTasks) {
        count += (window.appState.userTasks[category] || []).length;
    }
    return count;
}

function findTaskByIdLocal(taskId) {
    for (const category in window.appState.userTasks) {
        const task = (window.appState.userTasks[category] || []).find(t => t?.id === taskId);
        if (task) return { task, category };
    }
    return null;
}

function calculateProgressLocal() {
    let total = 0;
    let completed = 0;
    for (const category in window.appState.userTasks) {
        (window.appState.userTasks[category] || []).forEach(task => {
            total++;
            if (task.completed) completed++;
        });
    }
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
}

function saveCustomTasksForCategory(category) {
    const tasks = window.appState.userTasks[category] || [];
    
    if (window.TasksData) {
        // Use debounced save
        if (typeof debouncedSave === 'function') {
            debouncedSave(`customTasks_${category}`, () => {
                window.TasksData.saveCustomTasks(category, tasks);
            }, 400);
        } else {
            window.TasksData.saveCustomTasks(category, tasks);
        }
    }
}

// ============================================================================
// Exports
// ============================================================================

export const TasksEvents = {
    initTasks,
    cleanupTasks,
    handleTaskToggle,
    handleEditTask,
    handleDeleteTask,
    handleAddCustomTask,
    handleDateChange,
    loadTasksForCurrentDate,
    renderCurrentTasks,
    updateProgressAndUI
};

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.TasksEvents = TasksEvents;
    
    // Expose functions that are called from HTML onclick handlers
    window.toggleTask = handleTaskToggle;
    window.editCustomTask = handleEditTask;
    window.deleteCustomTask = handleDeleteTask;
    window.addCustomTask = handleAddCustomTask;
    window.changeDate = handleDateChange;
    window.loadTasksForDate = loadTasksForCurrentDate;
}
