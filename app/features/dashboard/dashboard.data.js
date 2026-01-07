/**
 * @fileoverview Dashboard Data Layer
 * @description Data fetching and aggregation for dashboard
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Data Aggregation Functions
// ============================================================================

/**
 * Get today's task statistics
 * @returns {Object} Today's task stats
 */
function getTodayTaskStats() {
    const tasks = appState.userTasks || {};
    let total = 0;
    let completed = 0;
    
    for (const category in tasks) {
        const categoryTasks = tasks[category] || [];
        categoryTasks.forEach(task => {
            if (task) {
                total++;
                if (task.completed) completed++;
            }
        });
    }
    
    return {
        total,
        completed,
        remaining: total - completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

/**
 * Get today's mood entry if exists
 * @returns {Object|null} Today's mood data
 */
function getTodayMood() {
    const today = getDateString(new Date());
    const moodHistory = appState.moodHistory || [];
    
    return moodHistory.find(entry => entry && entry.date === today) || null;
}

/**
 * Get current streak information
 * @returns {Object} Streak data
 */
function getStreakData() {
    const streak = appState.userStats?.streak || 0;
    const bestStreak = appState.userStats?.bestStreak || streak;
    
    return {
        current: streak,
        best: bestStreak,
        isActive: streak > 0,
        bonusXP: streak * 5 // 5 XP per streak day
    };
}

/**
 * Get user level and XP progress
 * @returns {Object} Level data
 */
function getLevelData() {
    const stats = appState.userStats || {};
    const xp = stats.xp || 0;
    const level = stats.level || 1;
    const xpNeeded = stats.xpNeeded || 100;
    
    return {
        level,
        xp,
        xpNeeded,
        progress: Math.round((xp / xpNeeded) * 100),
        xpToNext: xpNeeded - xp
    };
}

/**
 * Get weekly activity summary
 * @returns {Object} Weekly stats
 */
function getWeeklyStats() {
    const history = appState.tasksHistory || {};
    const moodHistory = appState.moodHistory || [];
    
    let tasksCompleted = 0;
    let totalTasks = 0;
    let moodEntries = 0;
    let daysActive = 0;
    
    const weekDays = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        
        const dayData = history[dateStr];
        if (dayData) {
            tasksCompleted += dayData.completed || 0;
            totalTasks += dayData.total || 0;
            if (dayData.completed > 0) daysActive++;
        }
        
        const moodEntry = moodHistory.find(m => m && m.date === dateStr);
        if (moodEntry) moodEntries++;
        
        weekDays.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday: i === 0,
            tasksCompleted: dayData?.completed || 0,
            hasMood: !!moodEntry
        });
    }
    
    return {
        tasksCompleted,
        totalTasks,
        moodEntries,
        daysActive,
        weekDays,
        completionRate: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0
    };
}

/**
 * Get upcoming/incomplete tasks for today
 * @param {number} limit - Maximum number of tasks to return
 * @returns {Array} Array of pending tasks
 */
function getPendingTasks(limit = 5) {
    const tasks = appState.userTasks || {};
    const pending = [];
    
    const categoryOrder = ['morning', 'health', 'productivity', 'evening', 'custom'];
    const categoryIcons = {
        morning: '🌅',
        health: '❤️',
        productivity: '🚀',
        evening: '🌙',
        custom: '⭐'
    };
    
    for (const category of categoryOrder) {
        const categoryTasks = tasks[category] || [];
        categoryTasks.forEach(task => {
            if (task && !task.completed) {
                pending.push({
                    ...task,
                    category,
                    categoryIcon: categoryIcons[category] || '📋'
                });
            }
        });
    }
    
    return pending.slice(0, limit);
}

/**
 * Get recent activity feed
 * @param {number} limit - Maximum items
 * @returns {Array} Activity items
 */
function getRecentActivity(limit = 5) {
    const activities = [];
    
    // Add journal entries
    (appState.journalEntries || []).slice(0, 3).forEach(entry => {
        const timestamp = entry.timestamp?.seconds 
            ? entry.timestamp.seconds * 1000 
            : (entry.timestamp ? new Date(entry.timestamp).getTime() : null);
        
        if (timestamp) {
            activities.push({
                type: 'journal',
                icon: '📖',
                title: 'Journal Entry',
                description: entry.content 
                    ? entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : '')
                    : 'New entry',
                timestamp
            });
        }
    });
    
    // Add mood entries
    (appState.moodHistory || []).slice(0, 3).forEach(entry => {
        const timestamp = entry.timestamp?.seconds 
            ? entry.timestamp.seconds * 1000 
            : (entry.timestamp ? new Date(entry.timestamp).getTime() : null);
        
        if (timestamp) {
            const moodEmoji = {
                'very-sad': '😢',
                'sad': '😞',
                'okay': '😐',
                'good': '😊',
                'great': '😄'
            }[entry.mood] || '😐';
            
            activities.push({
                type: 'mood',
                icon: moodEmoji,
                title: 'Mood Logged',
                description: `Feeling ${entry.mood?.replace('-', ' ') || 'okay'}`,
                timestamp
            });
        }
    });
    
    // Sort by timestamp and limit
    return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
}

/**
 * Generate personalized insights
 * @returns {Array} Insight objects
 */
function generateDashboardInsights() {
    const insights = [];
    const taskStats = getTodayTaskStats();
    const weeklyStats = getWeeklyStats();
    const streak = getStreakData();
    const todayMood = getTodayMood();
    
    // Task completion insight
    if (taskStats.total > 0) {
        if (taskStats.percentage === 100) {
            insights.push({
                type: 'celebration',
                icon: '🎉',
                message: 'Amazing! You completed all tasks today!',
                priority: 1
            });
        } else if (taskStats.percentage >= 75) {
            insights.push({
                type: 'encouragement',
                icon: '💪',
                message: `Almost there! Just ${taskStats.remaining} task${taskStats.remaining > 1 ? 's' : ''} left.`,
                priority: 2
            });
        } else if (taskStats.percentage < 25 && new Date().getHours() >= 18) {
            insights.push({
                type: 'reminder',
                icon: '⏰',
                message: 'Evening check-in: You still have time to make progress today.',
                priority: 2
            });
        }
    }
    
    // Mood tracking insight
    if (!todayMood) {
        insights.push({
            type: 'suggestion',
            icon: '💭',
            message: "You haven't logged your mood today. How are you feeling?",
            action: { text: 'Log Mood', view: 'mood' },
            priority: 3
        });
    }
    
    // Streak insight
    if (streak.current >= 7) {
        insights.push({
            type: 'achievement',
            icon: '🔥',
            message: `${streak.current}-day streak! You're building great habits.`,
            priority: 1
        });
    } else if (streak.current === 0) {
        insights.push({
            type: 'motivation',
            icon: '🌱',
            message: "Start a new streak today! Every journey begins with a single step.",
            priority: 4
        });
    }
    
    // Weekly pattern insight
    if (weeklyStats.daysActive >= 5) {
        insights.push({
            type: 'praise',
            icon: '⭐',
            message: `Active ${weeklyStats.daysActive} days this week. Consistency is key!`,
            priority: 2
        });
    }
    
    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

// ============================================================================
// Exports
// ============================================================================

if (typeof window !== 'undefined') {
    window.DashboardData = {
        getTodayTaskStats,
        getTodayMood,
        getStreakData,
        getLevelData,
        getWeeklyStats,
        getPendingTasks,
        getRecentActivity,
        generateDashboardInsights
    };
}
