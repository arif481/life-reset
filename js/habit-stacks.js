/**
 * @fileoverview Habit Stacking & Templates Module
 * @description Pre-built habit routines, morning/evening sequences, habit chains
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Habit Stack Templates
   ========================================================================== */

const HABIT_STACK_TEMPLATES = {
    morning_power: {
        id: 'morning_power',
        name: 'Morning Power Routine',
        description: 'Start your day with energy and focus',
        icon: '🌅',
        duration: 60,
        habits: [
            { id: 'wake_early', name: 'Wake Up Early', duration: 5, icon: '⏰', order: 1 },
            { id: 'hydrate', name: 'Drink Water', duration: 2, icon: '💧', order: 2 },
            { id: 'stretch', name: 'Morning Stretch', duration: 10, icon: '🧘', order: 3 },
            { id: 'meditation', name: 'Meditation', duration: 10, icon: '🧠', order: 4 },
            { id: 'exercise', name: 'Exercise', duration: 20, icon: '💪', order: 5 },
            { id: 'shower', name: 'Cold Shower', duration: 5, icon: '🚿', order: 6 },
            { id: 'healthy_breakfast', name: 'Healthy Breakfast', duration: 15, icon: '🥗', order: 7 }
        ],
        category: 'wellness',
        xpReward: 100
    },
    evening_wind_down: {
        id: 'evening_wind_down',
        name: 'Evening Wind Down',
        description: 'Prepare for restful sleep',
        icon: '🌙',
        duration: 45,
        habits: [
            { id: 'screen_off', name: 'Screens Off', duration: 5, icon: '📵', order: 1 },
            { id: 'review_day', name: 'Review Day', duration: 5, icon: '📝', order: 2 },
            { id: 'plan_tomorrow', name: 'Plan Tomorrow', duration: 10, icon: '📋', order: 3 },
            { id: 'gratitude', name: 'Gratitude Journal', duration: 5, icon: '🙏', order: 4 },
            { id: 'reading', name: 'Read a Book', duration: 15, icon: '📚', order: 5 },
            { id: 'relaxation', name: 'Relaxation', duration: 10, icon: '😌', order: 6 }
        ],
        category: 'wellness',
        xpReward: 80
    },
    productivity_boost: {
        id: 'productivity_boost',
        name: 'Productivity Boost',
        description: 'Maximize your work sessions',
        icon: '🚀',
        duration: 30,
        habits: [
            { id: 'clear_desk', name: 'Clear Workspace', duration: 3, icon: '🧹', order: 1 },
            { id: 'set_goals', name: 'Set 3 Goals', duration: 5, icon: '🎯', order: 2 },
            { id: 'block_distractions', name: 'Block Distractions', duration: 2, icon: '🔕', order: 3 },
            { id: 'deep_work', name: 'Deep Work Block', duration: 25, icon: '💻', order: 4 }
        ],
        category: 'productivity',
        xpReward: 60
    },
    mindfulness: {
        id: 'mindfulness',
        name: 'Mindfulness Practice',
        description: 'Center yourself and reduce stress',
        icon: '🧘',
        duration: 25,
        habits: [
            { id: 'breathing', name: 'Deep Breathing', duration: 5, icon: '🌬️', order: 1 },
            { id: 'body_scan', name: 'Body Scan', duration: 5, icon: '🔍', order: 2 },
            { id: 'mindful_meditation', name: 'Mindful Meditation', duration: 10, icon: '🧠', order: 3 },
            { id: 'intention', name: 'Set Intention', duration: 5, icon: '✨', order: 4 }
        ],
        category: 'mental',
        xpReward: 50
    },
    fitness_quick: {
        id: 'fitness_quick',
        name: 'Quick Fitness',
        description: '15-minute workout routine',
        icon: '💪',
        duration: 15,
        habits: [
            { id: 'warmup', name: 'Warm Up', duration: 2, icon: '🔥', order: 1 },
            { id: 'cardio', name: 'Cardio Burst', duration: 5, icon: '🏃', order: 2 },
            { id: 'strength', name: 'Strength Training', duration: 5, icon: '🏋️', order: 3 },
            { id: 'cooldown', name: 'Cool Down', duration: 3, icon: '❄️', order: 4 }
        ],
        category: 'fitness',
        xpReward: 40
    },
    learning_session: {
        id: 'learning_session',
        name: 'Learning Session',
        description: 'Structured learning time',
        icon: '📚',
        duration: 45,
        habits: [
            { id: 'review_notes', name: 'Review Notes', duration: 5, icon: '📝', order: 1 },
            { id: 'active_learning', name: 'Active Learning', duration: 25, icon: '🎓', order: 2 },
            { id: 'practice', name: 'Practice/Apply', duration: 10, icon: '✍️', order: 3 },
            { id: 'summarize', name: 'Summarize', duration: 5, icon: '📋', order: 4 }
        ],
        category: 'learning',
        xpReward: 70
    },
    self_care: {
        id: 'self_care',
        name: 'Self-Care Sunday',
        description: 'Weekly self-care routine',
        icon: '💆',
        duration: 60,
        habits: [
            { id: 'skincare', name: 'Skincare Routine', duration: 15, icon: '🧴', order: 1 },
            { id: 'hobby', name: 'Enjoy a Hobby', duration: 30, icon: '🎨', order: 2 },
            { id: 'connect', name: 'Connect with Loved One', duration: 15, icon: '❤️', order: 3 }
        ],
        category: 'wellness',
        xpReward: 60
    },
    digital_detox: {
        id: 'digital_detox',
        name: 'Digital Detox',
        description: 'Unplug and recharge',
        icon: '📵',
        duration: 120,
        habits: [
            { id: 'phone_away', name: 'Put Phone Away', duration: 1, icon: '📱', order: 1 },
            { id: 'nature_walk', name: 'Nature Walk', duration: 30, icon: '🌳', order: 2 },
            { id: 'creative', name: 'Creative Activity', duration: 45, icon: '🎨', order: 3 },
            { id: 'reflect', name: 'Reflect & Journal', duration: 15, icon: '📓', order: 4 }
        ],
        category: 'wellness',
        xpReward: 90
    }
};

