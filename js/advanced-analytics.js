/**
 * @fileoverview Advanced Analytics Dashboard
 * @description Correlation analysis, predictive insights, reports
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Analytics Configuration
   ========================================================================== */

const INSIGHT_TYPES = {
    CORRELATION: 'correlation',
    PREDICTION: 'prediction',
    TREND: 'trend',
    ACHIEVEMENT: 'achievement',
    SUGGESTION: 'suggestion'
};

const CORRELATION_THRESHOLDS = {
    STRONG: 0.7,
    MODERATE: 0.4,
    WEAK: 0.2
};

/* ==========================================================================
   Data Collection
   ========================================================================== */

/**
 * Collect comprehensive analytics data
 * @param {number} daysBack - Number of days to analyze
 * @returns {Object} Collected data
 */
function collectAnalyticsData(daysBack = 30) {
    const data = {
        tasks: [],
        moods: [],
        journals: [],
        habits: [],
        daily: {}
    };

    const now = new Date();
    
    for (let i = 0; i < daysBack; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = getDateString(date);
        const dayOfWeek = date.getDay();
        
        // Task data
        const taskData = appState.tasksHistory?.[dateStr] || { completed: 0, total: 0 };
        const taskCompletion = taskData.total > 0 ? (taskData.completed / taskData.total) * 100 : 0;
        
        // Mood data
        const moodEntry = appState.moodHistory?.find(m => {
            const moodDate = m.date || (m.timestamp?.toDate ? getDateString(m.timestamp.toDate()) : null);
            return moodDate === dateStr;
        });
        const moodScore = moodEntry ? getMoodScore(moodEntry.mood) : null;
        
        // Journal data
        const journalEntry = appState.journalEntries?.find(j => {
            const jDate = j.date || (j.timestamp?.toDate ? getDateString(j.timestamp.toDate()) : null);
            return jDate === dateStr;
        });
        
        data.daily[dateStr] = {
            date: dateStr,
            dayOfWeek,
            dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
            taskCompletion,
            tasksCompleted: taskData.completed,
            tasksTotal: taskData.total,
            moodScore,
            moodLabel: moodEntry?.mood || null,
            hasJournal: !!journalEntry,
            journalLength: journalEntry?.content?.length || 0
        };
        
        if (taskData.total > 0) data.tasks.push({ date: dateStr, ...taskData, completion: taskCompletion });
        if (moodScore !== null) data.moods.push({ date: dateStr, score: moodScore, label: moodEntry.mood });
        if (journalEntry) data.journals.push({ date: dateStr, length: journalEntry.content?.length || 0 });
    }
    
    return data;
}

/**
 * Convert mood label to numeric score
 */
function getMoodScore(mood) {
    const scores = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };
    return scores[mood] || null;
}

