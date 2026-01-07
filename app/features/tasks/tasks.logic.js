/**
 * @fileoverview Tasks Business Logic
 * @description Pure functions for task calculations, validations, and transformations
 * @version 2.0.0
 * 
 * This module is responsible for:
 * - Task progress calculations
 * - Streak calculations
 * - Consistency metrics
 * - Task state transformations
 * 
 * All functions here are pure (no side effects, no DOM, no Firebase)
 */

'use strict';

// ============================================================================
// Default Task Configuration
// ============================================================================

const DEFAULT_TASKS = {
    morning: [
        { id: 'wake_early', name: 'Wake up early', completed: false },
        { id: 'exercise', name: 'Do light exercise', completed: false },
        { id: 'breakfast', name: 'Eat a healthy breakfast', completed: false }
    ],
    health: [
        { id: 'water', name: 'Drink 8 glasses of water', completed: false },
        { id: 'meditation', name: 'Practice meditation (10 mins)', completed: false },
        { id: 'healthy_meal', name: 'Eat a balanced meal', completed: false }
    ],
    productivity: [
        { id: 'work', name: 'Complete work tasks', completed: false },
        { id: 'learning', name: 'Learn something new', completed: false },
        { id: 'organize', name: 'Organize workspace', completed: false }
    ],
    evening: [
        { id: 'reflect', name: 'Reflect on the day', completed: false },
        { id: 'gratitude', name: 'Write down 3 things you are grateful for', completed: false },
        { id: 'sleep', name: 'Go to bed by 10 PM', completed: false }
    ],
    custom: []
};

const CATEGORY_CONFIG = {
    morning: { name: 'Morning Routine', icon: 'fa-sun' },
    health: { name: 'Health & Wellness', icon: 'fa-heart' },
    productivity: { name: 'Productivity', icon: 'fa-rocket' },
    evening: { name: 'Evening Routine', icon: 'fa-moon' },
    custom: { name: 'Custom Tasks', icon: 'fa-star' }
};

// ============================================================================
// Task Getters & Lookups
// ============================================================================

/**
 * Get default tasks (deep copy to prevent mutation)
 * @returns {Object} Copy of default tasks
 */
function getDefaultTasks() {
    return JSON.parse(JSON.stringify(DEFAULT_TASKS));
}

/**
 * Get category configuration
 * @param {string} category - Category key
 * @returns {Object} Category config with name and icon
 */
function getCategoryConfig(category) {
    return CATEGORY_CONFIG[category] || { name: category, icon: 'fa-tasks' };
}

/**
 * Get all tasks as a flat array
 * @param {Object} userTasks - Tasks organized by category
 * @returns {Array} Flat array of all tasks
 */
function getAllTasksFlat(userTasks) {
    const all = [];
    for (const category in userTasks) {
        (userTasks[category] || []).forEach(t => all.push(t));
    }
    return all;
}

/**
 * Get total task count
 * @param {Object} userTasks - Tasks organized by category
 * @returns {number} Total number of tasks
 */
function getTotalTaskCount(userTasks) {
    return getAllTasksFlat(userTasks).length;
}

/**
 * Find a task by ID across all categories
 * @param {Object} userTasks - Tasks organized by category
 * @param {string} taskId - Task ID to find
 * @returns {{ task: Object, category: string }|null} Task and its category, or null
 */
function findTaskById(userTasks, taskId) {
    for (const category in userTasks) {
        const tasks = userTasks[category] || [];
        const task = tasks.find(t => t && t.id === taskId);
        if (task) return { task, category };
    }
    return null;
}

// ============================================================================
// Progress Calculations
// ============================================================================

/**
 * Calculate today's progress statistics
 * @param {Object} userTasks - Tasks organized by category
 * @returns {{ total: number, completed: number, percentage: number }}
 */
function calculateProgress(userTasks) {
    let total = 0;
    let completed = 0;
    
    for (const category in userTasks) {
        (userTasks[category] || []).forEach(task => {
            total++;
            if (task.completed) completed++;
        });
    }
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
}

/**
 * Calculate 30-day consistency percentage
 * @param {Object} tasksHistory - Map of dateString -> { completed, total, rate }
 * @param {number} fallbackPercentage - Fallback if no history (default 0)
 * @returns {number} Consistency percentage (0-100)
 */
function calculateConsistency(tasksHistory, fallbackPercentage = 0) {
    if (!tasksHistory || Object.keys(tasksHistory).length === 0) {
        return fallbackPercentage;
    }
    
    let totalDays = 0;
    let completedDays = 0;
    
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = tasksHistory[dateStr];
        
        if (dayData && dayData.total > 0) {
            totalDays++;
            const dayPercent = (dayData.completed / dayData.total) * 100;
            completedDays += dayPercent / 100;
        }
    }
    
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : fallbackPercentage;
}

/**
 * Calculate current streak (consecutive days with at least one task completed)
 * @param {Object} tasksHistory - Map of dateString -> { completed, total, rate }
 * @returns {number} Current streak in days
 */
function calculateStreak(tasksHistory) {
    if (!tasksHistory || Object.keys(tasksHistory).length === 0) {
        return 0;
    }
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = tasksHistory[dateStr];
        
        // Count day as successful if at least one task was completed
        if (dayData && dayData.completed > 0) {
            streak++;
        } else if (i > 0) {
            // Break streak if not today and no completions
            break;
        }
        // Allow today to have 0 completions without breaking streak
    }
    
    return streak;
}

// ============================================================================
// Task State Management
// ============================================================================

/**
 * Initialize tasks with default and custom tasks merged
 * @param {Object} customTasks - Map of category -> custom tasks array
 * @returns {Object} Merged tasks by category
 */