/* ==========================================================================
   Habit Stack State
   ========================================================================== */

let habitStackState = {
    activeStacks: [],
    completedStacks: [],
    customStacks: [],
    currentStack: null,
    currentHabitIndex: 0,
    stackTimer: null,
    stackStartTime: null
};

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initHabitStacks() {
    console.log('[HabitStacks] Initializing...');
    await loadHabitStackData();
    console.log('[HabitStacks] Initialized with', habitStackState.activeStacks.length, 'active stacks');
}

async function loadHabitStackData() {
    try {
        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('features')
                .doc('habitStacks')
                .get();

            if (doc.exists) {
                const data = doc.data();
                habitStackState.activeStacks = data.active || [];
                habitStackState.completedStacks = data.completed || [];
                habitStackState.customStacks = data.custom || [];
            }
        } else {
            const saved = localStorage.getItem('habitStacks');
            if (saved) {
                Object.assign(habitStackState, JSON.parse(saved));
            }
        }
    } catch (error) {
        console.error('[HabitStacks] Load error:', error);
    }
}

async function saveHabitStackData() {
    const data = {
        active: habitStackState.activeStacks,
        completed: habitStackState.completedStacks,
        custom: habitStackState.customStacks,
        updatedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem('habitStacks', JSON.stringify(data));

        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('features')
                .doc('habitStacks')
                .set(data, { merge: true });
        }
    } catch (error) {
        console.error('[HabitStacks] Save error:', error);
    }
}

/* ==========================================================================
   Stack Management
   ========================================================================== */

function adoptStack(templateId) {
    const template = HABIT_STACK_TEMPLATES[templateId];
    if (!template) return { success: false, error: 'Template not found' };

    // Check if already adopted
    if (habitStackState.activeStacks.some(s => s.templateId === templateId)) {
        return { success: false, error: 'Stack already active' };
    }

    const stack = {
        id: `stack_${Date.now()}`,
        templateId,
        name: template.name,
        description: template.description,
        icon: template.icon,
        habits: template.habits.map(h => ({
            ...h,
            completed: false,
            streak: 0
        })),
        duration: template.duration,
        xpReward: template.xpReward,
        adoptedAt: new Date().toISOString(),
        completions: 0,
        lastCompleted: null
    };

    habitStackState.activeStacks.push(stack);
    saveHabitStackData();

    return { success: true, stack };
}

