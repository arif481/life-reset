/**
 * @fileoverview Analytics UI Components
 * @description Renders analytics dashboard components
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Stats Cards
// ============================================================================

/**
 * Render stats overview cards
 * @param {string} containerId - Container element ID
 * @param {Object} stats - Stats data
 */
function renderStatsCards(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cards = [
        {
            icon: 'fa-check-circle',
            label: 'Tasks Completed',
            value: stats.tasksCompleted || 0,
            color: '#22c55e'
        },
        {
            icon: 'fa-fire',
            label: 'Habit Streaks',
            value: stats.totalStreaks || 0,
            color: '#f97316'
        },
        {
            icon: 'fa-smile',
            label: 'Mood Average',
            value: stats.avgMood ? stats.avgMood.toFixed(1) : '-',
            color: '#4361ee'
        },
        {
            icon: 'fa-book',
            label: 'Journal Entries',
            value: stats.journalCount || 0,
            color: '#8b5cf6'
        }
    ];
    
    container.innerHTML = cards.map(card => `
        <div class="stat-card" style="--card-color: ${card.color}">
            <div class="stat-icon">
                <i class="fas ${card.icon}" style="color: ${card.color}"></i>
            </div>
            <div class="stat-content">
                <div class="stat-value">${card.value}</div>
                <div class="stat-label">${card.label}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Update a single stat card
 * @param {string} cardId - Card element ID
 * @param {number|string} value - New value
 */
function updateStatCard(cardId, value) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const valueEl = card.querySelector('.stat-value');
    if (valueEl) {
        valueEl.textContent = value;
        valueEl.classList.add('stat-updated');
        setTimeout(() => valueEl.classList.remove('stat-updated'), 300);
    }
}

// ============================================================================
// Period Selector
// ============================================================================

/**
 * Render period selector buttons
 * @param {string} containerId - Container element ID
 * @param {string} activePeriod - Currently active period
 * @param {Function} onSelect - Callback when period is selected
 */
function renderPeriodSelector(containerId, activePeriod, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const periods = [
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' }
    ];
    
    container.innerHTML = periods.map(p => `
        <button class="period-btn ${p.value === activePeriod ? 'active' : ''}" 
                data-period="${p.value}">
            ${p.label}
        </button>
    `).join('');
    
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.period-btn');
        if (!btn) return;
        
        container.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (onSelect) {
            onSelect(btn.dataset.period);
        }
    });
}

// ============================================================================
// Progress Indicators
// ============================================================================

/**
 * Render circular progress
 * @param {string} containerId - Container element ID
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} label - Label text
 */
function renderCircularProgress(containerId, percentage, label) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (percentage / 100) * circumference;
    
    container.innerHTML = `
        <div class="circular-progress">
            <svg viewBox="0 0 100 100">
                <circle class="progress-bg" cx="50" cy="50" r="45" 
                        fill="none" stroke="currentColor" stroke-width="8" opacity="0.1"/>
                <circle class="progress-fill" cx="50" cy="50" r="45"
                        fill="none" stroke="currentColor" stroke-width="8"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"
                        stroke-linecap="round"
                        transform="rotate(-90 50 50)"/>
            </svg>
            <div class="progress-text">
                <span class="progress-value">${percentage}%</span>
                <span class="progress-label">${label}</span>
            </div>
        </div>
    `;
}

/**
 * Render progress bar
 * @param {string} containerId - Container element ID
 * @param {Object} data - { value, max, label }
 */
function renderProgressBar(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const percentage = data.max > 0 ? (data.value / data.max) * 100 : 0;
    
    container.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar-header">
                <span class="progress-bar-label">${data.label}</span>
                <span class="progress-bar-value">${data.value}/${data.max}</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// ============================================================================
// Insights
// ============================================================================

/**
 * Render insights section
 * @param {string} containerId - Container element ID
 * @param {Array} insights - Array of insight objects
 */
function renderInsights(containerId, insights) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!insights || insights.length === 0) {
        container.innerHTML = `
            <div class="insights-empty">
                <i class="fas fa-lightbulb"></i>
                <p>Complete more activities to get personalized insights!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-card insight-${insight.type || 'info'}">
            <div class="insight-icon">
                <i class="fas ${insight.icon || 'fa-lightbulb'}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Generate insights from data
 * @param {Object} data - Analytics data
 * @returns {Array} Array of insights
 */
function generateInsights(data) {
    const insights = [];
    
    // Task insights
    if (data.taskStats) {
        if (data.taskStats.rate >= 80) {
            insights.push({
                type: 'success',
                icon: 'fa-trophy',
                title: 'Great Productivity!',
                text: `You've completed ${data.taskStats.rate}% of your tasks. Keep up the amazing work!`
            });
        } else if (data.taskStats.rate < 50) {
            insights.push({
                type: 'warning',
                icon: 'fa-exclamation-circle',
                title: 'Room for Improvement',
                text: 'Try breaking down larger tasks into smaller, manageable steps.'
            });
        }
    }
    
    // Habit insights
    if (data.habits && data.habits.habits) {
        const maxStreak = Math.max(...data.habits.streaks);
        if (maxStreak >= 7) {
            insights.push({
                type: 'success',
                icon: 'fa-fire',
                title: 'Hot Streak!',
                text: `Your longest habit streak is ${maxStreak} days. You're building great habits!`
            });
        }
    }
    
    // Mood insights
    if (data.moodDistribution) {
        const total = Object.values(data.moodDistribution).reduce((a, b) => a + b, 0);
        if (total > 0) {
            const positive = (data.moodDistribution['good'] + data.moodDistribution['great']) / total;
            if (positive >= 0.6) {
                insights.push({
                    type: 'success',
                    icon: 'fa-smile',
                    title: 'Positive Vibes',
                    text: `${Math.round(positive * 100)}% of your mood entries are positive. Great job!`
                });
            }
        }
    }
    
    // Journal insights
    if (data.journalStats && data.journalStats.count > 0) {
        insights.push({
            type: 'info',
            icon: 'fa-book',
            title: 'Journaling Progress',
            text: `You've written ${data.journalStats.count} entries with an average of ${data.journalStats.avgWords} words.`
        });
    }
    
    return insights;
}

// ============================================================================
// Loading States
// ============================================================================

/**
 * Show loading state for chart
 * @param {string} canvasId - Canvas element ID
 */
function showChartLoading(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    parent.classList.add('chart-loading');
}

/**
 * Hide loading state for chart
 * @param {string} canvasId - Canvas element ID
 */
function hideChartLoading(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    parent.classList.remove('chart-loading');
}

// ============================================================================
// Exports
// ============================================================================

export const AnalyticsUI = {
    renderStatsCards,
    updateStatCard,
    renderPeriodSelector,
    renderCircularProgress,
    renderProgressBar,
    renderInsights,
    generateInsights,
    showChartLoading,
    hideChartLoading
};

if (typeof window !== 'undefined') {
    window.AnalyticsUI = AnalyticsUI;
}
