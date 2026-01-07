/**
 * @fileoverview Analytics Event Handlers
 * @description Orchestrates analytics data loading and chart rendering
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let currentPeriod = 'week';
let analyticsData = {};

// ============================================================================
// Main Load Function
// ============================================================================

/**
 * Load all analytics data and render charts
 * @param {string} period - Time period ('week' | 'month' | 'year')
 */
async function loadAnalytics(period = 'week') {
    currentPeriod = period;
    
    if (!window.appState?.currentUser) {
        console.log('[AnalyticsEvents] User not logged in');
        return;
    }
    
    console.log('[AnalyticsEvents] Loading analytics for period:', period);
    
    try {
        // Show loading states
        ['taskCompletionChart', 'habitProgressChart', 'moodTrendChart', 'moodDistributionChart'].forEach(id => {
            if (window.AnalyticsUI) {
                window.AnalyticsUI.showChartLoading(id);
            }
        });
        
        // Load all data in parallel
        const dataPromises = {};
        
        if (window.AnalyticsData) {
            dataPromises.tasks = window.AnalyticsData.getTaskCompletionData(period);
            dataPromises.taskStats = window.AnalyticsData.getTaskStats();
            dataPromises.habits = window.AnalyticsData.getHabitData(period);
            dataPromises.mood = window.AnalyticsData.getMoodData(period);
            dataPromises.moodDistribution = window.AnalyticsData.getMoodDistribution(period);
            dataPromises.journalStats = window.AnalyticsData.getJournalStats(period);
        }
        
        // Wait for all data
        const results = await Promise.all(
            Object.entries(dataPromises).map(async ([key, promise]) => {
                try {
                    const result = await promise;
                    return [key, result];
                } catch (error) {
                    console.error(`[AnalyticsEvents] Error loading ${key}:`, error);
                    return [key, null];
                }
            })
        );
        
        // Build analytics data object
        analyticsData = {};
        results.forEach(([key, value]) => {
            if (value) analyticsData[key] = value;
        });
        
        // Render charts
        if (window.AnalyticsCharts) {
            window.AnalyticsCharts.updateAllCharts(analyticsData);
        }
        
        // Render stats cards
        if (window.AnalyticsUI && analyticsData.taskStats) {
            const stats = {
                tasksCompleted: analyticsData.taskStats.completed || 0,
                totalStreaks: analyticsData.habits ? 
                    analyticsData.habits.streaks.reduce((a, b) => a + b, 0) : 0,
                avgMood: calculateAverageMood(analyticsData.mood),
                journalCount: analyticsData.journalStats?.count || 0
            };
            
            window.AnalyticsUI.renderStatsCards('analyticsStatsContainer', stats);
        }
        
        // Generate and render insights
        if (window.AnalyticsUI) {
            const insights = window.AnalyticsUI.generateInsights(analyticsData);
            window.AnalyticsUI.renderInsights('analyticsInsightsContainer', insights);
        }
        
        // Hide loading states
        ['taskCompletionChart', 'habitProgressChart', 'moodTrendChart', 'moodDistributionChart'].forEach(id => {
            if (window.AnalyticsUI) {
                window.AnalyticsUI.hideChartLoading(id);
            }
        });
        
        console.log('[AnalyticsEvents] Analytics loaded successfully');
        
    } catch (error) {
        console.error('[AnalyticsEvents] Error loading analytics:', error);
        if (typeof showToast === 'function') {
            showToast('Error loading analytics', 'error');
        }
    }
}

/**
 * Calculate average mood from mood data
 * @param {Object} moodData - Mood data with values array
 * @returns {number}
 */
function calculateAverageMood(moodData) {
    if (!moodData || !moodData.values) return 0;
    
    const validValues = moodData.values.filter(v => v !== null);
    if (validValues.length === 0) return 0;
    
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle period change
 * @param {string} period - New period
 */
function handlePeriodChange(period) {
    loadAnalytics(period);
}

/**
 * Refresh analytics
 */
function refreshAnalytics() {
    loadAnalytics(currentPeriod);
}

/**
 * Export analytics data as CSV
 */
function exportAnalyticsCSV() {
    if (!analyticsData.tasks || !analyticsData.mood) {
        if (typeof showToast === 'function') {
            showToast('No data to export', 'warning');
        }
        return;
    }
    
    const rows = [
        ['Date', 'Tasks Completed', 'Tasks Total', 'Mood']
    ];
    
    const labels = analyticsData.tasks.labels;
    for (let i = 0; i < labels.length; i++) {
        rows.push([
            labels[i],
            analyticsData.tasks.completed[i] || 0,
            analyticsData.tasks.total[i] || 0,
            analyticsData.mood.values[i] || ''
        ]);
    }
    
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-reset-analytics-${currentPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        showToast('Analytics exported!', 'success');
    }
}

// ============================================================================
// Legacy Support
// ============================================================================

/**
 * Legacy loadMoodChart function
 */
async function loadMoodChart() {
    const moodData = window.AnalyticsData ? 
        await window.AnalyticsData.getMoodData(currentPeriod) : 
        { labels: [], values: [] };
    
    if (window.AnalyticsCharts) {
        window.AnalyticsCharts.createMoodTrendChart('moodTrendChart', moodData);
    }
}

/**
 * Legacy loadTaskChart function
 */
async function loadTaskChart() {
    const taskData = window.AnalyticsData ? 
        await window.AnalyticsData.getTaskCompletionData(currentPeriod) : 
        { labels: [], completed: [], total: [] };
    
    if (window.AnalyticsCharts) {
        window.AnalyticsCharts.createTaskCompletionChart('taskCompletionChart', taskData);
    }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize analytics
 */
function initAnalytics() {
    console.log('[AnalyticsEvents] Initializing analytics');
    
    // Set up period selector
    if (window.AnalyticsUI) {
        window.AnalyticsUI.renderPeriodSelector('analyticsPeriodSelector', currentPeriod, handlePeriodChange);
    }
    
    // Load initial data
    loadAnalytics(currentPeriod);
}

// ============================================================================
// Exports
// ============================================================================

export const AnalyticsEvents = {
    loadAnalytics,
    handlePeriodChange,
    refreshAnalytics,
    exportAnalyticsCSV,
    loadMoodChart,
    loadTaskChart,
    initAnalytics,
    getCurrentPeriod: () => currentPeriod,
    getAnalyticsData: () => analyticsData
};

if (typeof window !== 'undefined') {
    window.AnalyticsEvents = AnalyticsEvents;
    // Legacy support
    window.loadAnalytics = loadAnalytics;
    window.refreshAnalytics = refreshAnalytics;
    window.exportAnalyticsCSV = exportAnalyticsCSV;
    window.loadMoodChart = loadMoodChart;
    window.loadTaskChart = loadTaskChart;
}