function createCustomStack(data) {
    const stack = {
        id: `custom_${Date.now()}`,
        name: data.name,
        description: data.description || '',
        icon: data.icon || '📋',
        habits: data.habits.map((h, index) => ({
            id: `habit_${Date.now()}_${index}`,
            name: h.name,
            duration: h.duration || 5,
            icon: h.icon || '✅',
            order: index + 1,
            completed: false,
            streak: 0
        })),
        duration: data.habits.reduce((sum, h) => sum + (h.duration || 5), 0),
        xpReward: Math.min(150, data.habits.length * 15),
        isCustom: true,
        createdAt: new Date().toISOString(),
        completions: 0,
        lastCompleted: null
    };

    habitStackState.customStacks.push(stack);
    habitStackState.activeStacks.push(stack);
    saveHabitStackData();

    return { success: true, stack };
}

function removeStack(stackId) {
    habitStackState.activeStacks = habitStackState.activeStacks.filter(s => s.id !== stackId);
    saveHabitStackData();
    return { success: true };
}

/* ==========================================================================
   Stack Execution
   ========================================================================== */

function startStack(stackId) {
    const stack = habitStackState.activeStacks.find(s => s.id === stackId);
    if (!stack) return { success: false, error: 'Stack not found' };

    // Reset completion status
    stack.habits.forEach(h => h.completed = false);

    habitStackState.currentStack = stack;
    habitStackState.currentHabitIndex = 0;
    habitStackState.stackStartTime = Date.now();

    showStackExecutionModal(stack);
    return { success: true };
}

function completeCurrentHabit() {
    if (!habitStackState.currentStack) return;

    const stack = habitStackState.currentStack;
    const habit = stack.habits[habitStackState.currentHabitIndex];
    
    if (habit) {
        habit.completed = true;
        habit.streak = (habit.streak || 0) + 1;

        // Award partial XP
        const habitXP = Math.round(stack.xpReward / stack.habits.length);
        if (typeof addXP === 'function') {
            addXP(habitXP, `Completed: ${habit.name}`);
        }
    }

    habitStackState.currentHabitIndex++;

    if (habitStackState.currentHabitIndex >= stack.habits.length) {
        completeStack();
    } else {
        updateStackExecutionUI();
    }
}

function skipCurrentHabit() {
    if (!habitStackState.currentStack) return;

    habitStackState.currentHabitIndex++;

    if (habitStackState.currentHabitIndex >= habitStackState.currentStack.habits.length) {
        completeStack();
    } else {
        updateStackExecutionUI();
    }
}

function completeStack() {
    const stack = habitStackState.currentStack;
    if (!stack) return;

    const completedHabits = stack.habits.filter(h => h.completed).length;
    const completionRate = completedHabits / stack.habits.length;

    stack.completions = (stack.completions || 0) + 1;
    stack.lastCompleted = new Date().toISOString();

    // Record completion
    habitStackState.completedStacks.push({
        stackId: stack.id,
        stackName: stack.name,
        completedAt: new Date().toISOString(),
        duration: Date.now() - habitStackState.stackStartTime,
        completionRate,
        habitsCompleted: completedHabits,
        totalHabits: stack.habits.length
    });

    // Bonus XP for full completion
    if (completionRate === 1) {
        const bonusXP = Math.round(stack.xpReward * 0.25);
        if (typeof addXP === 'function') {
            addXP(bonusXP, `Perfect stack completion: ${stack.name}`);
        }
    }

    saveHabitStackData();

    // Show completion
    showStackCompleteModal(stack, completionRate);

    // Reset
    habitStackState.currentStack = null;
    habitStackState.currentHabitIndex = 0;
    habitStackState.stackStartTime = null;

    // Dispatch event
    document.dispatchEvent(new CustomEvent('stackCompleted', {
        detail: { stack, completionRate }
    }));
}

