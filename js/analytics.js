/**
 * @fileoverview Analytics & Visualization Module
 * @description Advanced data visualization with Chart.js integration
 * @version 1.0.0
 */



/* ==========================================================================
   Chart Instances
   ========================================================================== */

let moodTrendChart = null;
let completionRateChart = null;
let categoryPerformanceChart = null;
let xpProgressChart = null;
let habitStreakChart = null;
let weeklyActivityChart = null;

/* ==========================================================================
   Module State
   ========================================================================== */

let analyticsTimeRange = '7days';

// Initialize all analytics
function initAnalytics() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Charts will not be available.');
        return;
    }
    
    // Destroy existing charts before reinitializing
    destroyAllCharts();
    
    // Initialize all chart types
    initMoodTrendChart();
    initCompletionRateChart();
    initCategoryPerformanceChart();
    initXPProgressChart();
    initHabitStreakChart();
    initWeeklyActivityChart();
    
    // Load and display analytics data
    loadAnalyticsData();
    updateAnalyticsStats();
}

// Destroy all existing charts
function destroyAllCharts() {
    if (moodTrendChart) { moodTrendChart.destroy(); moodTrendChart = null; }
    if (completionRateChart) { completionRateChart.destroy(); completionRateChart = null; }
    if (categoryPerformanceChart) { categoryPerformanceChart.destroy(); categoryPerformanceChart = null; }
    if (xpProgressChart) { xpProgressChart.destroy(); xpProgressChart = null; }
    if (habitStreakChart) { habitStreakChart.destroy(); habitStreakChart = null; }
    if (weeklyActivityChart) { weeklyActivityChart.destroy(); weeklyActivityChart = null; }
}

// Get date range for analytics
function getDateRange() {
    const today = new Date();
    let startDate = new Date();
    
    switch(analyticsTimeRange) {
        case '7days':
            startDate.setDate(today.getDate() - 7);
            break;
        case '30days':
            startDate.setDate(today.getDate() - 30);
            break;
        case '90days':
            startDate.setDate(today.getDate() - 90);
            break;
        case 'all':
            startDate = new Date(2024, 0, 1); // Beginning of year or user start date
            break;
    }
    
    return { startDate, endDate: today };
}

/**
 * Change analytics time range
 * @param {string} range - Time range: '7days' | '30days' | '90days' | 'all'
 * @param {Event} [evt] - Optional click event
 */
function changeTimeRange(range, evt) {
    analyticsTimeRange = range;
    
    // Update active button
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
    
    // Refresh analytics
    initAnalytics();
}

function listDays(startDate, endDate) {
    const days = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
}

function moodScoreFromEntry(entry) {
    const moodToScore10 = { 'very-sad': 2, 'sad': 4, 'okay': 6, 'good': 8, 'great': 10 };
    if (!entry) return null;
    if (typeof entry.intensity === 'number') {
        // Stored as 0-100; normalize to 0-10
        return Math.max(0, Math.min(10, entry.intensity / 10));
    }
    if (entry.mood && moodToScore10[entry.mood] !== undefined) return moodToScore10[entry.mood];
    return null;
}

