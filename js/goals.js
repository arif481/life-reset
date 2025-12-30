/**
 * @fileoverview Goals & Milestones Module
 * @description Goal setting, tracking, and progress management
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Configuration Constants
   ========================================================================== */

const categoryIcons = {
    'Health': '💪',
    'Productivity': '🚀',
    'Personal': '✨',
    'Learning': '📚'
};

const priorityColors = {
    'high': '#ff6b6b',
    'medium': '#ffc107',
    'low': '#4cc9f0'
};

let currentGoalFilter = 'all';

// Show advanced goal modal
function showAdvancedGoalModal() {
    const modal = document.createElement('div');
    modal.id = 'advancedGoalModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-bottom: 20px;">Create Advanced Goal</h2>
            <form onsubmit="saveAdvancedGoal(event)">
                <div class="form-group">
                    <label>Goal Name *</label>
                    <input type="text" id="advGoalName" class="form-control" placeholder="E.g., Run a 5K" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="advGoalDesc" class="form-control" placeholder="Why is this goal important?" rows="3"></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Category *</label>
                        <select id="advGoalCategory" class="form-control" required>
                            <option value="Health">💪 Health</option>
                            <option value="Productivity">🚀 Productivity</option>
                            <option value="Learning">📚 Learning</option>
                            <option value="Personal">✨ Personal</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority *</label>
                        <select id="advGoalPriority" class="form-control" required>
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Target Value *</label>
                        <input type="number" id="advGoalTarget" class="form-control" placeholder="E.g., 5" required>
                    </div>
                    <div class="form-group">
                        <label>Unit of Measurement *</label>
                        <input type="text" id="advGoalUnit" class="form-control" placeholder="E.g., km, books, days" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Deadline (optional)</label>
                    <input type="date" id="advGoalDeadline" class="form-control">
                </div>
                <div class="form-group">
                    <label>Sub-goals (one per line)</label>
                    <textarea id="advGoalMilestones" class="form-control" placeholder="Break down your goal&#10;E.g. Complete 10k run&#10;Complete 5k run" rows="3"></textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Create Goal</button>
                    <button type="button" class="btn btn-secondary" onclick="closeAdvancedModal()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveAdvancedGoal(event) {
    event.preventDefault();
    
    const name = document.getElementById('advGoalName').value.trim();
    const description = document.getElementById('advGoalDesc').value.trim();
    const category = document.getElementById('advGoalCategory').value;
    const priority = document.getElementById('advGoalPriority').value;
    const target = parseInt(document.getElementById('advGoalTarget').value);
    const unit = document.getElementById('advGoalUnit').value.trim();
    const deadline = document.getElementById('advGoalDeadline').value;
    const milestonesText = document.getElementById('advGoalMilestones').value;
    
    if (!name || !target || !unit) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const milestones = milestonesText
        .split('\n')
        .filter(m => m.trim())
        .map((m, i) => ({ id: `ms_${i}`, text: m.trim(), completed: false }));
    
    const newGoal = {
        id: 'goal_' + Date.now(),
        name: name,
        description: description,
        category: category,
        priority: priority,
        progress: 0,
        target: target,
        unit: unit,
        deadline: deadline || null,
        milestones: milestones,
        createdAt: new Date().toISOString(),
        completed: false,
        startDate: getDateString(new Date())
    };
    
    appState.userGoals.push(newGoal);
    saveGoalsRealtime();
    renderGoals();
    addXP(25);
    showToast('🎯 Advanced goal created! +25 XP', 'success');
    closeAdvancedModal();
}

function closeAdvancedModal() {
    const modal = document.getElementById('advancedGoalModal');
    if (modal) modal.remove();
}

