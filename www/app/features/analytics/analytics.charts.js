/**
 * @fileoverview Analytics Chart Management
 * @description Handles Chart.js chart creation and updates
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Chart Registry
// ============================================================================

const charts = {
    taskCompletion: null,
    habitProgress: null,
    moodTrend: null,
    moodDistribution: null
};

// ============================================================================
// Color Configuration
// ============================================================================

/**
 * Get chart colors based on theme
 * @returns {Object}
 */
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    
    return {
        primary: '#4361ee',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        info: '#06b6d4',
        text: isDark ? '#e0e0e0' : '#333',
        grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        background: isDark ? '#2b2d42' : '#fff',
        moods: {
            'very-sad': '#ef4444',
            'sad': '#f97316',
            'okay': '#eab308',
            'good': '#22c55e',
            'great': '#10b981'
        }
    };
}

/**
 * Get common chart options
 * @returns {Object}
 */
function getCommonOptions() {
    const colors = getChartColors();
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                labels: {
                    color: colors.text,
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            tooltip: {
                backgroundColor: colors.background,
                titleColor: colors.text,
                bodyColor: colors.text,
                borderColor: colors.grid,
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: { color: colors.text },
                grid: { color: colors.grid }
            },
            y: {
                ticks: { color: colors.text },
                grid: { color: colors.grid },
                beginAtZero: true
            }
        }
    };
}

// ============================================================================
// Chart Creation
// ============================================================================

/**
 * Create task completion chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 */
function createTaskCompletionChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const colors = getChartColors();
    const options = getCommonOptions();
    
    if (charts.taskCompletion) {
        charts.taskCompletion.destroy();
    }
    
    charts.taskCompletion = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Completed',
                    data: data.completed,
                    backgroundColor: colors.success,
                    borderRadius: 4
                },
                {
                    label: 'Total',
                    data: data.total,
                    backgroundColor: colors.primary,
                    borderRadius: 4
                }
            ]
        },
        options: {
            ...options,
            plugins: {
                ...options.plugins,
                title: {
                    display: true,
                    text: 'Task Completion',
                    color: colors.text,
                    font: { size: 16, weight: '600' }
                }
            }
        }
    });
}

/**
 * Create habit progress chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 */
function createHabitProgressChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const colors = getChartColors();
    const options = getCommonOptions();
    
    if (charts.habitProgress) {
        charts.habitProgress.destroy();
    }
    
    // Generate colors for each habit
    const backgroundColors = data.labels.map((_, i) => {
        const hue = (i * 137.508) % 360; // Golden angle for distinct colors
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    charts.habitProgress = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Current Streak',
                data: data.streaks,
                backgroundColor: backgroundColors,
                borderRadius: 4
            }]
        },
        options: {
            ...options,
            indexAxis: 'y',
            plugins: {
                ...options.plugins,
                title: {
                    display: true,
                    text: 'Habit Streaks',
                    color: colors.text,
                    font: { size: 16, weight: '600' }
                }
            }
        }
    });
}

/**
 * Create mood trend chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Chart data
 */
function createMoodTrendChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const colors = getChartColors();
    const options = getCommonOptions();
    
    if (charts.moodTrend) {
        charts.moodTrend.destroy();
    }
    
    charts.moodTrend = new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Mood',
                data: data.values,
                borderColor: colors.primary,
                backgroundColor: colors.primary + '33',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                spanGaps: true
            }]
        },
        options: {
            ...options,
            plugins: {
                ...options.plugins,
                title: {
                    display: true,
                    text: 'Mood Over Time',
                    color: colors.text,
                    font: { size: 16, weight: '600' }
                }
            },
            scales: {
                ...options.scales,
                y: {
                    ...options.scales.y,
                    min: 1,
                    max: 5,
                    ticks: {
                        ...options.scales.y.ticks,
                        callback: function(value) {
                            const labels = ['', 'Very Sad', 'Sad', 'Okay', 'Good', 'Great'];
                            return labels[value] || '';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create mood distribution chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - Distribution data
 */
function createMoodDistributionChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const colors = getChartColors();
    
    if (charts.moodDistribution) {
        charts.moodDistribution.destroy();
    }
    
    const labels = ['Very Sad', 'Sad', 'Okay', 'Good', 'Great'];
    const values = [data['very-sad'], data['sad'], data['okay'], data['good'], data['great']];
    
    charts.moodDistribution = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    colors.moods['very-sad'],
                    colors.moods['sad'],
                    colors.moods['okay'],
                    colors.moods['good'],
                    colors.moods['great']
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: colors.text,
                        padding: 16
                    }
                },
                title: {
                    display: true,
                    text: 'Mood Distribution',
                    color: colors.text,
                    font: { size: 16, weight: '600' }
                }
            }
        }
    });
}

// ============================================================================
// Chart Updates
// ============================================================================

/**
 * Update all charts with new data
 * @param {Object} data - All analytics data
 */
function updateAllCharts(data) {
    if (data.tasks) {
        createTaskCompletionChart('taskCompletionChart', data.tasks);
    }
    if (data.habits) {
        createHabitProgressChart('habitProgressChart', data.habits);
    }
    if (data.mood) {
        createMoodTrendChart('moodTrendChart', data.mood);
    }
    if (data.moodDistribution) {
        createMoodDistributionChart('moodDistributionChart', data.moodDistribution);
    }
}

/**
 * Destroy all charts
 */
function destroyAllCharts() {
    Object.keys(charts).forEach(key => {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    });
}

/**
 * Update chart theme (for dark/light mode toggle)
 */
function updateChartTheme() {
    // Re-render all charts with new colors
    // This requires re-fetching data or caching it
    console.log('[AnalyticsCharts] Theme update requested');
}

// ============================================================================
// Exports
// ============================================================================

const AnalyticsCharts = {
    charts,
    getChartColors,
    getCommonOptions,
    createTaskCompletionChart,
    createHabitProgressChart,
    createMoodTrendChart,
    createMoodDistributionChart,
    updateAllCharts,
    destroyAllCharts,
    updateChartTheme
};

window.AnalyticsCharts = AnalyticsCharts;
