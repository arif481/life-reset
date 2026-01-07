/**
 * @fileoverview Goals Data Layer
 * @description Data fetching and persistence for goals
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Configuration
// ============================================================================

const GOALS_CONFIG = {
    categoryIcons: {
        'Health': '💪',
        'Productivity': '🚀',
        'Personal': '✨',
        'Learning': '📚',
        'Finance': '💰',
        'Social': '👥'
    },
    priorityColors: {
        'high': '#ef4444',
        'medium': '#f59e0b',
        'low': '#10b981'
    },
    defaultCategories: ['Health', 'Productivity', 'Personal', 'Learning']
};

// ============================================================================
// Data Access Functions
// ============================================================================

/**
 * Get all goals
 * @returns {Array} Array of goal objects
 */
function getAllGoals() {
    return appState.userGoals || [];
}

/**
 * Get goal by ID
 * @param {string} goalId - Goal identifier
 * @returns {Object|null} Goal object or null
 */
function getGoalById(goalId) {
    return getAllGoals().find(g => g.id === goalId) || null;
}

/**
 * Get goals by filter
 * @param {string} filter - Filter type ('all', 'active', 'completed', or category name)
 * @returns {Array} Filtered goals
 */
function getFilteredGoals(filter = 'all') {
    const goals = getAllGoals();
    
    switch (filter) {
        case 'all':
            return goals;
        case 'active':
            return goals.filter(g => !g.completed && (g.progress || 0) < (g.target || 1));
        case 'completed':
            return goals.filter(g => g.completed || (g.progress || 0) >= (g.target || 1));
        default:
            // Category filter
            if (GOALS_CONFIG.defaultCategories.includes(filter)) {
                return goals.filter(g => g.category === filter);
            }
            return goals;
    }
}

/**
 * Get goal statistics
 * @returns {Object} Statistics object
 */
function getGoalStats() {
    const goals = getAllGoals();
    const total = goals.length;
    const completed = goals.filter(g => g.completed || (g.progress || 0) >= (g.target || 1)).length;
    const active = total - completed;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate average progress
    const avgProgress = total > 0 
        ? Math.round(goals.reduce((sum, g) => {
            const target = g.target || 1;
            const progress = g.progress || 0;
            return sum + Math.min(100, (progress / target) * 100);
        }, 0) / total)
        : 0;
    
    // Goals by category
    const byCategory = {};
    goals.forEach(g => {
        const cat = g.category || 'Personal';
        if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0 };
        byCategory[cat].total++;
        if (g.completed || (g.progress || 0) >= (g.target || 1)) {
            byCategory[cat].completed++;
        }
    });
    
    return {
        total,
        completed,
        active,
        successRate,
        avgProgress,
        byCategory
    };
}

// ============================================================================
// Data Mutation Functions
// ============================================================================

/**
 * Create a new goal
 * @param {Object} goalData - Goal data
 * @returns {Object} Created goal
 */
function createGoal(goalData) {
    const newGoal = {
        id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: goalData.name?.trim() || 'Untitled Goal',
        description: goalData.description?.trim() || '',
        category: goalData.category || 'Personal',
        priority: goalData.priority || 'medium',
        progress: 0,
        target: parseInt(goalData.target) || 1,
        unit: goalData.unit?.trim() || 'units',
        deadline: goalData.deadline || null,
        milestones: goalData.milestones || [],
        createdAt: new Date().toISOString(),
        completed: false,
        startDate: getDateString(new Date())
    };
    
    if (!appState.userGoals) {
        appState.userGoals = [];
    }
    
    appState.userGoals.push(newGoal);
    saveGoalsToFirebase();
    
    return newGoal;
}

/**
 * Update goal progress
 * @param {string} goalId - Goal identifier
 * @param {number} newProgress - New progress value
 * @returns {Object|null} Updated goal or null
 */
function updateGoalProgress(goalId, newProgress) {
    const goal = getGoalById(goalId);
    if (!goal || goal.completed) return null;
    
    const oldProgress = goal.progress || 0;
    const target = goal.target || 1;
    goal.progress = Math.min(Math.max(0, newProgress), target);
    
    // Check if goal is now complete
    if (goal.progress >= target) {
        goal.completed = true;
        goal.completedAt = new Date().toISOString();
    }
    
    saveGoalsToFirebase();
    
    return {
        goal,
        oldProgress,
        progressDelta: goal.progress - oldProgress,
        isNowComplete: goal.completed && oldProgress < target
    };
}

/**
 * Toggle milestone completion
 * @param {string} goalId - Goal identifier
 * @param {number} milestoneIndex - Milestone index
 * @returns {boolean} New completion state
 */
function toggleMilestoneComplete(goalId, milestoneIndex) {
    const goal = getGoalById(goalId);
    if (!goal || !goal.milestones || !goal.milestones[milestoneIndex]) {
        return false;
    }
    
    goal.milestones[milestoneIndex].completed = !goal.milestones[milestoneIndex].completed;
    saveGoalsToFirebase();
    
    return goal.milestones[milestoneIndex].completed;
}

/**
 * Update goal details
 * @param {string} goalId - Goal identifier
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated goal
 */
function updateGoal(goalId, updates) {
    const goal = getGoalById(goalId);
    if (!goal) return null;
    
    const allowedFields = ['name', 'description', 'category', 'priority', 'target', 'unit', 'deadline'];
    
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            goal[field] = updates[field];
        }
    });
    
    saveGoalsToFirebase();
    return goal;
}

/**
 * Delete a goal
 * @param {string} goalId - Goal identifier
 * @returns {boolean} Success status
 */
function deleteGoal(goalId) {
    const index = getAllGoals().findIndex(g => g.id === goalId);
    if (index === -1) return false;
    
    appState.userGoals.splice(index, 1);
    saveGoalsToFirebase();
    
    return true;
}

// ============================================================================
// Firebase Persistence
// ============================================================================

let goalsSaveTimeout = null;

/**
 * Save goals to Firebase (debounced)
 */
function saveGoalsToFirebase() {
    if (goalsSaveTimeout) {
        clearTimeout(goalsSaveTimeout);
    }
    
    goalsSaveTimeout = setTimeout(async () => {
        if (!appState.currentUser || !db) return;
        
        try {
            window.isLocalUpdate = true;
            await db.collection('users').doc(appState.currentUser.uid).set(
                { goals: appState.userGoals },
                { merge: true }
            );
            setTimeout(() => { window.isLocalUpdate = false; }, 100);
        } catch (error) {
            console.error('[Goals] Save error:', error);
            window.isLocalUpdate = false;
        }
    }, 500);
}

// ============================================================================
// Exports
// ============================================================================

if (typeof window !== 'undefined') {
    window.GoalsData = {
        config: GOALS_CONFIG,
        getAll: getAllGoals,
        getById: getGoalById,
        getFiltered: getFilteredGoals,
        getStats: getGoalStats,
        create: createGoal,
        updateProgress: updateGoalProgress,
        toggleMilestone: toggleMilestoneComplete,
        update: updateGoal,
        delete: deleteGoal,
        save: saveGoalsToFirebase
    };
}