// Show simple goal modal
function showAddGoalModal() {
    const goalName = prompt('Enter goal name (e.g., "Run 100km", "Read 12 books"):');
    if (!goalName || !goalName.trim()) {
        showToast('Goal name is required', 'error');
        return;
    }
    
    const goalCategory = prompt('Goal category:\n1. Health (💪)\n2. Productivity (🚀)\n3. Learning (📚)\n4. Personal (✨)\n\nEnter 1-4 (default: 1):', '1');
    const categoryMap = { '1': 'Health', '2': 'Productivity', '3': 'Learning', '4': 'Personal' };
    const category = categoryMap[goalCategory] || 'Health';
    
    const goalTarget = parseInt(prompt('Target (e.g., number of days, kilometers, books):', '30'));
    
    if (isNaN(goalTarget) || goalTarget <= 0) {
        showToast('Please enter a valid target number', 'error');
        return;
    }
    
    const unit = prompt('Unit of measurement (e.g., days, km, books):', 'units');
    
    const newGoal = {
        id: 'goal_' + Date.now(),
        name: goalName.trim(),
        category: category,
        priority: 'medium',
        progress: 0,
        target: goalTarget,
        unit: unit,
        milestone: [],
        createdAt: new Date().toISOString(),
        completed: false,
        startDate: getDateString(new Date())
    };
    
    appState.userGoals.push(newGoal);
    saveGoalsRealtime();
    renderGoals();
    addXP(10);
    showToast('🎯 Goal created! +10 XP', 'success');
}

