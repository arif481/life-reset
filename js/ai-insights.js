/**
 * @fileoverview AI-Powered Insights Module
 * @description Pattern recognition, smart recommendations, personalized insights
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Insight Types & Patterns
   ========================================================================== */

const AI_INSIGHT_TYPES = {
    PATTERN: 'pattern',
    RECOMMENDATION: 'recommendation',
    WARNING: 'warning',
    CELEBRATION: 'celebration',
    TIP: 'tip',
    PREDICTION: 'prediction'
};

const PATTERN_RULES = {
    // Productivity patterns
    productive_mornings: {
        check: (data) => {
            const morningTasks = data.taskCompletions.filter(t => {
                const hour = new Date(t.completedAt).getHours();
                return hour >= 6 && hour < 12;
            });
            return morningTasks.length / data.taskCompletions.length > 0.6;
        },
        insight: {
            type: AI_INSIGHT_TYPES.PATTERN,
            icon: '🌅',
            title: 'Morning Person Detected',
            message: 'You complete 60%+ of tasks before noon. Schedule important work in the morning!',
            action: 'Set your hardest tasks for morning hours'
        }
    },
    night_owl: {
        check: (data) => {
            const eveningTasks = data.taskCompletions.filter(t => {
                const hour = new Date(t.completedAt).getHours();
                return hour >= 18 || hour < 6;
            });
            return eveningTasks.length / data.taskCompletions.length > 0.5;
        },
        insight: {
            type: AI_INSIGHT_TYPES.PATTERN,
            icon: '🦉',
            title: 'Night Owl Pattern',
            message: 'You\'re most productive in the evening. Embrace your natural rhythm!',
            action: 'Protect your evening focus time'
        }
    },
    weekend_warrior: {
        check: (data) => {
            const weekendTasks = data.taskCompletions.filter(t => {
                const day = new Date(t.completedAt).getDay();
                return day === 0 || day === 6;
            });
            return weekendTasks.length / data.taskCompletions.length > 0.4;
        },
        insight: {
            type: AI_INSIGHT_TYPES.PATTERN,
            icon: '🌅',
            title: 'Weekend Warrior',
            message: 'You get a lot done on weekends! Balance rest with productivity.',
            action: 'Schedule lighter weekend loads sometimes'
        }
    },

    // Mood patterns
    mood_improves_with_tasks: {
        check: (data) => {
            const daysWithBoth = data.dailyStats.filter(d => d.moodScore && d.tasksCompleted > 0);
            if (daysWithBoth.length < 7) return false;
            
            const productiveDays = daysWithBoth.filter(d => d.taskCompletionRate > 0.7);
            const avgMoodProductive = productiveDays.reduce((sum, d) => sum + d.moodScore, 0) / productiveDays.length;
            const avgMoodAll = daysWithBoth.reduce((sum, d) => sum + d.moodScore, 0) / daysWithBoth.length;
            
            return avgMoodProductive > avgMoodAll + 0.5;
        },
        insight: {
            type: AI_INSIGHT_TYPES.PATTERN,
            icon: '😊',
            title: 'Productivity Boosts Mood',
            message: 'Your mood is significantly better on productive days. Keep the momentum!',
            action: 'Start with one easy task to build momentum'
        }
    },
    journaling_helps_mood: {
        check: (data) => {
            const journalDays = data.dailyStats.filter(d => d.journaled && d.moodScore);
            const nonJournalDays = data.dailyStats.filter(d => !d.journaled && d.moodScore);
            
            if (journalDays.length < 5 || nonJournalDays.length < 5) return false;
            
            const avgJournal = journalDays.reduce((sum, d) => sum + d.moodScore, 0) / journalDays.length;
            const avgNoJournal = nonJournalDays.reduce((sum, d) => sum + d.moodScore, 0) / nonJournalDays.length;
            
            return avgJournal > avgNoJournal + 0.3;
        },
        insight: {
            type: AI_INSIGHT_TYPES.PATTERN,
            icon: '📝',
            title: 'Journaling Boosts Mood',
            message: 'Days you journal show better mood scores. Writing helps you process emotions!',
            action: 'Try journaling for 5 minutes daily'
        }
    },

    // Streak patterns
    streak_at_risk: {
        check: (data) => {
            const streak = data.currentStreak;
            const lastActive = data.lastActiveDate;
            const hoursSinceLast = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60);
            
            return streak >= 3 && hoursSinceLast > 18 && data.todayTasksCompleted === 0;
        },
        insight: {
            type: AI_INSIGHT_TYPES.WARNING,
            icon: '⚠️',
            title: 'Streak at Risk!',
            message: `Your ${data => data.currentStreak}-day streak needs protection! Complete one task now.`,
            action: 'Complete any task to save your streak',
            urgent: true
        }
    },
    streak_milestone: {
        check: (data) => {
            const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
            return milestones.includes(data.currentStreak);
        },
        insight: {
            type: AI_INSIGHT_TYPES.CELEBRATION,
            icon: '🎉',
            title: 'Streak Milestone!',
            message: (data) => `Amazing! You've hit a ${data.currentStreak}-day streak! You're building lasting habits.`,
            action: 'Celebrate and keep going!'
        }
    },

    // Task patterns
    overcommitting: {
        check: (data) => {
            const recentDays = data.dailyStats.slice(0, 7);
            const avgCompletion = recentDays.reduce((sum, d) => sum + d.taskCompletionRate, 0) / recentDays.length;
            const avgTotal = recentDays.reduce((sum, d) => sum + d.totalTasks, 0) / recentDays.length;
            
            return avgCompletion < 0.5 && avgTotal > 8;
        },
        insight: {
            type: AI_INSIGHT_TYPES.RECOMMENDATION,
            icon: '📊',
            title: 'Simplify Your List',
            message: 'You\'re adding many tasks but completing few. Try focusing on 3-5 key tasks.',
            action: 'Reduce daily tasks to your top 5 priorities'
        }
    },
    consistent_performer: {
        check: (data) => {
            const recentDays = data.dailyStats.slice(0, 14);
            const goodDays = recentDays.filter(d => d.taskCompletionRate >= 0.8);
            return goodDays.length >= 12;
        },
        insight: {
            type: AI_INSIGHT_TYPES.CELEBRATION,
            icon: '⭐',
            title: 'Consistency Champion',
            message: 'You\'ve completed 80%+ of tasks for 12+ days. Outstanding discipline!',
            action: 'Consider adding a new challenge'
        }
    },

    // Category patterns
    neglected_category: {
        check: (data) => {
            const categoryStats = data.categoryStats;
            const neglected = Object.entries(categoryStats).find(([cat, stats]) => {
                return stats.total >= 5 && stats.completed / stats.total < 0.3;
            });
            return !!neglected;
        },
        insight: {
            type: AI_INSIGHT_TYPES.TIP,
            icon: '🎯',
            title: 'Category Needs Attention',
            message: (data) => {
                const categoryStats = data.categoryStats;
                const neglected = Object.entries(categoryStats).find(([cat, stats]) => 
                    stats.total >= 5 && stats.completed / stats.total < 0.3
                );
                return `Your "${neglected[0]}" tasks have low completion. Break them into smaller steps.`;
            },
            action: 'Review and simplify tasks in this category'
        }
    }
};

