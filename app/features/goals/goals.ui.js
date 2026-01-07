/**
 * @fileoverview Goals UI Rendering
 * @description DOM rendering for goals feature
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// State
// ============================================================================

let currentGoalFilter = 'all';

// ============================================================================
// Main Render Functions
// ============================================================================

/**
 * Render the goals view
 */
function renderGoalsView() {
    const container = document.getElementById('goals-view');
    if (!container) return;
    
    const stats = window.GoalsData?.getStats() || { total: 0, completed: 0, active: 0, successRate: 0 };
    const goals = window.GoalsData?.getFiltered(currentGoalFilter) || [];
    const config = window.GoalsData?.config || {};
    
    container.innerHTML = `
        <div class="goals-page">
            <!-- Stats Cards -->
            <div class="goals-stats-row">
                <div class="goal-stat-card">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Goals</span>
                </div>
                <div class="goal-stat-card active">
                    <span class="stat-number">${stats.active}</span>
                    <span class="stat-label">Active</span>
                </div>
                <div class="goal-stat-card completed">
                    <span class="stat-number">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="goal-stat-card rate">
                    <span class="stat-number">${stats.successRate}%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
            </div>
            
            <!-- Filter Tabs -->
            <div class="goals-filter-bar">
                <div class="filter-tabs">
                    <button class="filter-tab ${currentGoalFilter === 'all' ? 'active' : ''}" 
                            onclick="GoalsUI.setFilter('all')">All</button>
                    <button class="filter-tab ${currentGoalFilter === 'active' ? 'active' : ''}" 
                            onclick="GoalsUI.setFilter('active')">Active</button>
                    <button class="filter-tab ${currentGoalFilter === 'completed' ? 'active' : ''}" 
                            onclick="GoalsUI.setFilter('completed')">Done</button>
                </div>
                <button class="add-goal-btn" onclick="GoalsUI.showCreateModal()">
                    <i class="fas fa-plus"></i> New Goal
                </button>
            </div>
            
            <!-- Goals List -->
            <div class="goals-list" id="goalsListContainer">
                ${goals.length > 0 ? goals.map(goal => renderGoalCard(goal, config)).join('') : renderEmptyGoals()}
            </div>
        </div>
    `;
}

/**
 * Render a single goal card
 * @param {Object} goal - Goal object
 * @param {Object} config - Goals configuration
 * @returns {string} HTML string
 */