// Render all goals
function renderGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Calculate statistics
    const completed = appState.userGoals.filter(g => g.completed || g.progress >= g.target).length;
    const active = appState.userGoals.filter(g => !g.completed && g.progress < g.target).length;
    const total = appState.userGoals.length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update stats display
    const statsIds = {
        'totalGoalsCount': total,
        'completedGoalsCount': completed,
        'activeGoalsCount': active,
        'successRateGoals': successRate + '%'
    };
    
    Object.entries(statsIds).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    
    // Filter goals
    let goalsToShow = appState.userGoals;
    if (currentGoalFilter === 'active') {
        goalsToShow = appState.userGoals.filter(g => !g.completed && g.progress < g.target);
    } else if (currentGoalFilter === 'completed') {
        goalsToShow = appState.userGoals.filter(g => g.completed || g.progress >= g.target);
    } else if (['Health', 'Productivity', 'Learning', 'Personal'].includes(currentGoalFilter)) {
        goalsToShow = appState.userGoals.filter(g => g.category === currentGoalFilter);
    }
    
    if (goalsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-goals-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No goals found. Create one to get started!</div>
            </div>
        `;
        return;
    }
    
    goalsToShow.forEach(goal => {
        // Prevent division by zero - default target to 1 if 0 or undefined
        const safeTarget = (goal.target && goal.target > 0) ? goal.target : 1;
        const percentage = Math.min(((goal.progress || 0) / safeTarget) * 100, 100);
        const isCompleted = goal.completed || (goal.progress || 0) >= safeTarget;
        const icon = categoryIcons[goal.category] || '🎯';
        const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        const goalEl = document.createElement('div');
        goalEl.className = `goal-item ${isCompleted ? 'completed' : ''}`;
        goalEl.setAttribute('data-category', goal.category);
        goalEl.setAttribute('data-status', isCompleted ? 'completed' : 'active');
        
        const milestonesHTML = goal.milestones && goal.milestones.length > 0 ? `
            <div class="milestones-section">
                <div class="milestones-title">Sub-Goals</div>
                <ul class="milestone-list">
                    ${goal.milestones.map((m, i) => `
                        <li class="milestone-item ${m.completed ? 'completed' : ''}">
                            <input type="checkbox" class="milestone-checkbox" ${m.completed ? 'checked' : ''} 
                                   onchange="toggleMilestone('${goal.id}', ${i}, this.checked)">
                            <span class="milestone-text">${sanitizeHTML(m.text)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';
        
        const deadlineHTML = goal.deadline ? `
            <span style="font-size: 11px; color: ${daysLeft < 0 ? '#ff6b6b' : daysLeft < 7 ? '#ffc107' : '#4cc9f0'};">
                ${daysLeft < 0 ? '⏰ Overdue' : daysLeft === 0 ? '🔥 Today' : `📅 ${daysLeft}d left`}
            </span>
        ` : '';
        
        goalEl.innerHTML = `
            <div class="goal-header">
                <div class="goal-header-left">
                    <div class="goal-icon">${icon}</div>
                    <div class="goal-meta">
                        <div class="goal-title">${goal.name}</div>
                        <div class="goal-tags">
                            <span class="goal-category">${goal.category}</span>
                            <span class="goal-priority ${goal.priority || 'medium'}">${(goal.priority || 'medium').toUpperCase()}</span>
                            ${deadlineHTML}
                        </div>
                        ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="goal-action-btn" onclick="editGoal('${goal.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="goal-action-btn" onclick="deleteGoal('${goal.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            
            <div class="goal-details">
                <div class="goal-progress-container">
                    <div class="goal-progress-header">
                        <span class="goal-progress-label">${isCompleted ? '✅ Completed' : 'Progress'}</span>
                        <div class="goal-progress-stats">
                            <span>${goal.progress}/${goal.target} ${goal.unit}</span>
                            <span>${Math.round(percentage)}%</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; ${isCompleted ? 'background: linear-gradient(90deg, #4cc9f0 0%, #00d9ff 100%);' : ''}"></div>
                    </div>
                    ${!isCompleted ? `
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <input type="number" id="progress_${goal.id}" value="${goal.progress}" min="0" max="${goal.target}" 
                                   class="goal-progress-input" placeholder="Enter progress">
                            <button class="btn btn-primary" onclick="updateGoalProgressFromInput('${goal.id}')" style="flex-shrink: 0;">Update</button>
                        </div>
                    ` : ''}
                </div>
                
                ${milestonesHTML}
            </div>
        `;
        
        container.appendChild(goalEl);
    });
}

// Toggle milestone completion
function toggleMilestone(goalId, index, completed) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (goal && goal.milestones && goal.milestones[index]) {
        goal.milestones[index].completed = completed;
        saveGoalsRealtime();
        renderGoals();
    }
}

// Edit goal
function editGoal(goalId) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (!goal) {
        showToast('Goal not found', 'error');
        return;
    }
    
    const newName = prompt('Edit goal name:', goal.name);
    if (newName && newName.trim()) {
        goal.name = newName.trim();
        saveGoalsRealtime();
        renderGoals();
        showToast('Goal updated', 'success');
    }
}

/**
 * Update goal progress from input field
 * @param {string} goalId - Goal identifier
 */
function updateGoalProgressFromInput(goalId) {
    const input = document.getElementById(`progress_${goalId}`);
    if (!input) return;
    
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (goal && !goal.completed) {
        const safeTarget = (goal.target && goal.target > 0) ? goal.target : 1;
        const newProgress = Math.min(Math.max(0, parseInt(input.value) || 0), safeTarget);
        const oldProgress = goal.progress;
        goal.progress = newProgress;
        
        if (goal.progress > oldProgress) {
            const xpGain = 5 * (goal.progress - oldProgress);
            addXP(xpGain);
            showToast(`+${xpGain} XP for goal progress!`, 'success');
        }
        
        if (goal.progress >= goal.target && !goal.completed) {
            goal.completed = true;
            celebrateAchievement(`${goal.name} Complete! 🎯`, '🏆');
            addXP(100);
            showToast('🎉 Goal Completed! +100 XP Bonus!', 'success');
        }
        
        saveGoalsRealtime();
        renderGoals();
        updateGamificationUI();
    }
}

/**
 * Delete a goal by ID
 * @param {string} goalId - Goal identifier
 */
function deleteGoal(goalId) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (!goal) {
        showToast('Goal not found', 'error');
        return;
    }
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
        appState.userGoals = appState.userGoals.filter(g => g.id !== goalId);
        saveGoalsRealtime();
        renderGoals();
        showToast('Goal deleted', 'info');
    }
}

// Filter goals
function filterGoals(filter, element) {
    currentGoalFilter = filter;
    document.querySelectorAll('.goal-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderGoals();
}

// Save goals to Firebase
async function saveGoals() {
    if (!appState.currentUser || !db) return;
    
    try {
        window.isLocalUpdate = true;
        await db.collection('users').doc(appState.currentUser.uid).set(
            { goals: appState.userGoals },
            { merge: true }
        );
        setTimeout(() => { window.isLocalUpdate = false; }, 100);
    } catch (error) {
        console.error('Error saving goals:', error);
        window.isLocalUpdate = false;
    }
}

/**
 * Debounced wrapper for goal persistence
 * @private
 */
function saveGoalsRealtime() {
    if (typeof debouncedSave === 'function') {
        debouncedSave('goals', saveGoals, 500);
    } else {
        saveGoals();
    }
}

// Render habit chain
function renderHabitChain() {
    const container = document.getElementById('habitChain');
    if (!container) return;
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'habit-chain-grid';
    
    const today = new Date();
    const streakData = calculateHabitStreak();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        
        const dayEl = document.createElement('div');
        const isToday = i === 0;
        const taskData = appState.userTasks[dateStr];
        
        let status = 'missed';
        let progress = '0%';
        
        if (taskData) {
            const completed = Object.values(taskData).filter(t => t.completed).length;
            const total = Object.keys(taskData).length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            
            if (percentage === 100) status = 'completed';
            else if (percentage > 0) status = 'partial';
            
            progress = Math.round(percentage) + '%';
        }
        
        dayEl.className = `habit-day ${status} ${isToday ? 'today' : ''}`;
        dayEl.textContent = (date.getDate());
        dayEl.title = `${date.toLocaleDateString()}: ${progress}`;
        
        gridContainer.appendChild(dayEl);
    }
    
    container.innerHTML = '';
    container.appendChild(gridContainer);
    
    // Update habit stats
    updateHabitStats(streakData);
}

// Calculate habit streak using tasksHistory (date-indexed completion data)
function calculateHabitStreak() {
    const today = new Date();
    let streak = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    let isCurrentStreak = true; // Track if we're in today's streak
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        
        // Use tasksHistory which is date-indexed, not userTasks which is category-indexed
        const dayData = appState.tasksHistory ? appState.tasksHistory[dateStr] : null;
        
        if (dayData && dayData.total > 0) {
            const percentage = dayData.rate || Math.round((dayData.completed / dayData.total) * 100);
            
            if (percentage === 100) {
                currentStreak++;
                if (isCurrentStreak) streak = currentStreak; // Only update if still in current streak
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 0;
                isCurrentStreak = false;
            }
        } else {
            bestStreak = Math.max(bestStreak, currentStreak);
            currentStreak = 0;
            isCurrentStreak = false;
        }
    }
    
    bestStreak = Math.max(bestStreak, currentStreak);
    
    return { current: streak, best: bestStreak };
}

// Update habit statistics
function updateHabitStats(streakData) {
    const today = new Date();
    let completedDays = 0;
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const taskData = appState.userTasks[dateStr];
        
        if (taskData) {
            const completed = Object.values(taskData).filter(t => t.completed).length;
            const total = Object.keys(taskData).length;
            if (total > 0 && (completed / total) === 1) {
                completedDays++;
            }
        }
    }
    
    const completionRate = Math.round((completedDays / 30) * 100);
    
    const els = {
        'habitStreak': streakData.current,
        'bestHabitStreak': streakData.best,
        'habitCompletion': completionRate + '%'
    };
    
    Object.entries(els).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

// FIX #7: Goal Progress Tracking Functions

async function updateGoalProgress(goalId, amount) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (!goal) {
        showToast('Goal not found', 'error');
        return;
    }
    
    const oldProgress = goal.progress || 0;
    goal.progress = Math.min(oldProgress + amount, goal.target);
    
    // Check if goal is completed
    if (goal.progress >= goal.target && !goal.completed) {
        goal.completed = true;
        goal.completedAt = new Date().toISOString();
        completeGoal(goalId);
    }
    
    saveGoalsRealtime();
    renderGoals();
}

async function completeGoal(goalId) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    showToast(`🎉 Goal Completed: ${goal.name}!`, 'success');
    celebrateAchievement(`Goal: ${goal.name}`, 'fa-trophy');
    addXP(50);
    
    // Save completion
    if (db && appState.currentUser) {
        try {
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('completedGoals').doc(goalId).set({
                    goalId: goalId,
                    name: goal.name,
                    completedAt: new Date(),
                    xpEarned: 50
                });
        } catch (error) {
            console.error('Error saving completed goal:', error);
        }
    }
}

function showProgressModal(goalId) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const maxProgress = goal.target - (goal.progress || 0);
    const amount = prompt(`How much progress on "${goal.name}"? (0-${maxProgress})`);
    if (amount && !isNaN(amount) && amount > 0) {
        updateGoalProgress(goalId, parseInt(amount));
    }
}
