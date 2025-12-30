/**
 * @fileoverview Habit Tracking Module
 * @description Bad habit breaking system with health improvement tracking
 * @version 1.0.0
 */



/* ==========================================================================
   Module State
   ========================================================================== */

let currentHabitView = 'timeline';

/* ==========================================================================
   Habit Definitions & Health Data
   ========================================================================== */

const badHabits = {
    'smoking': {
        icon: '🚬',
        name: 'Smoking',
        healthCategories: {
            'lungs': { label: 'Lung Function', icon: '🫁', improvement: (days) => Math.min((days / 90) * 100, 100) },
            'heart': { label: 'Heart Health', icon: '❤️', improvement: (days) => Math.min((days / 60) * 100, 100) },
            'skin': { label: 'Skin Quality', icon: '✨', improvement: (days) => Math.min((days / 30) * 100, 100) }
        },
        benefits: [
            'Lung capacity increases by 10% after 3 months',
            'Risk of heart disease drops significantly',
            'Improved circulation and energy levels',
            'Better sense of taste and smell',
            'Skin appearance improves noticeably'
        ],
        moneySaved: (days, costPerDay) => days * costPerDay
    },
    'drinking': {
        icon: '🍺',
        name: 'Excessive Drinking',
        healthCategories: {
            'liver': { label: 'Liver Function', icon: '🫘', improvement: (days) => Math.min((days / 120) * 100, 100) },
            'brain': { label: 'Brain Health', icon: '🧠', improvement: (days) => Math.min((days / 60) * 100, 100) },
            'sleep': { label: 'Sleep Quality', icon: '😴', improvement: (days) => Math.min((days / 14) * 100, 100) }
        },
        benefits: [
            'Liver function starts recovering within weeks',
            'Better sleep quality and mental clarity',
            'Improved mood and reduced anxiety',
            'Stabilized blood sugar levels',
            'Enhanced memory and focus'
        ],
        moneySaved: (days, costPerDay) => days * costPerDay
    },
    'junk-food': {
        icon: '🍔',
        name: 'Junk Food',
        healthCategories: {
            'weight': { label: 'Weight Management', icon: '⚖️', improvement: (days) => Math.min((days / 30) * 100, 100) },
            'energy': { label: 'Energy Levels', icon: '⚡', improvement: (days) => Math.min((days / 21) * 100, 100) },
            'digestion': { label: 'Digestion', icon: '🧬', improvement: (days) => Math.min((days / 30) * 100, 100) }
        },
        benefits: [
            'Weight loss starts within 2-3 weeks',
            'Increased energy and vitality',
            'Improved digestion and gut health',
            'Better skin and hair condition',
            'Reduced food cravings'
        ],
        moneySaved: (days, costPerDay) => days * costPerDay
    },
    'scrolling': {
        icon: '📱',
        name: 'Social Media/Scrolling',
        healthCategories: {
            'eyes': { label: 'Eye Health', icon: '👁️', improvement: (days) => Math.min((days / 30) * 100, 100) },
            'focus': { label: 'Mental Focus', icon: '🎯', improvement: (days) => Math.min((days / 21) * 100, 100) },
            'sleep': { label: 'Sleep Schedule', icon: '😴', improvement: (days) => Math.min((days / 14) * 100, 100) }
        },
        benefits: [
            'Reduced eye strain and better vision',
            'Improved focus and productivity',
            'Better sleep schedule and quality',
            'Increased real-world connections',
            'Reduced anxiety and improved mood'
        ],
        moneySaved: (days, costPerDay) => 0
    },
    'caffeine': {
        icon: '☕',
        name: 'Excessive Caffeine',
        healthCategories: {
            'sleep': { label: 'Sleep Quality', icon: '😴', improvement: (days) => Math.min((days / 14) * 100, 100) },
            'anxiety': { label: 'Anxiety Levels', icon: '🧘', improvement: (days) => Math.min((days / 21) * 100, 100) },
            'heart': { label: 'Heart Rate', icon: '❤️', improvement: (days) => Math.min((days / 7) * 100, 100) }
        },
        benefits: [
            'Better sleep quality and duration',
            'Reduced anxiety and jitteriness',
            'Stabilized heart rate',
            'More stable energy levels',
            'Improved digestion'
        ],
        moneySaved: (days, costPerDay) => days * costPerDay
    }
};

