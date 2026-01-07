/**
 * @module HabitsUI
 * @description UI rendering for habits module
 * @version 2.0.0
 */

window.HabitsUI = (function() {
    'use strict';

    let currentView = 'timeline'; // 'timeline' | 'calendar'

    /* ============================================================================
       Main View Render
       ============================================================================ */

    /**
     * Render the complete habits view
     */
    function renderHabitsView() {
        const container = document.getElementById('badHabitsContainer');
        const chainContainer = document.getElementById('advancedHabitChain');

        if (container) {
            renderBadHabitsSection(container);
        }

        if (chainContainer) {
            renderHabitChainSection(chainContainer);
        }
    }

    /* ============================================================================
       Bad Habits Section
       ============================================================================ */

    function renderBadHabitsSection(container) {
        const habits = HabitsData.getTrackedHabitsEnriched();

        if (habits.length === 0) {
            container.innerHTML = renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="tracked-habits-header">
                <h3><i class="fas fa-ban"></i> Habits I'm Breaking</h3>
                <button class="btn-add-habit" onclick="HabitsUI.showAddHabitModal()">
                    <i class="fas fa-plus"></i> Track New
                </button>
            </div>
            <div class="tracked-habits-list">
                ${habits.map(h => renderHabitCard(h)).join('')}
            </div>
        `;
    }

    function renderEmptyState() {
        return `
            <div class="habits-empty-state">
                <div class="empty-icon">🎯</div>
                <h3>Break Bad Habits</h3>
                <p>Track habits you want to quit and watch your health improve!</p>
                <button class="btn btn-primary" onclick="HabitsUI.showAddHabitModal()">
                    <i class="fas fa-plus"></i> Start Tracking
                </button>
            </div>
        `;
    }

    function renderHabitCard(habit) {
        const { id, definition, daysQuit, moneySaved, healthProgress, unlockedBenefits, nextBenefit, isQuit } = habit;

        return `
            <div class="habit-card ${isQuit ? 'quit-mode' : 'tracking-mode'}">
                <div class="habit-card-header">
                    <div class="habit-icon-badge" style="background: ${definition.color}20; color: ${definition.color}">
                        ${definition.icon}
                    </div>
                    <div class="habit-info">
                        <h4 class="habit-name">${definition.name}</h4>
                        <span class="habit-status ${isQuit ? 'quit' : 'active'}">
                            ${isQuit ? `✓ ${daysQuit} days quit` : 'Currently tracking'}
                        </span>
                    </div>
                    <button class="habit-menu-btn" onclick="HabitsUI.showHabitMenu(event, '${id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>

                ${isQuit ? `
                    <div class="habit-progress-section">
                        <div class="quit-stats-row">
                            <div class="quit-stat">
                                <span class="stat-value">${daysQuit}</span>
                                <span class="stat-label">Days</span>
                            </div>
                            ${moneySaved > 0 ? `
                                <div class="quit-stat money">
                                    <span class="stat-value">$${moneySaved.toFixed(0)}</span>
                                    <span class="stat-label">Saved</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="health-progress-list">
                            ${Object.entries(healthProgress).map(([key, cat]) => `
                                <div class="health-progress-item">
                                    <div class="health-label">
                                        <span>${cat.icon}</span>
                                        <span>${cat.label}</span>
                                    </div>
                                    <div class="health-bar-wrap">
                                        <div class="health-bar-fill" style="width: ${cat.percent}%; background: ${definition.color}"></div>
                                    </div>
                                    <span class="health-percent">${cat.percent}%</span>
                                </div>
                            `).join('')}
                        </div>

                        ${unlockedBenefits.length > 0 ? `
                            <div class="benefits-unlocked">
                                <div class="benefits-header">
                                    <i class="fas fa-check-circle"></i> Benefits Unlocked
                                </div>
                                <ul class="benefits-list">
                                    ${unlockedBenefits.slice(-3).map(b => `
                                        <li><i class="fas fa-check"></i> ${b.text}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${nextBenefit ? `
                            <div class="next-benefit">
                                <i class="fas fa-clock"></i>
                                <span>In ${nextBenefit.days - daysQuit} days: ${nextBenefit.text}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="habit-tracking-cta">
                        <p>Ready to quit? Start your journey!</p>
                        <button class="btn btn-success" onclick="HabitsUI.markQuit('${id}')">
                            <i class="fas fa-check-circle"></i> I Quit Today!
                        </button>
                    </div>
                `}

                <div class="habit-card-actions">
                    ${isQuit ? `
                        <button class="habit-action relapse" onclick="HabitsUI.confirmRelapse('${id}')">
                            <i class="fas fa-redo"></i> Relapsed
                        </button>
                    ` : `
                        <button class="habit-action quit" onclick="HabitsUI.markQuit('${id}')">
                            <i class="fas fa-check"></i> Mark Quit
                        </button>
                    `}
                    <button class="habit-action remove" onclick="HabitsUI.confirmRemove('${id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }

    /* ============================================================================
       Habit Chain Section (30-day visualization)
       ============================================================================ */

    function renderHabitChainSection(container) {
        const stats = HabitsData.getHabitChainStats();
        const insights = HabitsData.generateInsights();

        container.innerHTML = `
            <div class="chain-section">
                <div class="chain-header">
                    <div class="chain-title">
                        <h2><i class="fas fa-fire"></i> 30-Day Streak</h2>
                        <p>Track your daily consistency</p>
                    </div>
                    <div class="chain-view-toggle">
                        <button class="view-btn ${currentView === 'timeline' ? 'active' : ''}" 
                                onclick="HabitsUI.switchView('timeline')">
                            <i class="fas fa-stream"></i>
                        </button>
                        <button class="view-btn ${currentView === 'calendar' ? 'active' : ''}" 
                                onclick="HabitsUI.switchView('calendar')">
                            <i class="fas fa-calendar-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="chain-stats-row">
                    <div class="chain-stat">
                        <span class="chain-stat-value">${stats.currentStreak}</span>
                        <span class="chain-stat-label">Current</span>
                    </div>
                    <div class="chain-stat">
                        <span class="chain-stat-value">${stats.bestStreak}</span>
                        <span class="chain-stat-label">Best</span>
                    </div>
                    <div class="chain-stat">
                        <span class="chain-stat-value">${stats.completionRate}%</span>
                        <span class="chain-stat-label">Rate</span>
                    </div>
                    <div class="chain-stat">
                        <span class="chain-stat-value">${stats.completedDays}</span>
                        <span class="chain-stat-label">Complete</span>
                    </div>
                </div>

                <div class="chain-visualization" id="chainVisualization">
                    ${currentView === 'timeline' ? renderTimeline(stats) : renderCalendar(stats)}
                </div>

                <div class="chain-insights">
                    <div class="insights-header">
                        <i class="fas fa-lightbulb"></i> Insights
                    </div>
                    <ul class="insights-list">
                        ${insights.map(i => `
                            <li class="insight-item">
                                <span class="insight-icon">${i.icon}</span>
                                <span>${i.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    function renderTimeline(stats) {
        return `
            <div class="chain-timeline">
                ${stats.dayStatuses.map((day, i) => `
                    <div class="timeline-dot ${day.status} ${day.isToday ? 'today' : ''}" 
                         title="${day.date.toLocaleDateString()}: ${day.completed}/${day.total} tasks">
                        <span class="dot-day">${day.date.getDate()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderCalendar(stats) {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        let calendarHTML = `<div class="chain-calendar">`;
        
        // Headers
        calendarHTML += dayHeaders.map(d => `<div class="cal-header">${d}</div>`).join('');

        // Empty cells before month
        const firstDay = monthStart.getDay();
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="cal-cell empty"></div>';
        }

        // Days
        for (let day = 1; day <= monthEnd.getDate(); day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const dayData = stats.dayStatuses.find(d => d.date.toDateString() === date.toDateString());
            const status = dayData?.status || 'empty';
            const isToday = day === today.getDate();

            calendarHTML += `
                <div class="cal-cell ${status} ${isToday ? 'today' : ''}">
                    <span>${day}</span>
                </div>
            `;
        }

        calendarHTML += '</div>';
        return calendarHTML;
    }

    /* ============================================================================
       Modals & Interactions
       ============================================================================ */

    function showAddHabitModal() {
        const definitions = HabitsData.getHabitDefinitions();
        const tracked = HabitsData.getTrackedHabits();

        // Filter out already tracked habits
        const available = Object.entries(definitions).filter(([id]) => !tracked[id]);

        if (available.length === 0) {
            showToast('You\'re tracking all available habits!', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'addHabitModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Track a Habit to Break</h3>
                    <button class="modal-close" onclick="HabitsUI.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Select Habit</label>
                        <select id="habitSelect" class="form-control" required>
                            <option value="">Choose a habit...</option>
                            ${available.map(([id, def]) => `
                                <option value="${id}">${def.icon} ${def.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Daily Cost (for savings calc)</label>
                        <input type="number" id="habitCost" class="form-control" 
                               placeholder="e.g., 10" min="0" step="0.5" value="10">
                    </div>
                    <div class="form-group">
                        <label>Why do you want to quit?</label>
                        <textarea id="habitReason" class="form-control" 
                                  placeholder="Your motivation..." rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="HabitsUI.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="HabitsUI.submitAddHabit()">
                        <i class="fas fa-plus"></i> Start Tracking
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    function submitAddHabit() {
        const habitId = document.getElementById('habitSelect').value;
        const cost = parseFloat(document.getElementById('habitCost').value) || 10;
        const reason = document.getElementById('habitReason').value.trim();

        if (!habitId) {
            showToast('Please select a habit', 'error');
            return;
        }

        const success = HabitsData.addTrackedHabit(habitId, cost, reason);
        
        if (success) {
            closeModal();
            renderHabitsView();
            
            if (typeof addXP === 'function') addXP(20);
            showToast('🎯 Habit tracking started! +20 XP', 'success');
        }
    }

    function markQuit(habitId) {
        const success = HabitsData.markHabitQuit(habitId);
        
        if (success) {
            renderHabitsView();
            
            const def = HabitsData.getHabitDefinition(habitId);
            if (typeof celebrateAchievement === 'function') {
                celebrateAchievement(`You quit ${def.name}!`, '🎉');
            }
            if (typeof addXP === 'function') addXP(100);
            showToast('🎉 Amazing! You quit! +100 XP Bonus!', 'success');
        }
    }

    function confirmRelapse(habitId) {
        if (confirm('Did you relapse? Your streak will reset, but don\'t give up!')) {
            const success = HabitsData.recordRelapse(habitId);
            
            if (success) {
                renderHabitsView();
                showToast('💪 Stay strong! You can do this!', 'info');
            }
        }
    }

    function confirmRemove(habitId) {
        if (confirm('Remove this habit from tracking?')) {
            const success = HabitsData.removeTrackedHabit(habitId);
            
            if (success) {
                renderHabitsView();
                showToast('Habit removed', 'info');
            }
        }
    }

    function showHabitMenu(event, habitId) {
        event.stopPropagation();
        
        // Remove any existing menu
        const existing = document.querySelector('.habit-popup-menu');
        if (existing) existing.remove();

        const habit = HabitsData.getTrackedHabitsEnriched().find(h => h.id === habitId);
        if (!habit) return;

        const menu = document.createElement('div');
        menu.className = 'habit-popup-menu';
        menu.innerHTML = `
            ${habit.isQuit ? `
                <button onclick="HabitsUI.confirmRelapse('${habitId}')">
                    <i class="fas fa-redo"></i> Record Relapse
                </button>
            ` : `
                <button onclick="HabitsUI.markQuit('${habitId}')">
                    <i class="fas fa-check-circle"></i> Mark as Quit
                </button>
            `}
            <button class="danger" onclick="HabitsUI.confirmRemove('${habitId}')">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;

        // Position near click
        const rect = event.target.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;

        document.body.appendChild(menu);

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }

    function switchView(view) {
        currentView = view;
        const viz = document.getElementById('chainVisualization');
        const stats = HabitsData.getHabitChainStats();
        
        if (viz) {
            viz.innerHTML = view === 'timeline' ? renderTimeline(stats) : renderCalendar(stats);
        }

        // Update toggle buttons
        document.querySelectorAll('.chain-view-toggle .view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.querySelector('i').classList.contains(
                view === 'timeline' ? 'fa-stream' : 'fa-calendar-alt'
            ));
        });
    }

    function closeModal() {
        const modal = document.getElementById('addHabitModal');
        if (modal) modal.remove();
    }

    /* ============================================================================
       Public API
       ============================================================================ */

    return {
        renderHabitsView,
        showAddHabitModal,
        submitAddHabit,
        markQuit,
        confirmRelapse,
        confirmRemove,
        showHabitMenu,
        switchView,
        closeModal
    };

})();

// Legacy compatibility
window.renderBadHabits = function() {
    HabitsUI.renderHabitsView();
};

window.renderAdvancedHabitChain = function() {
    HabitsUI.renderHabitsView();
};

window.showAddBadHabitModal = function() {
    HabitsUI.showAddHabitModal();
};