/* ==========================================================================
   Data Collection
   ========================================================================== */

function collectAIData(daysBack = 30) {
    const data = {
        taskCompletions: [],
        dailyStats: [],
        moodEntries: [],
        journalEntries: [],
        currentStreak: appState.userStats?.streak || 0,
        lastActiveDate: null,
        todayTasksCompleted: 0,
        categoryStats: {}
    };

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Collect task completions
    (appState.tasks || []).forEach(task => {
        if (task.completed && task.completedAt) {
            data.taskCompletions.push({
                id: task.id,
                completedAt: task.completedAt,
                category: task.category,
                priority: task.priority
            });

            // Category stats
            const cat = task.category || 'general';
            if (!data.categoryStats[cat]) {
                data.categoryStats[cat] = { total: 0, completed: 0 };
            }
            data.categoryStats[cat].completed++;
        }

        // Count all tasks for category stats
        const cat = task.category || 'general';
        if (!data.categoryStats[cat]) {
            data.categoryStats[cat] = { total: 0, completed: 0 };
        }
        data.categoryStats[cat].total++;
    });

    // Build daily stats
    for (let i = 0; i < daysBack; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const taskHistory = appState.tasksHistory?.[dateStr] || { completed: 0, total: 0 };
        const moodEntry = appState.moodHistory?.find(m => {
            const mDate = m.date || (m.timestamp?.toDate ? m.timestamp.toDate().toISOString().split('T')[0] : null);
            return mDate === dateStr;
        });
        const journalEntry = appState.journalEntries?.find(j => {
            const jDate = j.date || (j.timestamp?.toDate ? j.timestamp.toDate().toISOString().split('T')[0] : null);
            return jDate === dateStr;
        });

        const moodScores = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };

        data.dailyStats.push({
            date: dateStr,
            tasksCompleted: taskHistory.completed,
            totalTasks: taskHistory.total,
            taskCompletionRate: taskHistory.total > 0 ? taskHistory.completed / taskHistory.total : 0,
            moodScore: moodEntry ? moodScores[moodEntry.mood] || null : null,
            journaled: !!journalEntry
        });

        if (taskHistory.completed > 0 && !data.lastActiveDate) {
            data.lastActiveDate = dateStr;
        }

        if (dateStr === todayStr) {
            data.todayTasksCompleted = taskHistory.completed;
        }
    }

    return data;
}