// Render bad habits section
function renderBadHabits() {
    const container = document.getElementById('badHabitsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!appState.badHabits) {
        appState.badHabits = {};
    }

    const habits = Object.entries(appState.badHabits);

    if (habits.length === 0) {
        container.innerHTML = `
            <div class="empty-habits-state">
                <div class="empty-habits-icon">🎯</div>
                <div class="empty-habits-text">Track habits you want to quit and see your health improvements!</div>
                <button class="btn btn-primary" onclick="showAddBadHabitModal()">
                    <i class="fas fa-plus"></i> Track a Bad Habit
                </button>
            </div>
        `;
        return;
    }

    habits.forEach(([habitId, habitData]) => {
        const habit = badHabits[habitId];
        if (!habit) return;

        const daysQuit = habitData.quitDate ? Math.floor((new Date() - new Date(habitData.quitDate)) / (1000 * 60 * 60 * 24)) : 0;
        const isQuit = habitData.status === 'quit';
        const moneySaved = habit.moneySaved(daysQuit, habitData.costPerDay || 10);

        const cardEl = document.createElement('div');
        cardEl.className = `bad-habit-card ${isQuit ? 'quit' : ''}`;

        let quitSection = '';
        let healthSection = '';

        if (isQuit) {
            quitSection = `
                <div class="quit-tracker">
                    <div class="quit-stats">
                        <div class="quit-stat">
                            <span class="quit-stat-value">${daysQuit}</span>
                            <span class="quit-stat-label">Days Quit</span>
                        </div>
                        <div class="quit-stat">
                            <span class="quit-stat-value">$${moneySaved.toFixed(0)}</span>
                            <span class="quit-stat-label">Money Saved</span>
                        </div>
                    </div>

                    <div class="health-improvement">
                        ${Object.entries(habit.healthCategories).map(([key, category]) => {
                            const improvement = category.improvement(daysQuit);
                            return `
                                <div class="health-category">
                                    <div class="health-category-title">
                                        <span>${category.icon}</span>
                                        <span>${category.label}</span>
                                    </div>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: ${improvement}%;">
                                            ${improvement > 10 ? `<span class="health-percentage">${Math.round(improvement)}%</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="health-benefits">
                        <div class="benefits-title">
                            <i class="fas fa-star"></i> Health Benefits Unlocked
                        </div>
                        <ul class="benefits-list">
                            ${habit.benefits.slice(0, 3).map(benefit => `<li class="benefit-item">${benefit}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        cardEl.innerHTML = `
            <div class="bad-habit-header">
                <div class="bad-habit-title">
                    <span class="bad-habit-icon">${habit.icon}</span>
                    <span>${habit.name}</span>
                </div>
                <span class="bad-habit-status-badge ${isQuit ? 'quit-mode' : 'active'}">
                    ${isQuit ? `✓ Quit ${daysQuit}d ago` : 'Active Tracking'}
                </span>
            </div>

            ${quitSection}

            <div class="bad-habit-actions">
                ${isQuit ? `
                    <button class="habit-action-btn quit-btn" onclick="relapseBadHabit('${habitId}')">
                        <i class="fas fa-redo"></i> Relapsed
                    </button>
                    <button class="habit-action-btn danger" onclick="removeBadHabit('${habitId}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                ` : `
                    <button class="habit-action-btn quit-btn" onclick="markHabitAsQuit('${habitId}')">
                        <i class="fas fa-check-circle"></i> I Quit!
                    </button>
                    <button class="habit-action-btn danger" onclick="removeBadHabit('${habitId}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                `}
            </div>
        `;

        container.appendChild(cardEl);
    });
}

// Show add bad habit modal
function showAddBadHabitModal() {
    const modal = document.createElement('div');
    modal.id = 'addBadHabitModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 1000;
    `;

    const habitOptions = Object.entries(badHabits).map(([id, data]) => 
        `<option value="${id}">${data.icon} ${data.name}</option>`
    ).join('');

    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 450px; width: 90%;">
            <h2 style="margin-bottom: 20px;">Track a Habit You Want to Quit</h2>
            <form onsubmit="saveBadHabit(event)">
                <div class="form-group">
                    <label>Select Habit *</label>
                    <select id="habitType" class="form-control" required>
                        <option value="">Choose a habit...</option>
                        ${habitOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cost Per Day (for money saved calc)</label>
                    <input type="number" id="habitCost" class="form-control" placeholder="E.g., 10" min="0" step="0.5" value="10">
                </div>
                <div class="form-group">
                    <label>Why do you want to quit?</label>
                    <textarea id="habitReason" class="form-control" placeholder="Your motivation..." rows="3"></textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Start Tracking</button>
                    <button type="button" class="btn btn-secondary" onclick="closeBadHabitModal()" style="flex: 1;">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

// Save bad habit
function saveBadHabit(event) {
    event.preventDefault();

    const habitType = document.getElementById('habitType').value;
    const costPerDay = parseFloat(document.getElementById('habitCost').value) || 10;
    const reason = document.getElementById('habitReason').value.trim();

    if (!habitType) {
        showToast('Please select a habit', 'error');
        return;
    }

    if (!appState.badHabits) appState.badHabits = {};

    appState.badHabits[habitType] = {
        status: 'tracking',
        costPerDay: costPerDay,
        reason: reason,
        startDate: new Date().toISOString(),
        quitDate: null
    };

    saveBadHabitsRealtime();
    renderBadHabits();
    addXP(20);
    showToast('🎯 Habit tracking started! +20 XP', 'success');
    closeBadHabitModal();
}

// Mark habit as quit
function markHabitAsQuit(habitId) {
    if (!appState.badHabits[habitId]) return;

    appState.badHabits[habitId].status = 'quit';
    appState.badHabits[habitId].quitDate = new Date().toISOString();

    saveBadHabitsRealtime();
    renderBadHabits();
    celebrateAchievement(`You quit ${badHabits[habitId].name}!`, '🎉');
    addXP(100);
    showToast('🎉 Amazing! You quit! +100 XP Bonus!', 'success');
}

// Handle relapse
function relapseBadHabit(habitId) {
    if (confirm('Did you relapse? Your progress will reset.')) {
        appState.badHabits[habitId].status = 'tracking';
        appState.badHabits[habitId].quitDate = null;

        saveBadHabitsRealtime();
        renderBadHabits();
        showToast('Stay strong! You can do this! 💪', 'info');
    }
}

// Remove bad habit from tracking
function removeBadHabit(habitId) {
    if (confirm('Remove this habit from tracking?')) {
        delete appState.badHabits[habitId];
        saveBadHabitsRealtime();
        renderBadHabits();
        showToast('Habit removed', 'info');
    }
}

// Save bad habits to Firebase
async function saveBadHabitsData() {
    if (!appState.currentUser || !db) return;

    try {
        window.isLocalUpdate = true;
        await db.collection('users').doc(appState.currentUser.uid).update(
            { badHabits: appState.badHabits },
            { merge: true }
        );
        setTimeout(() => { window.isLocalUpdate = false; }, 100);
    } catch (error) {
        console.error('Error saving bad habits:', error);
        window.isLocalUpdate = false;
    }
}

/**
 * Debounced wrapper for habit persistence
 * @private
 */
function saveBadHabitsRealtime() {
    if (typeof debouncedSave === 'function') {
        debouncedSave('badHabits', saveBadHabitsData, 500);
    } else {
        saveBadHabitsData();
    }
}

function closeBadHabitModal() {
    const modal = document.getElementById('addBadHabitModal');
    if (modal) modal.remove();
}

// Advanced Habit Chain - Multiple Views

function renderAdvancedHabitChain() {
    const container = document.getElementById('advancedHabitChain');
    if (!container) return;

    container.innerHTML = '';

    const chainHTML = `
        <div class="chain-header">
            <div class="chain-title">
                <h2><i class="fas fa-fire"></i> 30-Day Habit Chain</h2>
                <p style="font-size: 12px; color: #777; margin-top: 5px;">Track your daily consistency</p>
            </div>
            <div class="chain-controls">
                <button class="chain-view-btn ${currentHabitView === 'timeline' ? 'active' : ''}" onclick="switchHabitView('timeline')">
                    <i class="fas fa-list"></i> Timeline
                </button>
                <button class="chain-view-btn ${currentHabitView === 'calendar' ? 'active' : ''}" onclick="switchHabitView('calendar')">
                    <i class="fas fa-calendar"></i> Calendar
                </button>
            </div>
        </div>

        <div class="chain-stats">
            <div class="chain-stat-card">
                <div class="chain-stat-value" id="currentStreakStat">0</div>
                <div class="chain-stat-label">Current Streak</div>
            </div>
            <div class="chain-stat-card">
                <div class="chain-stat-value" id="bestStreakStat">0</div>
                <div class="chain-stat-label">Best Streak</div>
            </div>
            <div class="chain-stat-card">
                <div class="chain-stat-value" id="completionRateStat">0%</div>
                <div class="chain-stat-label">Completion Rate</div>
            </div>
            <div class="chain-stat-card">
                <div class="chain-stat-value" id="totalCompletedStat">0</div>
                <div class="chain-stat-label">Days Completed</div>
            </div>
        </div>

        <div id="habitChainView"></div>

        <div class="chain-insights">
            <div class="insights-title">
                <i class="fas fa-lightbulb"></i> Your Insights
            </div>
            <ul class="insights-list" id="insightsList">
                <li class="insight-item">Loading insights...</li>
            </ul>
        </div>
    `;

    container.innerHTML = chainHTML;

    updateHabitChainView();
    generateHabitInsights();
}

/**
 * Switch between habit visualization views
 * @param {string} view - View type: 'timeline' | 'calendar'
 * @param {Event} [evt] - Optional click event
 */
function switchHabitView(view, evt) {
    currentHabitView = view;
    document.querySelectorAll('.chain-view-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
    updateHabitChainView();
}

function updateHabitChainView() {
    const viewContainer = document.getElementById('habitChainView');
    if (!viewContainer) return;

    viewContainer.innerHTML = '';

    if (currentHabitView === 'calendar') {
        renderCalendarView();
    } else {
        renderTimelineView();
    }

    updateHabitStats();
}

function renderCalendarView() {
    const viewContainer = document.getElementById('habitChainView');
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let calendarHTML = '<div class="habit-calendar">';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells before month starts
    const firstDay = monthStart.getDay();
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-cell empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dateStr = getDateString(date);
        const taskData = appState.userTasks[dateStr];
        const isToday = day === today.getDate();

        let status = 'missed';
        let percentage = '0%';

        if (taskData) {
            const completed = Object.values(taskData).filter(t => t.completed).length;
            const total = Object.keys(taskData).length;
            percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            if (percentage === 100) status = 'completed';
            else if (percentage > 0) status = 'partial';
        }

        calendarHTML += `
            <div class="calendar-cell ${status} ${isToday ? 'today' : ''}">
                <div class="cell-day">${day}</div>
                <div class="cell-date">${date.toLocaleDateString('en-US', { month: 'short' })}</div>
                <div class="cell-progress">${percentage}%</div>
                <div class="cell-tooltip">${date.toLocaleDateString()}</div>
            </div>
        `;
    }

    calendarHTML += '</div>';
    viewContainer.innerHTML = calendarHTML;
}

function renderTimelineView() {
    const viewContainer = document.getElementById('habitChainView');
    const today = new Date();

    let timelineHTML = '<div class="habit-timeline">';

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const taskData = appState.userTasks[dateStr];
        const isToday = i === 0;

        let status = 'missed';
        let percentage = '0%';

        if (taskData) {
            const completed = Object.values(taskData).filter(t => t.completed).length;
            const total = Object.keys(taskData).length;
            percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            if (percentage === 100) status = 'completed';
            else if (percentage > 0) status = 'partial';
        }

        timelineHTML += `
            <div class="timeline-day" title="${date.toLocaleDateString()}">
                <div class="timeline-dot ${status} ${isToday ? 'today' : ''}">
                    ${date.getDate()}
                </div>
                <div class="timeline-label">${date.toLocaleDateString('en-US', { month: 'short' })}</div>
            </div>
        `;
    }

    timelineHTML += '</div>';
    viewContainer.innerHTML = timelineHTML;
}

function generateHabitInsights() {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;

    const today = new Date();
    let completedDays = 0;
    let streakData = calculateHabitStreak();

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

    const insights = [];

    if (streakData.current >= 7) {
        insights.push(`🔥 Incredible! You have a ${streakData.current}-day streak!`);
    } else if (streakData.current >= 3) {
        insights.push(`💪 Great momentum! You're on a ${streakData.current}-day streak!`);
    }

    if (completedDays >= 25) {
        insights.push('⭐ Outstanding consistency! You completed over 80% of days.');
    } else if (completedDays >= 15) {
        insights.push('✨ Good effort! Keep pushing to build stronger habits.');
    }

    const bestDay = Math.max(...Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const taskData = appState.userTasks[dateStr];
        if (taskData) {
            const completed = Object.values(taskData).filter(t => t.completed).length;
            return completed;
        }
        return 0;
    }));

    if (bestDay > 5) {
        insights.push(`🎯 Your best day had ${bestDay} completed tasks!`);
    }

    if (insights.length === 0) {
        insights.push('Start completing tasks to see personalized insights!');
    }

    insightsList.innerHTML = insights.map(insight => 
        `<li class="insight-item">${insight}</li>`
    ).join('');
}

function updateHabitStats() {
    const today = new Date();
    const streakData = calculateHabitStreak();
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

    document.getElementById('currentStreakStat').textContent = streakData.current;
    document.getElementById('bestStreakStat').textContent = streakData.best;
    document.getElementById('completionRateStat').textContent = completionRate + '%';
    document.getElementById('totalCompletedStat').textContent = completedDays;
}
