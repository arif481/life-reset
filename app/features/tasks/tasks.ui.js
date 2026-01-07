/**
 * @fileoverview Tasks UI Rendering
 * @description Handles all DOM construction and updates for tasks
 * @version 2.0.0
 * 
 * This module is responsible for:
 * - Rendering task categories and lists
 * - Updating progress indicators
 * - Managing task-related modals
 * 
 * All functions here deal only with DOM manipulation
 */

'use strict';

// ============================================================================
// Task Category Rendering
// ============================================================================

/**
 * Render all task categories and their tasks
 * @param {Object} userTasks - Tasks organized by category
 * @param {Object} options - Rendering options
 * @param {Function} options.onToggle - Callback when task is toggled
 * @param {Function} options.onEdit - Callback when custom task is edited
 * @param {Function} options.onDelete - Callback when custom task is deleted
 */
function renderTaskCategories(userTasks, options = {}) {
    const container = document.getElementById('taskCategories');
    if (!container) return;
    
    const { onToggle, onEdit, onDelete } = options;
    
    const categoryIcons = {
        morning: 'fa-sun',
        health: 'fa-heart',
        productivity: 'fa-rocket',
        evening: 'fa-moon',
        custom: 'fa-star'
    };
    
    const categoryNames = {
        morning: 'Morning Routine',
        health: 'Health & Wellness',
        productivity: 'Productivity',
        evening: 'Evening Routine',
        custom: 'Custom Tasks'
    };
    
    container.innerHTML = '';
    
    for (const category in userTasks) {
        const tasks = userTasks[category] || [];
        const taskEl = document.createElement('div');
        taskEl.className = 'task-category';
        taskEl.setAttribute('data-category', category);
        
        // Build task list HTML
        let taskListHTML = '';
        tasks.forEach(task => {
            const taskName = sanitizeForHTML(task?.name || 'Untitled task');
            const isCompleted = task?.completed ? 'completed' : '';
            const isChecked = task?.completed ? 'checked' : '';
            
            // Custom task actions (edit/delete buttons)
            const customActions = task?.isCustom ? `
                <div class="task-actions">
                    <button class="task-action-btn" data-action="edit" data-task-id="${task.id}" title="Edit task">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="task-action-btn danger" data-action="delete" data-task-id="${task.id}" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : '';
            
            taskListHTML += `
                <div class="task-item ${isCompleted}" data-task-id="${task.id}">
                    <input type="checkbox" ${isChecked} data-action="toggle" data-task-id="${task.id}">
                    <label>${taskName}</label>
                    ${customActions}
                </div>
            `;
        });
        
        taskEl.innerHTML = `
            <div class="category-header">
                <i class="fas ${categoryIcons[category] || 'fa-tasks'}"></i>
                <div class="category-title">${categoryNames[category] || category}</div>
                <span class="category-count">${tasks.filter(t => t?.completed).length}/${tasks.length}</span>
            </div>
            <div class="task-list">${taskListHTML}</div>
        `;
        
        container.appendChild(taskEl);
    }
    
    // Attach event listeners using delegation
    container.addEventListener('change', (e) => {
        if (e.target.matches('[data-action="toggle"]')) {
            const taskId = e.target.dataset.taskId;
            if (onToggle) onToggle(taskId);
        }
    });
    
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const action = btn.dataset.action;
        const taskId = btn.dataset.taskId;
        
        if (action === 'edit' && onEdit) {
            onEdit(taskId);
        } else if (action === 'delete' && onDelete) {
            onDelete(taskId);
        }
    });
}

/**
 * Update a single task item's appearance
 * @param {string} taskId - Task ID
 * @param {boolean} completed - Completion state
 */
function updateTaskItem(taskId, completed) {
    const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (!taskItem) return;
    
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    
    if (completed) {
        taskItem.classList.add('completed');
        if (checkbox) checkbox.checked = true;
    } else {
        taskItem.classList.remove('completed');
        if (checkbox) checkbox.checked = false;
    }
}

// ============================================================================
// Progress UI
// ============================================================================

/**
 * Update progress bar and text
 * @param {{ total: number, completed: number, percentage: number }} progress
 */
function updateProgressUI(progress) {
    const { total, completed, percentage } = progress;
    
    // Progress bar
    const progressBar = document.getElementById('todayProgress');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    // Progress text
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${percentage}% of today's tasks completed`;
    }
    
    // Completion rate (used in some views)
    const completionRate = document.getElementById('completionRate');
    if (completionRate) {
        completionRate.textContent = `${percentage}%`;
    }
    
    // Task count display
    const taskCountEl = document.getElementById('taskCount');
    if (taskCountEl) {
        taskCountEl.textContent = `${completed}/${total}`;
    }
}

/**
 * Update category-specific completion counts
 * @param {Object} userTasks - Tasks organized by category
 */
function updateCategoryCounts(userTasks) {
    for (const category in userTasks) {
        const tasks = userTasks[category] || [];
        const completed = tasks.filter(t => t?.completed).length;
        const total = tasks.length;
        
        const countEl = document.querySelector(`.task-category[data-category="${category}"] .category-count`);
        if (countEl) {
            countEl.textContent = `${completed}/${total}`;
        }
    }
}

// ============================================================================
// Modal UI
// ============================================================================

/**
 * Show the add task modal
 */
function showAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus the input
        const input = document.getElementById('customTaskName');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

/**
 * Hide the add task modal
 */
function hideAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

/**
 * Get values from the add task modal
 * @returns {{ name: string, category: string }|null}
 */
function getAddTaskModalValues() {
    const nameInput = document.getElementById('customTaskName');
    const categorySelect = document.getElementById('taskCategory');
    
    if (!nameInput || !categorySelect) return null;
    
    return {
        name: nameInput.value.trim(),
        category: categorySelect.value
    };
}

/**
 * Show edit task prompt (using browser prompt for simplicity)
 * @param {string} currentName - Current task name
 * @returns {string|null} New name or null if cancelled
 */
function showEditTaskPrompt(currentName) {
    return prompt('Edit task name:', currentName);
}

/**
 * Show delete confirmation
 * @param {string} taskName - Name of task being deleted
 * @returns {boolean} True if confirmed
 */
function showDeleteConfirmation(taskName) {
    return confirm(`Delete task "${taskName}"?`);
}

// ============================================================================
// Date Navigation UI
// ============================================================================

/**
 * Update the date display
 * @param {Date} date - Current date
 */
function updateDateDisplay(date) {
    const currentDateEl = document.getElementById('currentDate');
    if (!currentDateEl) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const displayDate = new Date(date);
    displayDate.setHours(0, 0, 0, 0);
    
    if (displayDate.getTime() === today.getTime()) {
        currentDateEl.textContent = 'Today';
    } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        currentDateEl.textContent = date.toLocaleDateString('en-US', options);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sanitize string for safe HTML insertion
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeForHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================================
// Exports
// ============================================================================

export const TasksUI = {
    renderTaskCategories,
    updateTaskItem,
    updateProgressUI,
    updateCategoryCounts,
    showAddTaskModal,
    hideAddTaskModal,
    getAddTaskModalValues,
    showEditTaskPrompt,
    showDeleteConfirmation,
    updateDateDisplay
};

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.TasksUI = TasksUI;
    // Also expose commonly used functions directly
    window.showAddTaskModal = showAddTaskModal;
    window.closeAddTaskModal = hideAddTaskModal;
}