function renderGoalCard(goal, config) {
    const target = goal.target || 1;
    const progress = goal.progress || 0;
    const percentage = Math.min(Math.round((progress / target) * 100), 100);
    const isComplete = goal.completed || progress >= target;
    const icon = config.categoryIcons?.[goal.category] || '🎯';
    const priorityColor = config.priorityColors?.[goal.priority] || '#f59e0b';
    
    // Calculate days remaining
    let deadlineText = '';
    if (goal.deadline) {
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
            deadlineText = `<span class="deadline-badge overdue">Overdue</span>`;
        } else if (daysLeft === 0) {
            deadlineText = `<span class="deadline-badge today">Due Today</span>`;
        } else if (daysLeft <= 7) {
            deadlineText = `<span class="deadline-badge soon">${daysLeft}d left</span>`;
        } else {
            deadlineText = `<span class="deadline-badge">${daysLeft}d left</span>`;
        }
    }
    
    // Milestones HTML
    const milestonesHTML = goal.milestones?.length > 0 ? `
        <div class="goal-milestones">
            <span class="milestones-label">Sub-goals:</span>
            <div class="milestones-list">
                ${goal.milestones.map((m, i) => `
                    <div class="milestone-item ${m.completed ? 'done' : ''}" 
                         onclick="GoalsUI.toggleMilestone('${goal.id}', ${i})">
                        <i class="fas ${m.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                        <span>${sanitizeForHTML(m.text)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    return `
        <div class="goal-card ${isComplete ? 'completed' : ''}" data-goal-id="${goal.id}">
            <div class="goal-card-header">
                <div class="goal-icon-wrap">
                    <span class="goal-icon">${icon}</span>
                </div>
                <div class="goal-info">
                    <h4 class="goal-name">${sanitizeForHTML(goal.name)}</h4>
                    <div class="goal-meta-row">
                        <span class="goal-category">${goal.category}</span>
                        <span class="goal-priority" style="background: ${priorityColor}20; color: ${priorityColor}">
                            ${(goal.priority || 'medium').toUpperCase()}
                        </span>
                        ${deadlineText}
                    </div>
                    ${goal.description ? `<p class="goal-desc">${sanitizeForHTML(goal.description)}</p>` : ''}
                </div>
                <div class="goal-actions-menu">
                    <button class="goal-menu-btn" onclick="GoalsUI.showMenu('${goal.id}', event)">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            <div class="goal-progress-section">
                <div class="progress-header">
                    <span class="progress-text">${progress} / ${target} ${goal.unit || 'units'}</span>
                    <span class="progress-percent ${isComplete ? 'complete' : ''}">${percentage}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill ${isComplete ? 'complete' : ''}" style="width: ${percentage}%"></div>
                </div>
            </div>
            
            ${milestonesHTML}
            
            ${!isComplete ? `
            <div class="goal-quick-update">
                <input type="number" class="quick-progress-input" id="progress_${goal.id}" 
                       value="${progress}" min="0" max="${target}" placeholder="Progress">
                <button class="quick-update-btn" onclick="GoalsUI.updateProgress('${goal.id}')">
                    Update
                </button>
            </div>
            ` : `
            <div class="goal-complete-badge">
                <i class="fas fa-trophy"></i> Goal Achieved!
            </div>
            `}
        </div>
    `;
}

/**
 * Render empty state
 * @returns {string} HTML string
 */
function renderEmptyGoals() {
    const messages = {
        'all': { icon: '🎯', text: 'No goals yet. Set your first goal to get started!' },
        'active': { icon: '📋', text: 'No active goals. All caught up or create a new one!' },
        'completed': { icon: '🏆', text: 'No completed goals yet. Keep working on your goals!' }
    };
    
    const msg = messages[currentGoalFilter] || messages.all;
    
    return `
        <div class="goals-empty-state">
            <span class="empty-icon">${msg.icon}</span>
            <p class="empty-text">${msg.text}</p>
            <button class="btn btn-primary" onclick="GoalsUI.showCreateModal()">
                <i class="fas fa-plus"></i> Create Goal
            </button>
        </div>
    `;
}

// ============================================================================
// Modal Functions
// ============================================================================

/**
 * Show goal creation modal
 */
function showCreateGoalModal() {
    const config = window.GoalsData?.config || {};
    const categories = Object.keys(config.categoryIcons || {});
    
    const modalHTML = `
        <div class="modal-overlay" id="goalModal" onclick="GoalsUI.closeModal(event)">
            <div class="modal-dialog" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Create New Goal</h3>
                    <button class="modal-close" onclick="GoalsUI.closeModal()">&times;</button>
                </div>
                <form onsubmit="GoalsUI.submitGoal(event)">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="goalName">Goal Name *</label>
                            <input type="text" id="goalName" class="form-control" 
                                   placeholder="e.g., Run 100km this month" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="goalDesc">Description</label>
                            <textarea id="goalDesc" class="form-control" rows="2"
                                      placeholder="Why is this goal important to you?"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goalCategory">Category</label>
                                <select id="goalCategory" class="form-control">
                                    ${categories.map(cat => `
                                        <option value="${cat}">${config.categoryIcons[cat]} ${cat}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="goalPriority">Priority</label>
                                <select id="goalPriority" class="form-control">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goalTarget">Target *</label>
                                <input type="number" id="goalTarget" class="form-control" 
                                       placeholder="e.g., 100" min="1" required>
                            </div>
                            <div class="form-group">
                                <label for="goalUnit">Unit *</label>
                                <input type="text" id="goalUnit" class="form-control" 
                                       placeholder="e.g., km, books, days" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="goalDeadline">Deadline (optional)</label>
                            <input type="date" id="goalDeadline" class="form-control"
                                   min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="goalMilestones">Sub-goals (one per line)</label>
                            <textarea id="goalMilestones" class="form-control" rows="3"
                                      placeholder="Break your goal into smaller steps..."></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="GoalsUI.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Goal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('goalName')?.focus();
}

/**
 * Submit goal form
 * @param {Event} event - Form submit event
 */
function submitGoalForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('goalName')?.value.trim();
    const target = parseInt(document.getElementById('goalTarget')?.value);
    const unit = document.getElementById('goalUnit')?.value.trim();
    
    if (!name || !target || !unit) {
        showToast('Please fill in required fields', 'error');
        return;
    }
    
    const milestonesText = document.getElementById('goalMilestones')?.value || '';
    const milestones = milestonesText
        .split('\n')
        .filter(m => m.trim())
        .map((text, i) => ({ id: `ms_${i}`, text: text.trim(), completed: false }));
    
    const goalData = {
        name,
        description: document.getElementById('goalDesc')?.value.trim() || '',
        category: document.getElementById('goalCategory')?.value || 'Personal',
        priority: document.getElementById('goalPriority')?.value || 'medium',
        target,
        unit,
        deadline: document.getElementById('goalDeadline')?.value || null,
        milestones
    };
    
    window.GoalsData?.create(goalData);
    
    // Award XP
    const xp = milestones.length > 0 ? 25 : 10;
    if (typeof addXP === 'function') addXP(xp);
    
    showToast(`🎯 Goal created! +${xp} XP`, 'success');
    closeGoalModal();
    renderGoalsView();
}

/**
 * Close modal
 * @param {Event} event - Optional click event
 */
function closeGoalModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('goalModal')?.remove();
    document.getElementById('goalMenuPopup')?.remove();
}

// ============================================================================
// Action Handlers
// ============================================================================

/**
 * Set filter and re-render
 * @param {string} filter - Filter value
 */
function setGoalFilter(filter) {
    currentGoalFilter = filter;
    renderGoalsView();
}

/**
 * Update goal progress
 * @param {string} goalId - Goal identifier
 */
function updateGoalProgressUI(goalId) {
    const input = document.getElementById(`progress_${goalId}`);
    if (!input) return;
    
    const newProgress = parseInt(input.value) || 0;
    const result = window.GoalsData?.updateProgress(goalId, newProgress);
    
    if (result) {
        if (result.progressDelta > 0) {
            const xp = result.progressDelta * 5;
            if (typeof addXP === 'function') addXP(xp);
            showToast(`+${xp} XP for progress!`, 'success');
        }
        
        if (result.isNowComplete) {
            if (typeof celebrateAchievement === 'function') {
                celebrateAchievement(`${result.goal.name} Complete!`, '🏆');
            }
            if (typeof addXP === 'function') addXP(100);
            showToast('🎉 Goal Completed! +100 XP Bonus!', 'success');
        }
        
        renderGoalsView();
    }
}

/**
 * Toggle milestone completion
 * @param {string} goalId - Goal identifier
 * @param {number} index - Milestone index
 */
function toggleGoalMilestone(goalId, index) {
    const completed = window.GoalsData?.toggleMilestone(goalId, index);
    
    if (completed) {
        if (typeof addXP === 'function') addXP(5);
        showToast('Sub-goal completed! +5 XP', 'success');
    }
    
    renderGoalsView();
}

/**
 * Show goal context menu
 * @param {string} goalId - Goal identifier
 * @param {Event} event - Click event
 */
function showGoalMenu(goalId, event) {
    event.stopPropagation();
    
    // Remove existing menu
    document.getElementById('goalMenuPopup')?.remove();
    
    const rect = event.target.getBoundingClientRect();
    
    const menuHTML = `
        <div id="goalMenuPopup" class="goal-popup-menu" style="top: ${rect.bottom + 5}px; right: ${window.innerWidth - rect.right}px;">
            <button onclick="GoalsUI.editGoal('${goalId}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="danger" onclick="GoalsUI.deleteGoal('${goalId}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            document.getElementById('goalMenuPopup')?.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 10);
}

/**
 * Edit goal
 * @param {string} goalId - Goal identifier
 */
function editGoal(goalId) {
    const goal = window.GoalsData?.getById(goalId);
    if (!goal) return;
    
    const newName = prompt('Edit goal name:', goal.name);
    if (newName && newName.trim() && newName !== goal.name) {
        window.GoalsData?.update(goalId, { name: newName.trim() });
        showToast('Goal updated', 'success');
        renderGoalsView();
    }
}

/**
 * Delete goal
 * @param {string} goalId - Goal identifier
 */
function deleteGoalUI(goalId) {
    const goal = window.GoalsData?.getById(goalId);
    if (!goal) return;
    
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
        window.GoalsData?.delete(goalId);
        showToast('Goal deleted', 'info');
        renderGoalsView();
    }
}

// ============================================================================
// Sanitization Fallback
// ============================================================================

if (typeof sanitizeForHTML !== 'function') {
    window.sanitizeForHTML = function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };
}

// ============================================================================
// Exports
// ============================================================================

if (typeof window !== 'undefined') {
    window.GoalsUI = {
        render: renderGoalsView,
        setFilter: setGoalFilter,
        showCreateModal: showCreateGoalModal,
        submitGoal: submitGoalForm,
        closeModal: closeGoalModal,
        updateProgress: updateGoalProgressUI,
        toggleMilestone: toggleGoalMilestone,
        showMenu: showGoalMenu,
        editGoal: editGoal,
        deleteGoal: deleteGoalUI
    };
    
    // Legacy compatibility
    window.renderGoals = renderGoalsView;
}