function cancelStack() {
    if (habitStackState.stackTimer) {
        clearInterval(habitStackState.stackTimer);
    }
    habitStackState.currentStack = null;
    habitStackState.currentHabitIndex = 0;
    habitStackState.stackStartTime = null;

    const modal = document.getElementById('stackExecutionModal');
    if (modal) modal.remove();
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderHabitStacksUI() {
    const container = document.getElementById('habitStacksContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="habit-stacks-section">
            <div class="stacks-header">
                <h2>📚 Habit Stacks</h2>
                <button class="btn-primary btn-sm" onclick="showCreateStackModal()">
                    + Create Stack
                </button>
            </div>

            ${habitStackState.activeStacks.length > 0 ? `
                <div class="active-stacks">
                    <h3>🎯 Your Stacks</h3>
                    <div class="stacks-grid">
                        ${habitStackState.activeStacks.map(stack => renderStackCard(stack)).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="stack-templates">
                <h3>📋 Templates</h3>
                <div class="templates-grid">
                    ${Object.values(HABIT_STACK_TEMPLATES).map(template => `
                        <div class="template-card ${habitStackState.activeStacks.some(s => s.templateId === template.id) ? 'adopted' : ''}">
                            <div class="template-icon">${template.icon}</div>
                            <div class="template-content">
                                <h4>${template.name}</h4>
                                <p>${template.description}</p>
                                <div class="template-meta">
                                    <span>⏱️ ${template.duration}min</span>
                                    <span>📝 ${template.habits.length} habits</span>
                                    <span>⭐ ${template.xpReward} XP</span>
                                </div>
                            </div>
                            ${habitStackState.activeStacks.some(s => s.templateId === template.id) 
                                ? '<span class="adopted-badge">✓ Active</span>'
                                : `<button class="btn-secondary btn-sm" onclick="adoptStack('${template.id}'); renderHabitStacksUI();">Adopt</button>`
                            }
                        </div>
                    `).join('')}
                </div>
            </div>

            ${habitStackState.completedStacks.length > 0 ? `
                <div class="stack-history">
                    <h3>📊 Recent Completions</h3>
                    <div class="history-list">
                        ${habitStackState.completedStacks.slice(-5).reverse().map(completion => `
                            <div class="history-item">
                                <span class="stack-name">${completion.stackName}</span>
                                <span class="completion-rate">${Math.round(completion.completionRate * 100)}%</span>
                                <span class="date">${new Date(completion.completedAt).toLocaleDateString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderStackCard(stack) {
    const completedToday = stack.lastCompleted && 
        new Date(stack.lastCompleted).toDateString() === new Date().toDateString();

    return `
        <div class="stack-card ${completedToday ? 'completed-today' : ''}">
            <div class="stack-header">
                <span class="stack-icon">${stack.icon}</span>
                <div class="stack-info">
                    <h4>${stack.name}</h4>
                    <span class="habit-count">${stack.habits.length} habits • ${stack.duration}min</span>
                </div>
            </div>
            <div class="stack-habits">
                ${stack.habits.slice(0, 4).map(h => `
                    <span class="habit-chip">${h.icon} ${h.name}</span>
                `).join('')}
                ${stack.habits.length > 4 ? `<span class="more">+${stack.habits.length - 4} more</span>` : ''}
            </div>
            <div class="stack-footer">
                <span class="completions">🏆 ${stack.completions || 0} completions</span>
                <div class="stack-actions">
                    ${completedToday 
                        ? '<span class="done-badge">✓ Done Today</span>'
                        : `<button class="btn-primary btn-sm" onclick="startStack('${stack.id}')">▶ Start</button>`
                    }
                    <button class="btn-icon" onclick="removeStack('${stack.id}'); renderHabitStacksUI();">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

function showStackExecutionModal(stack) {
    const modal = document.createElement('div');
    modal.className = 'modal stack-execution-modal';
    modal.id = 'stackExecutionModal';
    modal.innerHTML = getStackExecutionHTML(stack);
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function getStackExecutionHTML(stack) {
    const currentHabit = stack.habits[habitStackState.currentHabitIndex];
    const progress = (habitStackState.currentHabitIndex / stack.habits.length) * 100;

    return `
        <div class="modal-content execution-content">
            <div class="execution-header">
                <span class="stack-name">${stack.icon} ${stack.name}</span>
                <button class="close-btn" onclick="cancelStack()">×</button>
            </div>
            
            <div class="execution-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${habitStackState.currentHabitIndex + 1} / ${stack.habits.length}</span>
            </div>

            <div class="current-habit">
                <div class="habit-icon-large">${currentHabit.icon}</div>
                <h3>${currentHabit.name}</h3>
                <p class="duration">⏱️ ${currentHabit.duration} minutes</p>
            </div>

            <div class="habit-timer" id="habitTimer">
                <span class="timer-display">${currentHabit.duration}:00</span>
            </div>

            <div class="execution-actions">
                <button class="btn-secondary" onclick="skipCurrentHabit()">Skip</button>
                <button class="btn-primary btn-lg" onclick="completeCurrentHabit()">✓ Complete</button>
            </div>

            <div class="upcoming-habits">
                <h4>Coming Up</h4>
                ${stack.habits.slice(habitStackState.currentHabitIndex + 1, habitStackState.currentHabitIndex + 3).map(h => `
                    <span class="upcoming-habit">${h.icon} ${h.name}</span>
                `).join('') || '<span class="last-one">This is the last one!</span>'}
            </div>
        </div>
    `;
}

function updateStackExecutionUI() {
    const modal = document.getElementById('stackExecutionModal');
    if (!modal || !habitStackState.currentStack) return;

    modal.innerHTML = getStackExecutionHTML(habitStackState.currentStack);
}

function showStackCompleteModal(stack, completionRate) {
    const existingModal = document.getElementById('stackExecutionModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'stackCompleteModal';
    modal.innerHTML = `
        <div class="modal-content celebration">
            <div class="celebration-icon">${stack.icon}</div>
            <h2>Stack Complete!</h2>
            <h3>${stack.name}</h3>
            <div class="completion-stats">
                <div class="stat">
                    <span class="value">${Math.round(completionRate * 100)}%</span>
                    <span class="label">Completion</span>
                </div>
                <div class="stat">
                    <span class="value">${stack.completions}</span>
                    <span class="label">Total Times</span>
                </div>
            </div>
            <button class="btn-primary" onclick="this.closest('.modal').remove(); renderHabitStacksUI();">
                Awesome!
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function showCreateStackModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createStackModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📚 Create Custom Stack</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Stack Name</label>
                    <input type="text" id="stackName" placeholder="e.g., My Morning Routine">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="stackDesc" placeholder="Optional description">
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <div class="icon-picker">
                        ${['📚', '🌅', '🌙', '💪', '🧘', '📝', '🎯', '⚡', '🔥', '✨'].map(icon => `
                            <button type="button" class="icon-option" onclick="selectStackIcon(this, '${icon}')">${icon}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="stackIcon" value="📚">
                </div>
                <div class="form-group">
                    <label>Habits</label>
                    <div id="stackHabitsEditor">
                        <div class="habit-input-row">
                            <input type="text" placeholder="Habit name" class="habit-name-input">
                            <input type="number" placeholder="Min" min="1" max="60" value="5" class="habit-duration-input">
                            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">🗑️</button>
                        </div>
                    </div>
                    <button type="button" class="btn-secondary btn-sm" onclick="addHabitInputRow()">+ Add Habit</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="submitCustomStack()">Create Stack</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function selectStackIcon(button, icon) {
    document.querySelectorAll('#createStackModal .icon-option').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    document.getElementById('stackIcon').value = icon;
}

function addHabitInputRow() {
    const editor = document.getElementById('stackHabitsEditor');
    const row = document.createElement('div');
    row.className = 'habit-input-row';
    row.innerHTML = `
        <input type="text" placeholder="Habit name" class="habit-name-input">
        <input type="number" placeholder="Min" min="1" max="60" value="5" class="habit-duration-input">
        <button type="button" class="btn-icon" onclick="this.parentElement.remove()">🗑️</button>
    `;
    editor.appendChild(row);
}

function submitCustomStack() {
    const name = document.getElementById('stackName').value.trim();
    const description = document.getElementById('stackDesc').value.trim();
    const icon = document.getElementById('stackIcon').value;

    if (!name) {
        alert('Please enter a stack name');
        return;
    }

    const habitRows = document.querySelectorAll('#stackHabitsEditor .habit-input-row');
    const habits = [];

    habitRows.forEach(row => {
        const habitName = row.querySelector('.habit-name-input').value.trim();
        const duration = parseInt(row.querySelector('.habit-duration-input').value) || 5;

        if (habitName) {
            habits.push({ name: habitName, duration });
        }
    });

    if (habits.length === 0) {
        alert('Please add at least one habit');
        return;
    }

    createCustomStack({ name, description, icon, habits });
    document.getElementById('createStackModal').remove();
    renderHabitStacksUI();

    if (typeof showToast === 'function') {
        showToast('Custom stack created! 📚');
    }
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initHabitStacks = initHabitStacks;
window.adoptStack = adoptStack;
window.createCustomStack = createCustomStack;
window.removeStack = removeStack;
window.startStack = startStack;
window.completeCurrentHabit = completeCurrentHabit;
window.skipCurrentHabit = skipCurrentHabit;
window.cancelStack = cancelStack;
window.renderHabitStacksUI = renderHabitStacksUI;
window.showCreateStackModal = showCreateStackModal;
window.selectStackIcon = selectStackIcon;
window.addHabitInputRow = addHabitInputRow;
window.submitCustomStack = submitCustomStack;
window.HABIT_STACK_TEMPLATES = HABIT_STACK_TEMPLATES;
window.habitStackState = habitStackState;
