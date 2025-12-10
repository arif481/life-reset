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
                    ${stats.activeChallenges.map(challenge => `
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
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderWeeklyActivityChart() {
    const container = document.getElementById('weeklyActivityChart');
    if (!container) return;

    const weekData = getWeeklyActivityData();
    const maxValue = Math.max(...weekData.values);
    
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
    const container = document.getElementById('moodTrendChart');
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
                    <div class="mood-value">${moodEmojis[entry.mood] || '😐'}</div>
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
                        <span class="percentage">${Math.round(cat.count / total * 100)}%</span>
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
            ${activities.slice(0, 5).map(activity => `
                <div class="activity-item" data-time="${activity.timestamp}">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                    </div>
                    <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                </div>
            `).join('')}
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
            ${insights.map(insight => `
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
            `).join('')}
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
    const taskScore = appState.userStats.tasksCompleted > 0 ? 
        Math.min((appState.userStats.consistency || 0), 100) : 0;
    const moodScore = (appState.userStats.moodLogged || 0) > 0 ? 
        Math.min((appState.userStats.moodLogged / 7) * 100, 100) : 0;
    const habitScore = calculateHabitScore();
    
    const overallScore = Math.round((taskScore + moodScore + habitScore) / 3);
    
    const scoreColor = overallScore >= 80 ? '#06ffa5' : 
                       overallScore >= 60 ? '#4361ee' : 
                       overallScore >= 40 ? '#f72585' : '#ff006e';

    const weekData = getWeeklyActivityData();
    const weeklyTasksCompleted = appState.userStats.tasksCompleted;
    const weeklyTasksTotal = Math.max(appState.userStats.tasksCompleted, 1);
    const weeklyTaskPercent = Math.round((weeklyTasksCompleted / weeklyTasksTotal) * 100);
    const weeklyMoodEntries = appState.userStats.moodLogged || 0;

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
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [12, 19, 5, 8, 14, 10, 15]; // Placeholder data
    return { labels: days, values };
}

function getMoodTrendData() {
    // Placeholder mood trend data
    const moods = [
        { date: new Date(Date.now() - 6*24*60*60*1000), dateShort: '6d ago', mood: 'good', intensity: 7, mostCommon: 'Good 😊', trend: 'Stable' },
        { date: new Date(Date.now() - 5*24*60*60*1000), dateShort: '5d ago', mood: 'great', intensity: 8 },
        { date: new Date(Date.now() - 4*24*60*60*1000), dateShort: '4d ago', mood: 'okay', intensity: 5 },
        { date: new Date(Date.now() - 3*24*60*60*1000), dateShort: '3d ago', mood: 'good', intensity: 7 },
        { date: new Date(Date.now() - 2*24*60*60*1000), dateShort: '2d ago', mood: 'good', intensity: 6 },
        { date: new Date(Date.now() - 1*24*60*60*1000), dateShort: '1d ago', mood: 'great', intensity: 8 },
        { date: new Date(), dateShort: 'Today', mood: 'good', intensity: 7 }
    ];
    return moods;
}

function getHabitCompletionData() {
    return [
        { name: 'Morning Exercise', completionRate: 85, streak: 12, thisWeek: 5, total: 7, color: '#4361ee' },
        { name: 'Read Daily', completionRate: 70, streak: 8, thisWeek: 5, total: 7, color: '#7209b7' },
        { name: 'Meditation', completionRate: 60, streak: 5, thisWeek: 4, total: 7, color: '#f72585' },
        { name: 'Healthy Eating', completionRate: 75, streak: 10, thisWeek: 5, total: 7, color: '#06ffa5' }
    ];
}

function getCategoryData() {
    const categories = appState.taskCategories || [];
    return categories.map(cat => ({
        name: cat.name,
        icon: cat.icon || '📋',
        count: appState.userTasks.filter(t => t.category === cat.id && t.completed).length,
        completionRate: 75
    }));
}

function calculateHabitScore() {
    if (!appState.badHabits || Object.keys(appState.badHabits).length === 0) return 0;
    const completed = Object.values(appState.badHabits).filter(h => h.quitDate).length;
    return Math.min((completed / Object.keys(appState.badHabits).length) * 100, 100);
}

function getActiveChallenges() {
    return [
        { name: 'Complete 50 Tasks', progress: 75, current: 37, target: 50, daysLeft: 10 },
        { name: '30-Day Consistency', progress: 60, current: 18, target: 30, daysLeft: 12 },
        { name: 'Perfect Health Week', progress: 80, current: 4, target: 5, daysLeft: 3 }
    ];
}

function getRecentActivities() {
    return [
        { icon: '✅', title: 'Task Completed', description: 'Finished "Morning Exercise"', timestamp: Date.now() - 1000 * 60 * 5 },
        { icon: '🎯', title: 'Mood Logged', description: 'Great mood recorded', timestamp: Date.now() - 1000 * 60 * 30 },
        { icon: '📖', title: 'Journal Entry', description: 'Wrote about daily progress', timestamp: Date.now() - 1000 * 60 * 60 },
        { icon: '🏆', title: 'Badge Earned', description: 'Unlocked "Week Warrior"', timestamp: Date.now() - 1000 * 60 * 120 },
        { icon: '⭐', title: 'Level Up!', description: 'Reached Level 5', timestamp: Date.now() - 1000 * 60 * 180 }
    ];
}

function generateInsights() {
    const now = new Date();
    const hour = now.getHours();
    
    return [
        {
            id: 'daily-routine',
            icon: '⏰',
            type: 'routine',
            title: 'Daily Routine Check',
            message: 'You have completed 75% of your daily tasks. Keep up the consistency!',
            action: 'View Tasks'
        },
        {
            id: 'mood-pattern',
            icon: '📈',
            type: 'mood',
            title: 'Mood Trend',
            message: 'Your mood has improved over the past week. Great job maintaining positivity!',
            action: 'Details'
        },
        {
            id: 'health-suggestion',
            icon: '💪',
            type: 'health',
            title: 'Health Tip',
            message: `It's ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}. ${hour < 12 ? 'Start with a morning exercise!' : 'Time for a quick workout!'}`,
            action: 'Log Activity'
        }
    ];
}

function getUpcomingMilestones() {
    return [
        { title: 'Complete 100 Tasks', current: 75, target: 100, progress: 75, reached: false, reward: 500 },
        { title: 'Reach Level 10', current: 5, target: 10, progress: 50, reached: false, reward: 1000 },
        { title: 'Perfect Month', current: 18, target: 30, progress: 60, reached: false, reward: 2000 }
    ];
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
