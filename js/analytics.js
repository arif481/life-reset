// Analytics and Charts Functions

function initCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Charts will not be available.');
        return;
    }
    initMoodChart();
    initCompletionChart();
}

function initMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    const moodData = [8, 7, 9, 8, 6, 7, 9];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Score',
                data: moodData,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#2b2d42', font: { size: 12, weight: '600' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { color: '#777', stepSize: 2 },
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    ticks: { color: '#777' },
                    grid: { display: false }
                }
            }
        }
    });
}

function initCompletionChart() {
    const ctx = document.getElementById('completionChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    const completionData = [85, 90, 78, 88, 92, 80, 87];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    completionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionData,
                backgroundColor: '#4cc9f0',
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#2b2d42', font: { size: 12, weight: '600' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#777' },
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    ticks: { color: '#777' },
                    grid: { display: false }
                }
            }
        }
    });
}

function loadAnalyticsData() {
    if (!appState.currentUser || !db) return;
    
    // Calculate insights
    const insights = {
        bestTask: 'Morning Routine',
        moodImpactScore: 8.5,
        consistencyTrend: 87
    };
    
    // Update insight cards
    document.getElementById('bestTaskInsight').textContent = insights.bestTask || 'N/A';
    document.getElementById('moodImpactInsight').textContent = Math.round(insights.moodImpactScore) || '0';
    document.getElementById('consistencyInsight').textContent = Math.round(insights.consistencyTrend) + '%' || '0%';
}

// Render achievements on dashboard
function renderAchievements() {
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    const achievements = [
        { title: 'First Step', icon: 'fa-footsteps', locked: false },
        { title: 'Week Warrior', icon: 'fa-calendar-week', locked: true },
        { title: 'Mood Master', icon: 'fa-smile', locked: true },
        { title: 'Journal Keeper', icon: 'fa-book', locked: true },
        { title: 'Early Riser', icon: 'fa-sun', locked: true },
        { title: 'Hydration Hero', icon: 'fa-tint', locked: true }
    ];
    
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.locked ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
            <div class="achievement-title">${achievement.title}</div>
        `;
        container.appendChild(card);
    });
}