/* ==========================================================================
   Insight Generation
   ========================================================================== */

function generateAIInsights() {
    const data = collectAIData(30);
    const insights = [];

    // Check each pattern rule
    Object.entries(PATTERN_RULES).forEach(([ruleId, rule]) => {
        try {
            if (rule.check(data)) {
                const insight = { ...rule.insight };
                
                // Handle dynamic messages
                if (typeof insight.message === 'function') {
                    insight.message = insight.message(data);
                }

                insights.push({
                    id: ruleId,
                    ...insight,
                    generatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error(`[AI] Error checking rule ${ruleId}:`, error);
        }
    });

    // Add smart recommendations based on data
    insights.push(...generateSmartRecommendations(data));

    // Sort by importance
    const typeOrder = {
        [AI_INSIGHT_TYPES.WARNING]: 0,
        [AI_INSIGHT_TYPES.CELEBRATION]: 1,
        [AI_INSIGHT_TYPES.PATTERN]: 2,
        [AI_INSIGHT_TYPES.RECOMMENDATION]: 3,
        [AI_INSIGHT_TYPES.PREDICTION]: 4,
        [AI_INSIGHT_TYPES.TIP]: 5
    };

    insights.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    });

    return insights.slice(0, 8); // Return top 8 insights
}

function generateSmartRecommendations(data) {
    const recommendations = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based recommendations
    if (hour >= 6 && hour < 10 && data.todayTasksCompleted === 0) {
        recommendations.push({
            id: 'morning_start',
            type: AI_INSIGHT_TYPES.TIP,
            icon: '☀️',
            title: 'Good Morning!',
            message: 'Start your day with a small win. Complete your first task now!',
            action: 'Check your task list'
        });
    }

    if (hour >= 20 && hour < 23) {
        const todayMood = data.dailyStats[0]?.moodScore;
        if (!todayMood) {
            recommendations.push({
                id: 'evening_mood',
                type: AI_INSIGHT_TYPES.RECOMMENDATION,
                icon: '🌙',
                title: 'Evening Reflection',
                message: 'Take a moment to log how today went. It helps track your progress!',
                action: 'Log your mood'
            });
        }
    }

    // Trend-based recommendations
    const recentMoods = data.dailyStats.slice(0, 7).filter(d => d.moodScore);
    if (recentMoods.length >= 3) {
        const avgMood = recentMoods.reduce((sum, d) => sum + d.moodScore, 0) / recentMoods.length;
        
        if (avgMood < 2.5) {
            recommendations.push({
                id: 'low_mood_support',
                type: AI_INSIGHT_TYPES.TIP,
                icon: '💙',
                title: 'Self-Care Reminder',
                message: 'Your mood has been lower lately. Consider adding self-care activities.',
                action: 'Try a mindfulness exercise or reach out to someone'
            });
        }

        if (avgMood >= 4) {
            recommendations.push({
                id: 'high_mood_leverage',
                type: AI_INSIGHT_TYPES.TIP,
                icon: '✨',
                title: 'Ride the Wave',
                message: 'You\'ve been feeling great! This is a perfect time to tackle challenging goals.',
                action: 'Set an ambitious new goal'
            });
        }
    }

    // Completion rate recommendations
    const weeklyAvg = data.dailyStats.slice(0, 7).reduce((sum, d) => sum + d.taskCompletionRate, 0) / 7;
    if (weeklyAvg < 0.4) {
        recommendations.push({
            id: 'low_completion',
            type: AI_INSIGHT_TYPES.RECOMMENDATION,
            icon: '🎯',
            title: 'Focus on Less',
            message: `Your completion rate is ${Math.round(weeklyAvg * 100)}%. Try the "Rule of 3" - focus on just 3 important tasks daily.`,
            action: 'Prioritize your top 3 tasks for tomorrow'
        });
    }

    return recommendations;
}

/* ==========================================================================
   Personalized Tips
   ========================================================================== */

const DAILY_TIPS = [
    { icon: '🎯', tip: 'Start with your hardest task when your energy is highest.' },
    { icon: '⏰', tip: 'Use the 2-minute rule: if it takes less than 2 minutes, do it now.' },
    { icon: '📱', tip: 'Put your phone in another room during focus time.' },
    { icon: '🧠', tip: 'Take a 5-minute break every 25 minutes of focused work.' },
    { icon: '📝', tip: 'Writing down your goals makes you 42% more likely to achieve them.' },
    { icon: '🌅', tip: 'Morning routines set the tone for your entire day.' },
    { icon: '💪', tip: 'Exercise boosts mood and cognitive function for hours afterward.' },
    { icon: '😴', tip: 'Quality sleep is the foundation of productivity and well-being.' },
    { icon: '🙏', tip: 'Practicing gratitude daily improves mood and resilience.' },
    { icon: '🎉', tip: 'Celebrate small wins - they compound into big achievements.' },
    { icon: '📊', tip: 'What gets measured gets managed. Track your progress!' },
    { icon: '🔄', tip: 'Habits are easier to maintain than to build. Protect your streaks!' },
    { icon: '🌳', tip: 'Time in nature reduces stress and improves focus.' },
    { icon: '💧', tip: 'Staying hydrated improves energy and concentration.' },
    { icon: '🤝', tip: 'Accountability partners increase success rates by 65%.' }
];

function getDailyTip() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % DAILY_TIPS.length;
    return DAILY_TIPS[tipIndex];
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderAIInsights() {
    const container = document.getElementById('aiInsightsContainer');
    if (!container) return;

    const insights = generateAIInsights();
    const dailyTip = getDailyTip();

    container.innerHTML = `
        <div class="ai-insights-section">
            <div class="insights-header">
                <h2>🧠 AI Insights</h2>
                <span class="ai-badge">Personalized</span>
            </div>

            <div class="daily-tip-card">
                <span class="tip-icon">${dailyTip.icon}</span>
                <div class="tip-content">
                    <span class="tip-label">💡 Tip of the Day</span>
                    <p>${dailyTip.tip}</p>
                </div>
            </div>

            ${insights.length > 0 ? `
                <div class="insights-list">
                    ${insights.map(insight => `
                        <div class="insight-card ${insight.type} ${insight.urgent ? 'urgent' : ''}">
                            <div class="insight-icon">${insight.icon}</div>
                            <div class="insight-content">
                                <h4>${insight.title}</h4>
                                <p>${insight.message}</p>
                                ${insight.action ? `
                                    <div class="insight-action">
                                        <span>💡 ${insight.action}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-insights">
                    <p>Keep tracking to unlock personalized insights! 📊</p>
                </div>
            `}

            <div class="insights-footer">
                <button class="btn-secondary btn-sm" onclick="refreshAIInsights()">
                    🔄 Refresh Insights
                </button>
            </div>
        </div>
    `;
}

function refreshAIInsights() {
    renderAIInsights();
    if (typeof showToast === 'function') {
        showToast('Insights refreshed! 🧠');
    }
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.generateAIInsights = generateAIInsights;
window.generateSmartRecommendations = generateSmartRecommendations;
window.getDailyTip = getDailyTip;
window.renderAIInsights = renderAIInsights;
window.refreshAIInsights = refreshAIInsights;
window.collectAIData = collectAIData;