// 1. Mood Trend Chart (Line chart with area fill)
function initMoodTrendChart() {
    const ctx = document.getElementById('moodTrendChart');
    if (!ctx || ctx.tagName !== 'CANVAS') return;
    
    const { labels, data } = getMoodTrendData();
    
    moodTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Score',
                data: data,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#4361ee',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42', 
                        font: { size: 13, weight: '600' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderColor: '#4361ee',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            if (context.parsed.y === null || typeof context.parsed.y === 'undefined') return 'Mood: N/A';
                            return 'Mood: ' + context.parsed.y + '/10';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        stepSize: 2,
                        font: { size: 11 }
                    },
                    grid: { 
                        color: appState.isDarkMode ? '#3a3a4e' : '#f0f0f0',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// 2. Completion Rate Chart (Bar chart)
function initCompletionRateChart() {
    const ctx = document.getElementById('completionRateChart');
    if (!ctx || ctx.tagName !== 'CANVAS') return;
    
    const { labels, data } = getCompletionRateData();
    
    completionRateChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion Rate',
                data: data,
                backgroundColor: data.map(val => {
                    if (val >= 80) return '#4cc9f0';
                    if (val >= 50) return '#f72585';
                    return '#ff9500';
                }),
                borderRadius: 8,
                borderWidth: 0,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42',
                        font: { size: 13, weight: '600' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderColor: '#4cc9f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Completion: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { 
                        color: appState.isDarkMode ? '#3a3a4e' : '#f0f0f0',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// 3. Category Performance Chart (Doughnut chart)
function initCategoryPerformanceChart() {
    const ctx = document.getElementById('categoryPerformanceChart');
    if (!ctx || ctx.tagName !== 'CANVAS') return;
    
    const categoryData = getCategoryPerformanceData();
    
    categoryPerformanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.values,
                backgroundColor: [
                    '#4361ee',
                    '#4cc9f0',
                    '#f72585',
                    '#ff9500',
                    '#7209b7'
                ],
                borderWidth: 3,
                borderColor: appState.isDarkMode ? '#1a1a2e' : '#fff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42',
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            if (!total) return context.label + ': ' + context.parsed + ' tasks';
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' tasks (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// 4. XP Progress Chart (Line chart with gradient)
function initXPProgressChart() {
    const canvas = document.getElementById('xpProgressChart');
    if (!canvas || canvas.tagName !== 'CANVAS') return;
    
    const { labels, data } = getXPProgressData();
    
    // Create gradient
    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(114, 9, 183, 0.3)');
    gradient.addColorStop(1, 'rgba(114, 9, 183, 0.05)');
    
    xpProgressChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'XP Earned',
                data: data,
                borderColor: '#7209b7',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#7209b7',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42',
                        font: { size: 13, weight: '600' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderColor: '#7209b7',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'XP: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { 
                        color: appState.isDarkMode ? '#3a3a4e' : '#f0f0f0',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// 5. Habit Streak Chart (Mixed bar and line)
function initHabitStreakChart() {
    const ctx = document.getElementById('habitStreakChart');
    if (!ctx || ctx.tagName !== 'CANVAS') return;
    
    const { labels, streakData, targetData } = getHabitStreakData();
    
    habitStreakChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current Streak',
                    data: streakData,
                    backgroundColor: '#4cc9f0',
                    borderRadius: 6,
                    order: 2
                },
                {
                    label: 'Target Streak',
                    data: targetData,
                    type: 'line',
                    borderColor: '#f72585',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42',
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { 
                        color: appState.isDarkMode ? '#3a3a4e' : '#f0f0f0',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: { 
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// 6. Weekly Activity Heatmap Chart (Polar area)
function initWeeklyActivityChart() {
    const ctx = document.getElementById('weeklyActivityChart');
    if (!ctx || ctx.tagName !== 'CANVAS') return;
    
    const activityData = getWeeklyActivityData();
    
    weeklyActivityChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                data: activityData,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(76, 201, 240, 0.7)',
                    'rgba(247, 37, 133, 0.7)',
                    'rgba(255, 149, 0, 0.7)',
                    'rgba(114, 9, 183, 0.7)',
                    'rgba(57, 255, 20, 0.7)',
                    'rgba(255, 0, 110, 0.7)'
                ],
                borderWidth: 2,
                borderColor: appState.isDarkMode ? '#1a1a2e' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: appState.isDarkMode ? '#e0e0e0' : '#2b2d42',
                        font: { size: 11 },
                        padding: 10
                    }
                },
                tooltip: {
                    backgroundColor: appState.isDarkMode ? '#2b2d42' : '#fff',
                    titleColor: appState.isDarkMode ? '#fff' : '#2b2d42',
                    bodyColor: appState.isDarkMode ? '#e0e0e0' : '#555',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.r + ' tasks';
                        }
                    }
                }
            },
            scales: {
                r: {
                    ticks: {
                        color: appState.isDarkMode ? '#aaa' : '#777',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: appState.isDarkMode ? '#3a3a4e' : '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Data extraction functions
function getMoodTrendData() {
    const { startDate, endDate } = getDateRange();
    const labels = [];
    const data = [];

    const moodByDate = {};
    (appState.moodHistory || []).forEach(entry => {
        if (entry && entry.date) moodByDate[entry.date] = entry;
    });

    const days = listDays(startDate, endDate) || [];
    days.forEach(date => {
        const dateId = getDateString(date);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(moodScoreFromEntry(moodByDate[dateId]));
    });

    return { labels, data };
}

function getCompletionRateData() {
    const { startDate, endDate } = getDateRange();
    const labels = [];
    const data = [];

    const history = appState.tasksHistory || {};
    const fallbackTotal = (typeof getTotalTaskCount === 'function') ? getTotalTaskCount() : null;

    const days = listDays(startDate, endDate) || [];
    days.forEach(date => {
        const dateId = getDateString(date);
        const day = history[dateId];

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const total = (day && typeof day.total === 'number') ? day.total : (fallbackTotal || 0);
        const completed = (day && typeof day.completed === 'number') ? day.completed : 0;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        data.push(rate);
    });

    return { labels, data };
}

function getCategoryPerformanceData() {
    const categories = {
        'Morning': 0,
        'Health': 0,
        'Productivity': 0,
        'Evening': 0,
        'Custom': 0
    };
    
    for (const category in appState.userTasks) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const completedInCategory = appState.userTasks[category].filter(t => t.completed).length;
        
        if (categories[categoryName] !== undefined) {
            categories[categoryName] = completedInCategory;
        }
    }
    
    return {
        labels: Object.keys(categories),
        values: Object.values(categories)
    };
}

function getXPProgressData() {
    const { startDate, endDate } = getDateRange();
    const labels = [];
    const data = [];

    const xpDaily = appState.xpDailyHistory || {};
    const days = listDays(startDate, endDate);
    const xpInRange = days.reduce((sum, d) => sum + (xpDaily[getDateString(d)] || 0), 0);
    const currentXP = (appState.userStats && typeof appState.userStats.xp === 'number') ? appState.userStats.xp : 0;
    const baseXP = Math.max(0, currentXP - xpInRange);

    let cumulative = baseXP;
    days.forEach(d => {
        const id = getDateString(d);
        const gained = xpDaily[id] || 0;
        cumulative += gained;
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(cumulative);
    });

    return { labels, data };
}

function getHabitStreakData() {
    const habits = Object.values(appState.badHabits);
    const labels = habits.map(h => h.name || 'Habit').slice(0, 5);
    const streakData = habits.map(h => {
        if (h.quitDate) {
            const daysSinceQuit = Math.floor((new Date() - new Date(h.quitDate)) / (1000 * 60 * 60 * 24));
            return daysSinceQuit;
        }
        return 0;
    }).slice(0, 5);
    const targetData = Array(labels.length).fill(30);
    
    return { labels, streakData, targetData };
}

function getWeeklyActivityData() {
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    const history = appState.tasksHistory || {};

    // Use last 7 days of history (real data only)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const id = getDateString(d);
        const completed = (history[id] && typeof history[id].completed === 'number') ? history[id].completed : 0;
        const dayIndex = d.getDay();
        const idx = dayIndex === 0 ? 6 : dayIndex - 1; // Monday=0
        weekData[idx] += completed;
    }

    return weekData;
}

// Update analytics statistics
function updateAnalyticsStats() {
    // Total XP
    const totalXP = document.getElementById('totalXPStat');
    if (totalXP) totalXP.textContent = appState.userStats.xp.toLocaleString();
    
    // Average mood
    const avgMood = document.getElementById('avgMoodStat');
    if (avgMood) {
        if (appState.moodHistory && appState.moodHistory.length > 0) {
            const moodMap = { '😊': 10, '😃': 9, '🙂': 7, '😐': 5, '😔': 3, '😢': 1 };
            const total = appState.moodHistory.reduce((sum, entry) => {
                return sum + (moodMap[entry.mood] || entry.intensity / 10 || 5);
            }, 0);
            const average = (total / appState.moodHistory.length).toFixed(1);
            avgMood.textContent = average + '/10';
        } else {
            avgMood.textContent = 'N/A';
        }
    }
    
    // Current streak
    const streakStat = document.getElementById('currentStreakStat');
    if (streakStat) streakStat.textContent = appState.userStats.streak + ' days';
    
    // Tasks completed
    const tasksStat = document.getElementById('tasksCompletedStat');
    if (tasksStat) tasksStat.textContent = appState.userStats.tasksCompleted.toLocaleString();
    
    // Goals progress
    const goalsStat = document.getElementById('goalsProgressStat');
    if (goalsStat) {
        const completed = appState.userGoals.filter(g => g.completed).length;
        const total = appState.userGoals.length;
        goalsStat.textContent = total > 0 ? `${completed}/${total}` : '0/0';
    }
    
    // Journal entries
    const journalStat = document.getElementById('journalEntriesStat');
    if (journalStat) journalStat.textContent = appState.userStats.journalEntries || appState.journalEntries.length;
}

// Load and calculate insights
function loadAnalyticsData() {
    updateAnalyticsStats();
    
    // Calculate best performing category
    let bestCategory = 'N/A';
    let maxCompleted = 0;
    
    for (const category in appState.userTasks) {
        const completed = appState.userTasks[category].filter(t => t.completed).length;
        if (completed > maxCompleted) {
            maxCompleted = completed;
            bestCategory = category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
    
    // Update insight cards
    const bestCategoryEl = document.getElementById('bestCategoryInsight');
    if (bestCategoryEl) bestCategoryEl.textContent = bestCategory;
    
    const avgCompletionEl = document.getElementById('avgCompletionInsight');
    if (avgCompletionEl) {
        let totalTasks = 0;
        let completedTasks = 0;
        for (const category in appState.userTasks) {
            appState.userTasks[category].forEach(task => {
                totalTasks++;
                if (task.completed) completedTasks++;
            });
        }
        const avgRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        avgCompletionEl.textContent = avgRate + '%';
    }
    
    const productivityEl = document.getElementById('productivityScoreInsight');
    if (productivityEl) {
        const score = Math.min(100, appState.userStats.consistency + appState.userStats.streak * 2);
        productivityEl.textContent = Math.round(score) + '%';
    }
}
