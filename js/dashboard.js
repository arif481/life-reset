// Advanced Dashboard Functions

let dashboardCharts = {
    weeklyActivity: null,
    moodTrend: null,
    habitCompletion: null,
    categoryBreakdown: null
};

function initDashboard() {
    renderDashboardOverview();
    renderWeeklyActivityChart();
    renderMoodTrendChart();
    renderHabitCompletionChart();
    renderCategoryBreakdown();
    renderQuickStats();
    renderRecentActivity();
    renderInsights();
    renderMilestones();
}

function renderDashboardOverview() {
    const overview = document.getElementById('dashboardOverview');
    if (!overview) return;

    const stats = calculateDashboardStats();
    
    overview.innerHTML = `
        <div class="overview-grid">
            <div class="overview-card shine">
                <div class="overview-header">
                    <h3>Overall Score</h3>
                    <span class="score-badge" style="background: ${stats.scoreColor}">${stats.overallScore}%</span>
                </div>
                <div class="overview-chart">
                    <div class="score-circle" style="--score: ${stats.overallScore}">
                        <span class="score-value">${stats.overallScore}%</span>
                    </div>
                </div>
                <div class="score-breakdown">
                    <div class="breakdown-item">
                        <span>Tasks</span>
                        <div class="mini-bar"><div class="mini-fill" style="width: ${stats.taskScore}%; background: #4361ee;"></div></div>
                        <span>${stats.taskScore}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span>Mood</span>
                        <div class="mini-bar"><div class="mini-fill" style="width: ${stats.moodScore}%; background: #f72585;"></div></div>
                        <span>${stats.moodScore}%</span>
                    </div>
                    <div class="breakdown-item">
                        <span>Habits</span>
                        <div class="mini-bar"><div class="mini-fill" style="width: ${stats.habitScore}%; background: #06ffa5;"></div></div>
                        <span>${stats.habitScore}%</span>
                    </div>
                </div>
            </div>

            <div class="overview-card shine">
                <div class="overview-header">
                    <h3>Weekly Snapshot</h3>
                    <button class="btn-icon" onclick="switchDashboardPeriod('week')">📅</button>
                </div>
                <div class="snapshot-stats">
                    <div class="snapshot-item">
                        <i class="fas fa-tasks"></i>
                        <div>
                            <div class="snapshot-value">${stats.weeklyTasksCompleted}/${stats.weeklyTasksTotal}</div>
                            <div class="snapshot-label">Tasks Completed</div>
                        </div>
                        <div class="snapshot-percent">${stats.weeklyTaskPercent}%</div>
                    </div>
                    <div class="snapshot-item">
                        <i class="fas fa-book"></i>
                        <div>
                            <div class="snapshot-value">${stats.weeklyMoodEntries}</div>
                            <div class="snapshot-label">Mood Entries</div>
                        </div>
                        <div class="snapshot-percent">${Math.round(stats.weeklyMoodEntries / 7 * 100)}%</div>
                    </div>
                    <div class="snapshot-item">
                        <i class="fas fa-fire"></i>
                        <div>
                            <div class="snapshot-value">${stats.currentStreak}</div>
                            <div class="snapshot-label">Day Streak</div>
                        </div>
                        <div class="snapshot-percent">🔥</div>
                    </div>
                </div>
            </div>

            <div class="overview-card shine">
                <div class="overview-header">
                    <h3>Active Challenges</h3>
                    <button class="btn-icon" onclick="showChallengeDetails()">🎯</button>
                </div>
                <div class="challenges-list">
                    ${stats.activeChallenges.length ? stats.activeChallenges.map(challenge => `
                        <div class="challenge-item">
                            <div class="challenge-header">
                                <span class="challenge-name">${challenge.name}</span>
                                <span class="challenge-progress">${challenge.progress}%</span>
                            </div>
                            <div class="progress-bar-small">
                                <div class="progress-fill-small" style="width: ${challenge.progress}%"></div>
                            </div>
                            <div class="challenge-details">
                                <span>${challenge.current}/${challenge.target}</span>
                                <span class="challenge-days">${challenge.daysLeft} days left</span>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state">No challenges yet.</div>'}
                </div>
            </div>
        </div>
    `;
}

function renderWeeklyActivityChart() {
    const container = document.getElementById('dashboardWeeklyActivityChart');
    if (!container) return;

    const weekData = getWeeklyActivityData();
    const maxValue = Math.max(...weekData.values, 0) || 1;
    
    container.innerHTML = `
        <div class="chart-header">
            <h3>📊 Weekly Activity</h3>
            <button class="btn-icon" onclick="switchChartType('weekly')">⚙️</button>
        </div>
        <div class="bar-chart">
            ${weekData.labels.map((label, idx) => `
                <div class="bar-container">
                    <div class="bar-wrapper">
                        <div class="bar" style="height: ${(weekData.values[idx] / maxValue) * 100}%; background: linear-gradient(180deg, #4361ee 0%, #7209b7 100%)">
                            <span class="bar-value">${weekData.values[idx]}</span>
                        </div>
                    </div>
                    <span class="bar-label">${label}</span>
                </div>
            `).join('')}
        </div>
        <div class="chart-stats">
            <div class="stat-item">
                <span>Average:</span>
                <span class="stat-value">${Math.round(weekData.values.reduce((a,b) => a+b, 0) / weekData.values.length)}</span>
            </div>
            <div class="stat-item">
                <span>Total:</span>
                <span class="stat-value">${weekData.values.reduce((a,b) => a+b, 0)}</span>
            </div>
        </div>
    `;
}

function renderMoodTrendChart() {
    const container = document.getElementById('dashboardMoodTrendChart');
    if (!container) return;

    const moodData = getMoodTrendData();
    const moodEmojis = { 'very-sad': '😢', 'sad': '😞', 'okay': '😐', 'good': '😊', 'great': '😄' };
    
    container.innerHTML = `
        <div class="chart-header">
            <h3>💭 Mood Trend (Last 7 Days)</h3>
            <button class="btn-icon" onclick="switchChartType('mood')">⚙️</button>
        </div>
        <div class="mood-chart">
            ${moodData.map((entry, idx) => `
                <div class="mood-data-point" onclick="showMoodDetail('${entry.date}')">
                    <div class="mood-value">${entry.mood ? (moodEmojis[entry.mood] || '😐') : '—'}</div>
                    <div class="mood-label">${entry.dateShort}</div>
                    <div class="mood-intensity">Intensity: ${entry.intensity || 'N/A'}</div>
                </div>
            `).join('')}
        </div>
        <div class="mood-insights">
            <span>🔍 Most Common: <strong>${moodData[0]?.mostCommon || 'Not tracked'}</strong></span>
            <span>📈 Trend: <strong>${moodData[0]?.trend || 'Stable'}</strong></span>
        </div>
    `;
}

function renderHabitCompletionChart() {
    const container = document.getElementById('habitCompletionChart');
    if (!container) return;

    const habitData = getHabitCompletionData();

    if (!habitData.length) {
        container.innerHTML = `
            <div class="chart-header">
                <h3>✅ Habit Completion Rate</h3>
            </div>
            <div class="empty-state">No habits tracked yet.</div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="chart-header">
            <h3>✅ Habit Completion Rate</h3>
            <button class="btn-icon" onclick="switchChartType('habits')">⚙️</button>
        </div>
        <div class="habits-grid">
            ${habitData.map(habit => `
                <div class="habit-card">
                    <div class="habit-header">
                        <span class="habit-name">${habit.name}</span>
                        <span class="habit-percent">${habit.completionRate}%</span>
                    </div>
                    <div class="habit-bar">
                        <div class="habit-fill" style="width: ${habit.completionRate}%; background: ${habit.color}"></div>
                    </div>
                    <div class="habit-meta">
                        <span>Streak: <strong>${habit.streak}</strong> days</span>
                        <span>This week: ${habit.thisWeek}/${habit.total}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    if (!container) return;

    const categories = getCategoryData();
    const total = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    container.innerHTML = `
        <div class="chart-header">
            <h3>📂 Task Categories</h3>
            <button class="btn-icon" onclick="switchChartType('categories')">⚙️</button>
        </div>
        <div class="category-breakdown">
            ${categories.map(cat => `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-icon">${cat.icon}</span>
                        <div class="category-details">
                            <span class="category-name">${cat.name}</span>
                            <span class="category-count">${cat.count} tasks</span>
                        </div>
                    </div>
                    <div class="category-stat">
                        <span class="percentage">${total ? Math.round(cat.count / total * 100) : 0}%</span>
                        <span class="completion-rate">${cat.completionRate}% done</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderQuickStats() {
    const container = document.getElementById('quickStats');
    if (!container) return;

    const stats = {
        xp: appState.userStats.xp,
        level: appState.userStats.level,
        healthScore: appState.userStats.healthScore,
        consistency: appState.userStats.consistency,
        streak: appState.userStats.streak,
        totalTasks: appState.userStats.tasksCompleted,
        nextMilestone: calculateNextMilestone()
    };

    container.innerHTML = `
        <div class="quick-stats-grid">
            <div class="quick-stat-card">
                <div class="stat-icon-lg">⭐</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.level}</div>
                    <div class="stat-name">Current Level</div>
                </div>
                <div class="stat-progress">
                    <div class="progress-ring">
                        <svg class="progress-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" class="progress-bg"></circle>
                            <circle cx="50" cy="50" r="40" class="progress-circle" style="--progress: ${stats.xp / appState.userStats.xpNeeded}"></circle>
                        </svg>
                        <span class="ring-text">${stats.xp}/${appState.userStats.xpNeeded}</span>
                    </div>
                </div>
            </div>

            <div class="quick-stat-card">
                <div class="stat-icon-lg">❤️</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.healthScore}%</div>
                    <div class="stat-name">Health Score</div>
                </div>
                <div class="stat-progress">
                    <div class="circular-bar" style="--value: ${stats.healthScore}">
                        <div class="health-status">${getHealthStatus(stats.healthScore)}</div>
                    </div>
                </div>
            </div>

            <div class="quick-stat-card">
                <div class="stat-icon-lg">🔥</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.streak}</div>
                    <div class="stat-name">Day Streak</div>
                </div>
                <div class="stat-progress">
                    <div class="streak-indicator" style="--streak: ${Math.min(stats.streak * 10, 100)}%">
                        <span>+${stats.streak} bonus XP/day</span>
                    </div>
                </div>
            </div>

            <div class="quick-stat-card">
                <div class="stat-icon-lg">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.consistency}%</div>
                    <div class="stat-name">Consistency</div>
                </div>
                <div class="stat-progress">
                    <div class="consistency-meter" style="--consistency: ${stats.consistency}%">
                        <span>${getConsistencyLevel(stats.consistency)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    const activities = getRecentActivities();
    
    container.innerHTML = `
        <div class="activity-header">
            <h3>📜 Recent Activity</h3>
            <button class="btn-icon" onclick="showAllActivities()">→</button>
        </div>
        <div class="activity-list">
            ${activities.length ? activities.slice(0, 5).map(activity => `
                <div class="activity-item" data-time="${activity.timestamp}">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                    </div>
                    <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                </div>
            `).join('') : '<div class="empty-state">No recent activity yet.</div>'}
        </div>
        <div class="activity-footer">
            <a href="#" onclick="showAllActivities(); return false;">View all activities →</a>
        </div>
    `;
}

function renderInsights() {
    const container = document.getElementById('insights');
    if (!container) return;

    const insights = generateInsights();
    
    container.innerHTML = `
        <div class="insights-header">
            <h3>💡 AI Insights</h3>
            <button class="btn-icon" onclick="refreshInsights()">🔄</button>
        </div>
        <div class="insights-list">
            ${insights.length ? insights.map(insight => `
                <div class="insight-card" data-type="${insight.type}">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-content">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-text">${insight.message}</div>
                        <div class="insight-action">
                            <button class="btn-small" onclick="actOnInsight('${insight.id}')">${insight.action}</button>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="empty-state">No insights yet.</div>'}
        </div>
    `;
}

function renderMilestones() {
    const container = document.getElementById('milestones');
    if (!container) return;

    const milestones = getUpcomingMilestones();
    
    container.innerHTML = `
        <div class="milestones-header">
            <h3>🎯 Upcoming Milestones</h3>
            <button class="btn-icon" onclick="showMilestoneDetails()">→</button>
        </div>
        <div class="milestones-timeline">
            ${milestones.map((milestone, idx) => `
                <div class="milestone-item ${milestone.reached ? 'reached' : 'pending'}">
                    <div class="milestone-marker"></div>
                    <div class="milestone-content">
                        <div class="milestone-title">${milestone.title}</div>
                        <div class="milestone-progress">
                            <span>${milestone.current}/${milestone.target}</span>
                            <div class="milestone-bar">
                                <div class="milestone-fill" style="width: ${milestone.progress}%"></div>
                            </div>
                        </div>
                        <div class="milestone-reward">
                            Reward: <strong>${milestone.reward}</strong> XP
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Helper Functions

function calculateDashboardStats() {
    const taskScore = Math.min((appState.userStats.consistency || 0), 100);
    const moodScore = (appState.moodHistory && appState.moodHistory.length) ? 100 : 0;
    const habitScore = calculateHabitScore();

    const overallScore = Math.round((taskScore + moodScore + habitScore) / 3);
    
    const scoreColor = overallScore >= 80 ? '#06ffa5' : 
                       overallScore >= 60 ? '#4361ee' : 
                       overallScore >= 40 ? '#f72585' : '#ff006e';

    const weekData = getWeeklyActivityData();
    const weeklyTasksCompleted = weekData.values.reduce((a, b) => a + b, 0);
    const weeklyTasksTotal = Math.max(weekData.totalTasks, 0);
    const weeklyTaskPercent = weeklyTasksTotal > 0 ? Math.round((weeklyTasksCompleted / weeklyTasksTotal) * 100) : 0;
    const weeklyMoodEntries = getMoodTrendData().filter(e => !!e.mood).length;

    return {
        overallScore,
        scoreColor,
        taskScore: Math.round(taskScore),
        moodScore: Math.round(moodScore),
        habitScore: Math.round(habitScore),
        weeklyTasksCompleted,
        weeklyTasksTotal,
        weeklyTaskPercent,
        weeklyMoodEntries,
        currentStreak: appState.userStats.streak || 0,
        activeChallenges: getActiveChallenges()
    };
}

function getWeeklyActivityData() {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [0, 0, 0, 0, 0, 0, 0];
    let totalTasks = 0;

    const history = appState.tasksHistory || {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const id = getDateString(d);
        const day = history[id];
        const completed = (day && typeof day.completed === 'number') ? day.completed : 0;
        const total = (day && typeof day.total === 'number') ? day.total : 0;
        totalTasks += total;

        const dayIndex = d.getDay();
        const idx = dayIndex === 0 ? 6 : dayIndex - 1;
        values[idx] += completed;
    }

    return { labels, values, totalTasks };
}

function getMoodTrendData() {
    const moods = [];
    const moodHistory = appState.moodHistory || [];
    const byDate = {};
    moodHistory.forEach(e => {
        if (e && e.date) byDate[e.date] = e;
    });

    const moodScore = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };

    const scores = [];
    const moodCounts = {};

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const id = getDateString(d);
        const entry = byDate[id];
        const isToday = i === 0;

        if (entry && entry.mood) {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            scores.push(moodScore[entry.mood] || 0);
        }

        moods.push({
            date: id,
            dateShort: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
            mood: entry ? entry.mood : null,
            intensity: entry && typeof entry.intensity === 'number' ? entry.intensity : null
        });
    }

    const mostCommon = Object.keys(moodCounts).length
        ? Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b))
        : null;

    let trend = 'Stable';
    if (scores.length >= 4) {
        const mid = Math.floor(scores.length / 2);
        const first = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
        const second = scores.slice(mid).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - mid);
        if (second > first + 0.3) trend = 'Improving';
        else if (second < first - 0.3) trend = 'Declining';
    }

    if (moods.length) {
        moods[0].mostCommon = mostCommon ? mostCommon.replace('-', ' ') : 'Not tracked';
        moods[0].trend = trend;
    }

    return moods;
}

function getHabitCompletionData() {
    const habits = Object.values(appState.badHabits || {});
    if (!habits.length) return [];

    const palette = ['#4361ee', '#7209b7', '#f72585', '#06ffa5', '#4cc9f0'];
    const targetDays = 30;

    return habits.slice(0, 6).map((h, idx) => {
        const quit = h.quitDate ? new Date(h.quitDate) : null;
        const streak = quit ? Math.floor((new Date() - quit) / (1000 * 60 * 60 * 24)) : 0;
        const completionRate = Math.min(100, Math.round((streak / targetDays) * 100));
        return {
            name: h.name || 'Habit',
            completionRate,
            streak,
            thisWeek: Math.min(7, streak),
            total: 7,
            color: palette[idx % palette.length]
        };
    });
}

function getCategoryData() {
    const iconMap = {
        morning: '🌅',
        health: '❤️',
        productivity: '🚀',
        evening: '🌙',
        custom: '⭐'
    };
    const nameMap = {
        morning: 'Morning',
        health: 'Health',
        productivity: 'Productivity',
        evening: 'Evening',
        custom: 'Custom'
    };

    return Object.keys(appState.userTasks || {}).map(key => {
        const tasks = appState.userTasks[key] || [];
        const total = tasks.length;
        const done = tasks.filter(t => t && t.completed).length;
        const completionRate = total ? Math.round((done / total) * 100) : 0;
        return {
            name: nameMap[key] || key,
            icon: iconMap[key] || '📋',
            count: total,
            completionRate
        };
    });
}

function calculateHabitScore() {
    if (!appState.badHabits || Object.keys(appState.badHabits).length === 0) return 0;
    const completed = Object.values(appState.badHabits).filter(h => h.quitDate).length;
    return Math.min((completed / Object.keys(appState.badHabits).length) * 100, 100);
}

function getActiveChallenges() {
    // Challenge system is not implemented; avoid showing fake/demo data.
    return [];
}

function getRecentActivities() {
    const activities = [];

    (appState.journalEntries || []).slice(0, 3).forEach(e => {
        const ts = e.timestamp && e.timestamp.seconds ? (e.timestamp.seconds * 1000) : (e.timestamp ? new Date(e.timestamp).getTime() : null);
        if (!ts) return;
        activities.push({
            icon: '📖',
            title: 'Journal Entry',
            description: e.content ? `Wrote ${Math.min(200, e.content.length)} chars` : 'New entry',
            timestamp: ts
        });
    });

    (appState.moodHistory || []).slice(0, 3).forEach(e => {
        const ts = e.timestamp && e.timestamp.seconds ? (e.timestamp.seconds * 1000) : (e.timestamp ? new Date(e.timestamp).getTime() : null);
        if (!ts) return;
        activities.push({
            icon: '🎯',
            title: 'Mood Logged',
            description: e.mood ? `Mood: ${e.mood}` : 'Mood logged',
            timestamp: ts
        });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp);
}

function generateInsights() {
    const insights = [];

    // Today's completion
    let total = 0;
    let done = 0;
    for (const category in (appState.userTasks || {})) {
        (appState.userTasks[category] || []).forEach(t => {
            total++;
            if (t && t.completed) done++;
        });
    }
    if (total) {
        const pct = Math.round((done / total) * 100);
        insights.push({
            id: 'daily-completion',
            icon: '✅',
            type: 'routine',
            title: 'Today’s Completion',
            message: `You’ve completed ${pct}% of today’s tasks.`,
            action: 'View Tasks'
        });
    }

    // Mood tracking
    const mood7 = getMoodTrendData().filter(e => !!e.mood);
    if (mood7.length) {
        insights.push({
            id: 'mood-tracking',
            icon: '💭',
            type: 'mood',
            title: 'Mood Tracking',
            message: `You logged mood ${mood7.length} time(s) in the last 7 days.`,
            action: 'Details'
        });
    }

    return insights;
}

function getUpcomingMilestones() {
    const tasks = appState.userStats.tasksCompleted || 0;
    const level = appState.userStats.level || 1;
    const streak = appState.userStats.streak || 0;

    const list = [
        { title: 'Complete 100 Tasks', current: tasks, target: 100, reward: 500 },
        { title: 'Reach Level 10', current: level, target: 10, reward: 1000 },
        { title: '30-Day Streak', current: streak, target: 30, reward: 2000 }
    ];

    return list.map(m => {
        const progress = m.target > 0 ? Math.min(100, Math.round((m.current / m.target) * 100)) : 0;
        return { ...m, progress, reached: m.current >= m.target };
    });
}

function calculateNextMilestone() {
    const milestones = getUpcomingMilestones();
    const nextNotReached = milestones.find(m => !m.reached);
    return nextNotReached || milestones[0];
}

function getHealthStatus(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
}

function getConsistencyLevel(consistency) {
    if (consistency >= 90) return 'Exceptional';
    if (consistency >= 75) return 'Strong';
    if (consistency >= 60) return 'Good';
    if (consistency >= 40) return 'Fair';
    return 'Building';
}

function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return 'a week ago';
}

// Interactive Functions

function switchDashboardPeriod(period) {
    appState.dashboardPeriod = period;
    renderDashboardOverview();
    showToast(`Switched to ${period} view`, 'info');
}

function switchChartType(type) {
    appState.chartType = type;
    showToast(`Chart type changed`, 'info');
}

function showChallengeDetails() {
    const challenges = getActiveChallenges();
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Active Challenges</h3>
                <button class="close-btn" onclick="this.closest('.modal').style.display='none'">×</button>
            </div>
            <div class="modal-body">
                ${challenges.map(ch => `
                    <div class="challenge-detail-card">
                        <h4>${ch.name}</h4>
                        <p>Progress: ${ch.current}/${ch.target}</p>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${ch.progress}%"></div></div>
                        <p>Time remaining: ${ch.daysLeft} days</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    showModal(modalHTML);
}

function showMoodDetail(date) {
    showToast(`Mood for ${date} loaded`, 'info');
}

function showAllActivities() {
    const activities = getRecentActivities();
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>All Activities</h3>
                <button class="close-btn" onclick="this.closest('.modal').style.display='none'">×</button>
            </div>
            <div class="modal-body activity-modal-list">
                ${activities.map(activity => `
                    <div class="activity-modal-item">
                        <span class="icon">${activity.icon}</span>
                        <div class="content">
                            <strong>${activity.title}</strong>
                            <p>${activity.description}</p>
                        </div>
                        <span class="time">${formatTimeAgo(activity.timestamp)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    showModal(modalHTML);
}

function refreshInsights() {
    renderInsights();
    showToast('Insights refreshed!', 'success');
}

function actOnInsight(insightId) {
    const actions = {
        'daily-routine': () => navigateTo('tracker'),
        'mood-pattern': () => navigateTo('mood'),
        'health-suggestion': () => navigateTo('goals')
    };
    actions[insightId]?.();
    showToast('Navigating...', 'info');
}

function showMilestoneDetails() {
    const milestones = getUpcomingMilestones();
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 Milestones</h3>
                <button class="close-btn" onclick="this.closest('.modal').style.display='none'">×</button>
            </div>
            <div class="modal-body">
                ${milestones.map(m => `
                    <div class="milestone-modal-item ${m.reached ? 'completed' : ''}">
                        <h4>${m.title}</h4>
                        <p>${m.current}/${m.target}</p>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${m.progress}%"></div></div>
                        <p class="reward">Reward: <strong>${m.reward} XP</strong></p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    showModal(modalHTML);
}

function showModal(content) {
    let modal = document.getElementById('dashboardModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dashboardModal';
        modal.className = 'modal';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        document.body.appendChild(modal);
    }
    modal.innerHTML = content;
    modal.style.display = 'flex';
}