/* ==========================================================================
   Correlation Analysis
   ========================================================================== */

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(xValues, yValues) {
    if (xValues.length !== yValues.length || xValues.length < 3) return 0;
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Analyze correlations between different metrics
 */
function analyzeCorrelations(data) {
    const correlations = [];
    const dailyData = Object.values(data.daily).filter(d => d.tasksTotal > 0);
    
    if (dailyData.length < 7) return correlations;
    
    // Task completion vs Mood
    const daysWithBoth = dailyData.filter(d => d.moodScore !== null);
    if (daysWithBoth.length >= 5) {
        const taskCompletions = daysWithBoth.map(d => d.taskCompletion);
        const moodScores = daysWithBoth.map(d => d.moodScore);
        const correlation = calculateCorrelation(taskCompletions, moodScores);
        
        if (Math.abs(correlation) >= CORRELATION_THRESHOLDS.WEAK) {
            correlations.push({
                type: INSIGHT_TYPES.CORRELATION,
                metrics: ['Task Completion', 'Mood'],
                value: correlation,
                strength: getCorrelationStrength(correlation),
                insight: generateCorrelationInsight('tasks', 'mood', correlation),
                icon: correlation > 0 ? '📈' : '📉'
            });
        }
    }
    
    // Journal writing vs Mood
    const daysWithJournalMood = dailyData.filter(d => d.moodScore !== null);
    if (daysWithJournalMood.length >= 5) {
        const hasJournal = daysWithJournalMood.map(d => d.hasJournal ? 1 : 0);
        const moodScores = daysWithJournalMood.map(d => d.moodScore);
        const correlation = calculateCorrelation(hasJournal, moodScores);
        
        if (Math.abs(correlation) >= CORRELATION_THRESHOLDS.WEAK) {
            correlations.push({
                type: INSIGHT_TYPES.CORRELATION,
                metrics: ['Journaling', 'Mood'],
                value: correlation,
                strength: getCorrelationStrength(correlation),
                insight: generateCorrelationInsight('journal', 'mood', correlation),
                icon: '📝'
            });
        }
    }
    
    // Day of week patterns
    const dayStats = analyzeDayOfWeekPatterns(dailyData);
    if (dayStats.bestDay) {
        correlations.push({
            type: INSIGHT_TYPES.PREDICTION,
            metrics: ['Day of Week', 'Productivity'],
            insight: `You're most productive on ${dayStats.bestDay.name}s (${Math.round(dayStats.bestDay.avg)}% avg completion)`,
            icon: '📅',
            data: dayStats
        });
    }
    
    return correlations;
}

/**
 * Get correlation strength label
 */
function getCorrelationStrength(value) {
    const abs = Math.abs(value);
    if (abs >= CORRELATION_THRESHOLDS.STRONG) return 'strong';
    if (abs >= CORRELATION_THRESHOLDS.MODERATE) return 'moderate';
    return 'weak';
}

/**
 * Generate human-readable correlation insight
 */
function generateCorrelationInsight(metric1, metric2, correlation) {
    const strength = getCorrelationStrength(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    
    const insights = {
        'tasks-mood-positive': {
            strong: 'Completing tasks strongly improves your mood! Keep up the productivity.',
            moderate: 'There\'s a clear link between task completion and better mood.',
            weak: 'Completing tasks tends to slightly improve your mood.'
        },
        'tasks-mood-negative': {
            strong: 'Overworking might be affecting your mood negatively.',
            moderate: 'High task loads may be impacting your wellbeing.',
            weak: 'Watch out for burnout - balance is key.'
        },
        'journal-mood-positive': {
            strong: 'Journaling significantly boosts your mood! Write more often.',
            moderate: 'Writing in your journal helps improve your emotional state.',
            weak: 'Journaling shows a slight positive effect on mood.'
        },
        'journal-mood-negative': {
            strong: 'You might be using journaling to process difficult emotions.',
            moderate: 'Your journal entries often coincide with challenging days.',
            weak: 'Consider balanced journaling - celebrate wins too!'
        }
    };
    
    const key = `${metric1}-${metric2}-${direction}`;
    return insights[key]?.[strength] || `${strength} ${direction} correlation detected between ${metric1} and ${metric2}`;
}

/**
 * Analyze patterns by day of week
 */
function analyzeDayOfWeekPatterns(dailyData) {
    const dayStats = {};
    
    for (let i = 0; i < 7; i++) {
        dayStats[i] = { total: 0, sum: 0 };
    }
    
    dailyData.forEach(d => {
        dayStats[d.dayOfWeek].total++;
        dayStats[d.dayOfWeek].sum += d.taskCompletion;
    });
    
    const averages = Object.entries(dayStats)
        .map(([day, stats]) => ({
            day: parseInt(day),
            name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            avg: stats.total > 0 ? stats.sum / stats.total : 0,
            count: stats.total
        }))
        .filter(d => d.count >= 2);
    
    if (averages.length === 0) return { bestDay: null, worstDay: null, averages: [] };
    
    const sorted = [...averages].sort((a, b) => b.avg - a.avg);
    
    return {
        bestDay: sorted[0],
        worstDay: sorted[sorted.length - 1],
        averages: sorted
    };
}

/* ==========================================================================
   Predictive Insights
   ========================================================================== */

/**
 * Generate predictive insights based on patterns
 */
function generatePredictiveInsights(data) {
    const insights = [];
    const dailyData = Object.values(data.daily);
    
    // Streak prediction
    const currentStreak = appState.userStats?.streak || 0;
    if (currentStreak >= 3) {
        const avgCompletion = dailyData.slice(0, 7).reduce((sum, d) => sum + d.taskCompletion, 0) / 7;
        if (avgCompletion >= 70) {
            insights.push({
                type: INSIGHT_TYPES.PREDICTION,
                icon: '🔥',
                title: 'Streak Prediction',
                insight: `Based on your momentum, you're likely to maintain your ${currentStreak}-day streak!`,
                confidence: Math.min(95, 60 + avgCompletion * 0.3)
            });
        } else {
            insights.push({
                type: INSIGHT_TYPES.SUGGESTION,
                icon: '⚠️',
                title: 'Streak Alert',
                insight: `Your completion rate has dropped to ${Math.round(avgCompletion)}%. Focus on key tasks to protect your streak!`,
                action: 'Focus on 3 priority tasks today'
            });
        }
    }
    
    // Mood trend prediction
    const recentMoods = data.moods.slice(0, 7);
    if (recentMoods.length >= 3) {
        const moodTrend = calculateTrend(recentMoods.map(m => m.score));
        if (moodTrend > 0.2) {
            insights.push({
                type: INSIGHT_TYPES.TREND,
                icon: '😊',
                title: 'Mood Improving',
                insight: 'Your mood has been trending upward! Whatever you\'re doing, keep it up.',
                trend: 'up'
            });
        } else if (moodTrend < -0.2) {
            insights.push({
                type: INSIGHT_TYPES.TREND,
                icon: '💙',
                title: 'Mood Check-in',
                insight: 'Your mood has been declining. Consider adding self-care activities to your routine.',
                trend: 'down',
                action: 'Try journaling or a short break'
            });
        }
    }
    
    // Productivity pattern
    const weekdayData = dailyData.filter(d => d.dayOfWeek >= 1 && d.dayOfWeek <= 5);
    const weekendData = dailyData.filter(d => d.dayOfWeek === 0 || d.dayOfWeek === 6);
    
    if (weekdayData.length >= 5 && weekendData.length >= 2) {
        const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.taskCompletion, 0) / weekdayData.length;
        const weekendAvg = weekendData.reduce((sum, d) => sum + d.taskCompletion, 0) / weekendData.length;
        
        if (weekdayAvg > weekendAvg + 20) {
            insights.push({
                type: INSIGHT_TYPES.PREDICTION,
                icon: '📊',
                title: 'Weekday Warrior',
                insight: `You're ${Math.round(weekdayAvg - weekendAvg)}% more productive on weekdays. Consider lighter weekend goals.`,
                data: { weekday: weekdayAvg, weekend: weekendAvg }
            });
        } else if (weekendAvg > weekdayAvg + 20) {
            insights.push({
                type: INSIGHT_TYPES.PREDICTION,
                icon: '🌅',
                title: 'Weekend Achiever',
                insight: `You excel on weekends! ${Math.round(weekendAvg)}% vs ${Math.round(weekdayAvg)}% on weekdays.`,
                data: { weekday: weekdayAvg, weekend: weekendAvg }
            });
        }
    }
    
    return insights;
}

/**
 * Calculate simple linear trend
 */
function calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (values[i] - yMean);
        denominator += (i - xMean) * (i - xMean);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
}