function initializeTasks(customTasks = {}) {
    const tasks = getDefaultTasks();
    
    // Merge in custom tasks
    for (const category in customTasks) {
        if (!tasks[category]) tasks[category] = [];
        
        const customList = customTasks[category] || [];
        customList.forEach(ct => {
            if (!ct || !ct.id) return;
            
            // Check if already exists
            const exists = tasks[category].some(t => t && t.id === ct.id);
            if (!exists) {
                tasks[category].push({
                    id: ct.id,
                    name: ct.name || 'Untitled task',
                    completed: false,
                    isCustom: true
                });
            }
        });
    }
    
    return tasks;
}

/**
 * Apply completion data to tasks
 * @param {Object} userTasks - Tasks organized by category
 * @param {Object} completionData - Completion data from Firestore
 * @returns {Object} Tasks with completion states applied
 */
function applyCompletionData(userTasks, completionData) {
    if (!completionData) return userTasks;
    
    const result = JSON.parse(JSON.stringify(userTasks)); // Deep copy
    
    for (const category in result) {
        result[category].forEach(task => {
            if (completionData[task.id] !== undefined) {
                task.completed = !!completionData[task.id];
            }
        });
    }
    
    return result;
}

/**
 * Reset all task completion states
 * @param {Object} userTasks - Tasks organized by category
 * @returns {Object} Tasks with all completions reset to false
 */
function resetCompletionStates(userTasks) {
    const result = JSON.parse(JSON.stringify(userTasks));
    
    for (const category in result) {
        result[category].forEach(task => {
            task.completed = false;
        });
    }
    
    return result;
}

/**
 * Toggle a task's completion state
 * @param {Object} userTasks - Tasks organized by category
 * @param {string} taskId - Task ID to toggle
 * @returns {{ tasks: Object, toggled: Object|null, wasCompleted: boolean }}
 */
function toggleTaskCompletion(userTasks, taskId) {
    const result = JSON.parse(JSON.stringify(userTasks));
    let toggled = null;
    let wasCompleted = false;
    
    for (const category in result) {
        const task = result[category].find(t => t.id === taskId);
        if (task) {
            wasCompleted = task.completed;
            task.completed = !task.completed;
            toggled = { ...task, category };
            break;
        }
    }
    
    return { tasks: result, toggled, wasCompleted };
}

/**
 * Add a custom task to a category
 * @param {Object} userTasks - Tasks organized by category
 * @param {string} category - Category to add to
 * @param {string} taskName - Name of the new task
 * @returns {{ tasks: Object, newTask: Object }}
 */
function addCustomTask(userTasks, category, taskName) {
    const result = JSON.parse(JSON.stringify(userTasks));
    
    if (!result[category]) {
        result[category] = [];
    }
    
    const newTask = {
        id: 'custom_' + Date.now(),
        name: taskName.trim(),
        completed: false,
        isCustom: true
    };
    
    result[category].push(newTask);
    
    return { tasks: result, newTask };
}

/**
 * Update a custom task's name
 * @param {Object} userTasks - Tasks organized by category
 * @param {string} taskId - Task ID to update
 * @param {string} newName - New task name
 * @returns {Object} Updated tasks
 */
function updateCustomTaskName(userTasks, taskId, newName) {
    const result = JSON.parse(JSON.stringify(userTasks));
    
    for (const category in result) {
        const task = result[category].find(t => t.id === taskId && t.isCustom);
        if (task) {
            task.name = newName.trim();
            break;
        }
    }
    
    return result;
}

/**
 * Delete a custom task
 * @param {Object} userTasks - Tasks organized by category
 * @param {string} taskId - Task ID to delete
 * @returns {{ tasks: Object, deletedCategory: string|null }}
 */
function deleteCustomTask(userTasks, taskId) {
    const result = JSON.parse(JSON.stringify(userTasks));
    let deletedCategory = null;
    
    for (const category in result) {
        const index = result[category].findIndex(t => t.id === taskId && t.isCustom);
        if (index !== -1) {
            result[category].splice(index, 1);
            deletedCategory = category;
            break;
        }
    }
    
    return { tasks: result, deletedCategory };
}

/**
 * Extract completion history entry from task completion data
 * @param {Object} data - Raw Firestore document data
 * @returns {{ completed: number, total: number, rate: number }}
 */
function extractHistoryEntry(data) {
    if (!data) return { completed: 0, total: 0, rate: 0 };
    
    const completed = Object.keys(data).filter(k => !k.startsWith('_') && data[k] === true).length;
    const total = data._totalTasks || Object.keys(data).filter(k => !k.startsWith('_')).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, rate };
}

// ============================================================================
// Exports
// ============================================================================

const TasksLogic = {
    // Config
    DEFAULT_TASKS,
    CATEGORY_CONFIG,
    getDefaultTasks,
    getCategoryConfig,
    
    // Getters
    getAllTasksFlat,
    getTotalTaskCount,
    findTaskById,
    
    // Calculations
    calculateProgress,
    calculateConsistency,
    calculateStreak,
    
    // State management
    initializeTasks,
    applyCompletionData,
    resetCompletionStates,
    toggleTaskCompletion,
    addCustomTask,
    updateCustomTaskName,
    deleteCustomTask,
    extractHistoryEntry
};

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.TasksLogic = TasksLogic;
    // Also expose commonly used functions directly
    window.getAllTasksFlat = () => getAllTasksFlat(window.appState?.userTasks || {});
    window.getTotalTaskCount = () => getTotalTaskCount(window.appState?.userTasks || {});
    window.findTaskById = (taskId) => findTaskById(window.appState?.userTasks || {}, taskId);
}
