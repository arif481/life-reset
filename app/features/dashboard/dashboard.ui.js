/**
 * @fileoverview Dashboard UI Rendering
 * @description Modern "Today's Overview" dashboard layout
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Main Dashboard Renderer
// ============================================================================

/**
 * Render the complete dashboard
 */
function renderDashboard() {
    const container = document.getElementById('dashboard-view');
    if (!container) return;
    
    const taskStats = window.DashboardData?.getTodayTaskStats() || { total: 0, completed: 0, percentage: 0 };
    const streak = window.DashboardData?.getStreakData() || { current: 0 };
    const level = window.DashboardData?.getLevelData() || { level: 1, xp: 0, xpNeeded: 100, progress: 0 };
    const todayMood = window.DashboardData?.getTodayMood();
    const weeklyStats = window.DashboardData?.getWeeklyStats() || { weekDays: [] };
    const pendingTasks = window.DashboardData?.getPendingTasks(5) || [];
    const insights = window.DashboardData?.generateDashboardInsights() || [];
    const recentActivity = window.DashboardData?.getRecentActivity(4) || [];
    
    const greeting = getGreeting();
    const userName = appState.currentUser?.displayName?.split(' ')[0] || 'there';
    
    container.innerHTML = `
        <!-- Greeting & Date Header -->
        <div class="dashboard-header">
            <div class="greeting-section">
                <h2 class="greeting-text">${greeting}, ${sanitizeForHTML(userName)}! 👋</h2>
                <p class="date-text">${formatTodayDate()}</p>
            </div>
            <div class="level-badge" onclick="navigateTo('settings')">
                <span class="level-icon">⭐</span>
                <span class="level-number">Lvl ${level.level}</span>
            </div>
        </div>
        
        <!-- Today's Progress Hero Card -->
        <div class="today-hero-card">
            <div class="hero-progress-ring">
                <svg viewBox="0 0 120 120" class="progress-ring-svg">
                    <circle cx="60" cy="60" r="52" class="progress-ring-bg"></circle>
                    <circle cx="60" cy="60" r="52" class="progress-ring-fill" 
                        style="stroke-dasharray: ${2 * Math.PI * 52}; stroke-dashoffset: ${2 * Math.PI * 52 * (1 - taskStats.percentage / 100)}">
                    </circle>
                </svg>
                <div class="hero-progress-content">
                    <span class="hero-percentage">${taskStats.percentage}%</span>
                    <span class="hero-label">Today</span>
                </div>
            </div>
            <div class="hero-stats">
                <div class="hero-stat-item">
                    <span class="stat-value">${taskStats.completed}/${taskStats.total}</span>
                    <span class="stat-label">Tasks Done</span>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-item ${streak.current > 0 ? 'streak-active' : ''}">
                    <span class="stat-value">${streak.current} 🔥</span>
                    <span class="stat-label">Day Streak</span>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-item">
                    <span class="stat-value">${todayMood ? getMoodEmoji(todayMood.mood) : '—'}</span>
                    <span class="stat-label">Mood</span>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions-row">
            <button class="quick-action-btn" onclick="navigateTo('tracker')">
                <span class="action-icon">✅</span>
                <span class="action-label">Tasks</span>
            </button>
            <button class="quick-action-btn" onclick="navigateTo('mood')">
                <span class="action-icon">💭</span>
                <span class="action-label">Log Mood</span>
            </button>
            <button class="quick-action-btn" onclick="navigateTo('journal'); setTimeout(() => document.getElementById('journalContent')?.focus(), 100)">
                <span class="action-icon">📝</span>
                <span class="action-label">Journal</span>
            </button>
            <button class="quick-action-btn" onclick="navigateTo('analytics')">
                <span class="action-icon">📊</span>
                <span class="action-label">Stats</span>
            </button>
        </div>
        
        <!-- Insight Card (if any) -->
        ${insights.length > 0 ? `
        <div class="insight-banner insight-${insights[0].type}">
            <span class="insight-icon">${insights[0].icon}</span>
            <p class="insight-message">${insights[0].message}</p>
            ${insights[0].action ? `
                <button class="insight-action-btn" onclick="navigateTo('${insights[0].action.view}')">
                    ${insights[0].action.text}
                </button>
            ` : ''}
        </div>
        ` : ''}
        
        <!-- Week Overview -->
        <div class="section-card">
            <div class="section-header">
                <h3><span class="section-icon">📅</span> This Week</h3>
                <span class="section-meta">${weeklyStats.completionRate}% completion</span>
            </div>
            <div class="week-dots-row">
                ${weeklyStats.weekDays.map(day => `
                    <div class="week-day-dot ${day.isToday ? 'today' : ''} ${day.tasksCompleted > 0 ? 'active' : ''}">
                        <span class="dot-label">${day.dayName}</span>
                        <span class="dot-indicator ${day.tasksCompleted > 0 ? 'filled' : ''} ${day.hasMood ? 'has-mood' : ''}"></span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Pending Tasks Preview -->
        <div class="section-card">
            <div class="section-header">
                <h3><span class="section-icon">📋</span> Up Next</h3>
                <button class="section-link" onclick="navigateTo('tracker')">View All →</button>
            </div>
            ${pendingTasks.length > 0 ? `
            <div class="pending-tasks-list">
                ${pendingTasks.map(task => `
                    <div class="pending-task-item" data-task-id="${task.id}">
                        <span class="task-category-icon">${task.categoryIcon}</span>
                        <span class="task-name">${sanitizeForHTML(task.name || 'Task')}</span>
                        <button class="task-quick-check" onclick="quickCompleteTask('${task.id}', '${task.category}')" aria-label="Complete task">
                            <i class="far fa-circle"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            ` : `
            <div class="empty-state-mini">
                <span class="empty-icon">🎉</span>
                <p>All caught up! No pending tasks.</p>
            </div>
            `}
        </div>
        
        <!-- XP Progress -->
        <div class="section-card xp-card">
            <div class="section-header">
                <h3><span class="section-icon">⭐</span> Level ${level.level}</h3>
                <span class="section-meta">${level.xp}/${level.xpNeeded} XP</span>
            </div>
            <div class="xp-progress-bar">
                <div class="xp-progress-fill" style="width: ${level.progress}%"></div>
            </div>
            <p class="xp-hint">${level.xpToNext} XP to next level</p>
        </div>
        
        <!-- Recent Activity -->
        ${recentActivity.length > 0 ? `
        <div class="section-card">
            <div class="section-header">
                <h3><span class="section-icon">🕐</span> Recent</h3>
            </div>
            <div class="recent-activity-list">
                ${recentActivity.map(item => `
                    <div class="activity-item-mini">
                        <span class="activity-icon">${item.icon}</span>
                        <div class="activity-content">
                            <span class="activity-title">${item.title}</span>
                            <span class="activity-desc">${sanitizeForHTML(item.description)}</span>
                        </div>
                        <span class="activity-time">${formatTimeAgo(item.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    // Add animations after render
    requestAnimationFrame(() => {
        container.querySelectorAll('.section-card, .today-hero-card, .quick-actions-row').forEach((el, i) => {
            el.style.animationDelay = `${i * 0.05}s`;
            el.classList.add('fade-in-up');
        });
    });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get time-appropriate greeting
 * @returns {string}
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
}

/**
 * Format today's date nicely
 * @returns {string}
 */
function formatTodayDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get emoji for mood
 * @param {string} mood - Mood value
 * @returns {string}
 */
function getMoodEmoji(mood) {
    const emojis = {
        'very-sad': '😢',
        'sad': '😞',
        'okay': '😐',
        'good': '😊',
        'great': '😄'
    };
    return emojis[mood] || '😐';
}

/**
 * Format timestamp to relative time
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string}
 */
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Quick complete a task from dashboard
 * @param {string} taskId - Task ID
 * @param {string} category - Task category
 */
function quickCompleteTask(taskId, category) {
    // Find and toggle the task
    if (appState.userTasks && appState.userTasks[category]) {
        const task = appState.userTasks[category].find(t => t && t.id === taskId);
        if (task) {
            task.completed = true;
            
            // Animate the item
            const item = document.querySelector(`[data-task-id="${taskId}"]`);
            if (item) {
                item.classList.add('completing');
                setTimeout(() => {
                    item.remove();
                    // Update stats display
                    renderDashboard();
                }, 300);
            }
            
            // Save and award XP
            if (typeof toggleTask === 'function') {
                // Use existing toggle logic if available
            }
            if (typeof saveUserData === 'function') {
                saveUserData();
            }
            if (typeof awardXP === 'function') {
                awardXP(10);
            }
            
            showToast('Task completed! +10 XP', 'success');
        }
    }
}

// ============================================================================
// Sanitization (fallback if not available)
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
    window.DashboardUI = {
        render: renderDashboard,
        getGreeting,
        formatTodayDate,
        getMoodEmoji,
        quickCompleteTask
    };
}