/* ==========================================================================
   Weekly/Monthly Reports
   ========================================================================== */

/**
 * Generate weekly report
 */
function generateWeeklyReport() {
    const data = collectAnalyticsData(7);
    const dailyData = Object.values(data.daily);
    
    const totalTasks = dailyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const avgCompletion = dailyData.reduce((sum, d) => sum + d.taskCompletion, 0) / 7;
    const moodsLogged = dailyData.filter(d => d.moodScore !== null).length;
    const journalsWritten = dailyData.filter(d => d.hasJournal).length;
    const avgMood = data.moods.length > 0 
        ? data.moods.reduce((sum, m) => sum + m.score, 0) / data.moods.length 
        : null;
    
    // Find best and worst days
    const sortedDays = [...dailyData].sort((a, b) => b.taskCompletion - a.taskCompletion);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];
    
    return {
        period: 'weekly',
        startDate: dailyData[dailyData.length - 1]?.date,
        endDate: dailyData[0]?.date,
        summary: {
            totalTasks,
            avgCompletion: Math.round(avgCompletion),
            moodsLogged,
            journalsWritten,
            avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
            activeDays: dailyData.filter(d => d.tasksTotal > 0).length
        },
        highlights: {
            bestDay: bestDay ? { date: bestDay.date, day: bestDay.dayName, completion: Math.round(bestDay.taskCompletion) } : null,
            worstDay: worstDay ? { date: worstDay.date, day: worstDay.dayName, completion: Math.round(worstDay.taskCompletion) } : null
        },
        insights: generatePredictiveInsights(data),
        correlations: analyzeCorrelations(data)
    };
}

/**
 * Generate monthly report
 */
function generateMonthlyReport() {
    const data = collectAnalyticsData(30);
    const dailyData = Object.values(data.daily);
    
    const totalTasks = dailyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const avgCompletion = dailyData.reduce((sum, d) => sum + d.taskCompletion, 0) / 30;
    const moodsLogged = dailyData.filter(d => d.moodScore !== null).length;
    const journalsWritten = dailyData.filter(d => d.hasJournal).length;
    
    // Weekly breakdown
    const weeks = [];
    for (let i = 0; i < 4; i++) {
        const weekData = dailyData.slice(i * 7, (i + 1) * 7);
        const weekAvg = weekData.reduce((sum, d) => sum + d.taskCompletion, 0) / 7;
        weeks.push({
            week: i + 1,
            avgCompletion: Math.round(weekAvg),
            tasksCompleted: weekData.reduce((sum, d) => sum + d.tasksCompleted, 0)
        });
    }
    
    // Trend analysis
    const firstHalf = dailyData.slice(15, 30);
    const secondHalf = dailyData.slice(0, 15);
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.taskCompletion, 0) / 15;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.taskCompletion, 0) / 15;
    const trend = secondHalfAvg - firstHalfAvg;
    
    return {
        period: 'monthly',
        startDate: dailyData[dailyData.length - 1]?.date,
        endDate: dailyData[0]?.date,
        summary: {
            totalTasks,
            avgCompletion: Math.round(avgCompletion),
            moodsLogged,
            journalsWritten,
            activeDays: dailyData.filter(d => d.tasksTotal > 0).length
        },
        weeklyBreakdown: weeks,
        trend: {
            direction: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
            change: Math.round(trend)
        },
        dayOfWeekAnalysis: analyzeDayOfWeekPatterns(dailyData),
        insights: generatePredictiveInsights(data),
        correlations: analyzeCorrelations(data)
    };
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

/**
 * Render advanced analytics dashboard
 */
function renderAdvancedAnalytics() {
    const container = document.getElementById('advancedAnalyticsContainer');
    if (!container) return;
    
    const weeklyReport = generateWeeklyReport();
    const correlations = weeklyReport.correlations;
    const insights = weeklyReport.insights;
    
    container.innerHTML = `
        <div class="advanced-analytics">
            <div class="analytics-header">
                <h2>📊 Advanced Insights</h2>
                <div class="report-buttons">
                    <button class="btn-secondary btn-sm" onclick="showWeeklyReportModal()">
                        📅 Weekly Report
                    </button>
                    <button class="btn-secondary btn-sm" onclick="showMonthlyReportModal()">
                        📆 Monthly Report
                    </button>
                </div>
            </div>
            
            <div class="insights-grid">
                ${insights.map(insight => `
                    <div class="insight-card ${insight.type}">
                        <div class="insight-icon">${insight.icon}</div>
                        <div class="insight-content">
                            <h4>${insight.title || 'Insight'}</h4>
                            <p>${insight.insight}</p>
                            ${insight.action ? `<span class="insight-action">💡 ${insight.action}</span>` : ''}
                            ${insight.confidence ? `<span class="confidence">Confidence: ${Math.round(insight.confidence)}%</span>` : ''}
                        </div>
                    </div>
                `).join('') || '<p class="empty-state">Not enough data for insights yet. Keep tracking!</p>'}
            </div>
            
            <div class="correlations-section">
                <h3>🔗 Discovered Patterns</h3>
                <div class="correlations-grid">
                    ${correlations.map(c => `
                        <div class="correlation-card ${c.strength}">
                            <div class="correlation-header">
                                <span class="icon">${c.icon}</span>
                                <span class="metrics">${c.metrics.join(' ↔ ')}</span>
                            </div>
                            <p>${c.insight}</p>
                            ${c.value !== undefined ? `
                                <div class="correlation-bar">
                                    <div class="bar-fill ${c.value > 0 ? 'positive' : 'negative'}" 
                                         style="width: ${Math.abs(c.value) * 100}%"></div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('') || '<p class="empty-state">Keep tracking to discover patterns!</p>'}
                </div>
            </div>
            
            <div class="quick-stats">
                <h3>📈 This Week</h3>
                <div class="quick-stats-grid">
                    <div class="quick-stat">
                        <span class="value">${weeklyReport.summary.totalTasks}</span>
                        <span class="label">Tasks Done</span>
                    </div>
                    <div class="quick-stat">
                        <span class="value">${weeklyReport.summary.avgCompletion}%</span>
                        <span class="label">Avg Completion</span>
                    </div>
                    <div class="quick-stat">
                        <span class="value">${weeklyReport.summary.moodsLogged}/7</span>
                        <span class="label">Moods Logged</span>
                    </div>
                    <div class="quick-stat">
                        <span class="value">${weeklyReport.summary.journalsWritten}</span>
                        <span class="label">Journal Entries</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Show weekly report modal
 */
function showWeeklyReportModal() {
    const report = generateWeeklyReport();
    
    const modal = document.createElement('div');
    modal.className = 'modal report-modal';
    modal.id = 'weeklyReportModal';
    modal.innerHTML = `
        <div class="modal-content report-content">
            <div class="modal-header">
                <h3>📅 Weekly Report</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="report-period">
                    ${report.startDate} - ${report.endDate}
                </div>
                
                <div class="report-summary">
                    <div class="summary-stat">
                        <span class="big-number">${report.summary.totalTasks}</span>
                        <span class="label">Tasks Completed</span>
                    </div>
                    <div class="summary-stat">
                        <span class="big-number">${report.summary.avgCompletion}%</span>
                        <span class="label">Average Completion</span>
                    </div>
                    <div class="summary-stat">
                        <span class="big-number">${report.summary.activeDays}/7</span>
                        <span class="label">Active Days</span>
                    </div>
                </div>
                
                <div class="report-highlights">
                    <h4>🌟 Highlights</h4>
                    ${report.highlights.bestDay ? `
                        <p>✅ Best day: <strong>${report.highlights.bestDay.day}</strong> (${report.highlights.bestDay.completion}%)</p>
                    ` : ''}
                    ${report.highlights.worstDay ? `
                        <p>📉 Room to improve: <strong>${report.highlights.worstDay.day}</strong> (${report.highlights.worstDay.completion}%)</p>
                    ` : ''}
                </div>
                
                <div class="report-insights">
                    <h4>💡 Insights</h4>
                    ${report.insights.map(i => `<p>${i.icon} ${i.insight}</p>`).join('') || '<p>Keep tracking for more insights!</p>'}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

/**
 * Show monthly report modal
 */
function showMonthlyReportModal() {
    const report = generateMonthlyReport();
    
    const modal = document.createElement('div');
    modal.className = 'modal report-modal';
    modal.id = 'monthlyReportModal';
    modal.innerHTML = `
        <div class="modal-content report-content">
            <div class="modal-header">
                <h3>📆 Monthly Report</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="report-period">
                    ${report.startDate} - ${report.endDate}
                </div>
                
                <div class="report-summary">
                    <div class="summary-stat">
                        <span class="big-number">${report.summary.totalTasks}</span>
                        <span class="label">Tasks Completed</span>
                    </div>
                    <div class="summary-stat trend-${report.trend.direction}">
                        <span class="big-number">${report.summary.avgCompletion}%</span>
                        <span class="label">Average Completion</span>
                        <span class="trend">${report.trend.direction === 'improving' ? '↑' : report.trend.direction === 'declining' ? '↓' : '→'} ${Math.abs(report.trend.change)}%</span>
                    </div>
                    <div class="summary-stat">
                        <span class="big-number">${report.summary.activeDays}/30</span>
                        <span class="label">Active Days</span>
                    </div>
                </div>
                
                <div class="weekly-breakdown">
                    <h4>📊 Weekly Breakdown</h4>
                    <div class="weeks-chart">
                        ${report.weeklyBreakdown.map(w => `
                            <div class="week-bar">
                                <div class="bar" style="height: ${w.avgCompletion}%"></div>
                                <span class="label">Week ${w.week}</span>
                                <span class="value">${w.avgCompletion}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="day-analysis">
                    <h4>📅 Best Days to Be Productive</h4>
                    ${report.dayOfWeekAnalysis.bestDay ? `
                        <p>🏆 <strong>${report.dayOfWeekAnalysis.bestDay.name}</strong>: ${Math.round(report.dayOfWeekAnalysis.bestDay.avg)}% avg</p>
                    ` : ''}
                    ${report.dayOfWeekAnalysis.worstDay ? `
                        <p>💤 <strong>${report.dayOfWeekAnalysis.worstDay.name}</strong>: ${Math.round(report.dayOfWeekAnalysis.worstDay.avg)}% avg</p>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.collectAnalyticsData = collectAnalyticsData;
window.analyzeCorrelations = analyzeCorrelations;
window.generatePredictiveInsights = generatePredictiveInsights;
window.generateWeeklyReport = generateWeeklyReport;
window.generateMonthlyReport = generateMonthlyReport;
window.renderAdvancedAnalytics = renderAdvancedAnalytics;
window.showWeeklyReportModal = showWeeklyReportModal;
window.showMonthlyReportModal = showMonthlyReportModal;
