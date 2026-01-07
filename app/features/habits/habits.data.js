/**
 * @module HabitsData
 * @description Data layer for habit breaking and tracking
 * @version 2.0.0
 */

window.HabitsData = (function() {
    'use strict';

    /* ============================================================================
       Bad Habit Definitions
       ============================================================================ */

    const BAD_HABITS = {
        'smoking': {
            id: 'smoking',
            icon: '🚬',
            name: 'Smoking',
            color: '#ef4444',
            healthCategories: {
                lungs: { label: 'Lung Function', icon: '🫁', maxDays: 90 },
                heart: { label: 'Heart Health', icon: '❤️', maxDays: 60 },
                skin: { label: 'Skin Quality', icon: '✨', maxDays: 30 }
            },
            benefits: [
                { days: 1, text: 'Heart rate begins to drop' },
                { days: 3, text: 'Nicotine leaves your body' },
                { days: 14, text: 'Circulation improves' },
                { days: 30, text: 'Lung function increases' },
                { days: 90, text: 'Risk of heart disease drops' }
            ],
            defaultCost: 10
        },
        'drinking': {
            id: 'drinking',
            icon: '🍺',
            name: 'Excessive Drinking',
            color: '#f59e0b',
            healthCategories: {
                liver: { label: 'Liver Function', icon: '🫘', maxDays: 120 },
                brain: { label: 'Brain Health', icon: '🧠', maxDays: 60 },
                sleep: { label: 'Sleep Quality', icon: '😴', maxDays: 14 }
            },
            benefits: [
                { days: 1, text: 'Blood sugar stabilizes' },
                { days: 7, text: 'Sleep quality improves' },
                { days: 14, text: 'Skin becomes clearer' },
                { days: 30, text: 'Liver begins healing' },
                { days: 90, text: 'Mental clarity restored' }
            ],
            defaultCost: 15
        },
        'junk-food': {
            id: 'junk-food',
            icon: '🍔',
            name: 'Junk Food',
            color: '#10b981',
            healthCategories: {
                weight: { label: 'Weight Management', icon: '⚖️', maxDays: 30 },
                energy: { label: 'Energy Levels', icon: '⚡', maxDays: 21 },
                digestion: { label: 'Digestion', icon: '🧬', maxDays: 30 }
            },
            benefits: [
                { days: 3, text: 'Cravings begin to decrease' },
                { days: 7, text: 'Energy levels stabilize' },
                { days: 14, text: 'Digestion improves' },
                { days: 21, text: 'Taste buds reset' },
                { days: 30, text: 'Sustainable weight loss' }
            ],
            defaultCost: 12
        },
        'scrolling': {
            id: 'scrolling',
            icon: '📱',
            name: 'Social Media',
            color: '#8b5cf6',
            healthCategories: {
                eyes: { label: 'Eye Health', icon: '👁️', maxDays: 30 },
                focus: { label: 'Mental Focus', icon: '🎯', maxDays: 21 },
                sleep: { label: 'Sleep Schedule', icon: '😴', maxDays: 14 }
            },
            benefits: [
                { days: 1, text: 'Less comparison anxiety' },
                { days: 7, text: 'Improved sleep' },
                { days: 14, text: 'Better focus' },
                { days: 21, text: 'More present in conversations' },
                { days: 30, text: 'Reduced anxiety overall' }
            ],
            defaultCost: 0
        },
        'caffeine': {
            id: 'caffeine',
            icon: '☕',
            name: 'Excessive Caffeine',
            color: '#6366f1',
            healthCategories: {
                sleep: { label: 'Sleep Quality', icon: '😴', maxDays: 14 },
                anxiety: { label: 'Anxiety Levels', icon: '🧘', maxDays: 21 },
                heart: { label: 'Heart Rate', icon: '❤️', maxDays: 7 }
            },
            benefits: [
                { days: 1, text: 'Withdrawal begins (hang in there!)' },
                { days: 3, text: 'Headaches subside' },
                { days: 7, text: 'Sleep improves' },
                { days: 14, text: 'Energy stabilizes' },
                { days: 21, text: 'Natural alertness restored' }
            ],
            defaultCost: 5
        },
        'sugar': {
            id: 'sugar',
            icon: '🍭',
            name: 'Excess Sugar',
            color: '#ec4899',
            healthCategories: {
                energy: { label: 'Energy Stability', icon: '⚡', maxDays: 14 },
                mood: { label: 'Mood Balance', icon: '😊', maxDays: 21 },
                skin: { label: 'Skin Clarity', icon: '✨', maxDays: 30 }
            },
            benefits: [
                { days: 3, text: 'Cravings peak then decline' },
                { days: 7, text: 'Energy crashes reduce' },
                { days: 14, text: 'Mood stabilizes' },
                { days: 21, text: 'Skin begins clearing' },
                { days: 30, text: 'Taste sensitivity improves' }
            ],
            defaultCost: 8
        }
    };

    /* ============================================================================
       Data Access Methods
       ============================================================================ */

    /**
     * Get all available bad habit definitions
     */
    function getHabitDefinitions() {
        return BAD_HABITS;
    }

    /**
     * Get a single habit definition
     */
    function getHabitDefinition(habitId) {
        return BAD_HABITS[habitId] || null;
    }

    /**
     * Get user's tracked habits
     */
    function getTrackedHabits() {
        return appState.badHabits || {};
    }

    /**
     * Get tracked habits with computed data
     */
    function getTrackedHabitsEnriched() {
        const tracked = getTrackedHabits();
        const enriched = [];

        Object.entries(tracked).forEach(([habitId, userData]) => {
            const definition = BAD_HABITS[habitId];
            if (!definition) return;

            const daysQuit = userData.quitDate 
                ? Math.floor((new Date() - new Date(userData.quitDate)) / (1000 * 60 * 60 * 24))
                : 0;

            const moneySaved = userData.status === 'quit' 
                ? daysQuit * (userData.costPerDay || definition.defaultCost)
                : 0;

            // Compute health improvements
            const healthProgress = {};
            Object.entries(definition.healthCategories).forEach(([key, cat]) => {
                healthProgress[key] = {
                    ...cat,
                    percent: Math.min(Math.round((daysQuit / cat.maxDays) * 100), 100)
                };
            });

            // Get unlocked benefits
            const unlockedBenefits = definition.benefits.filter(b => daysQuit >= b.days);
            const nextBenefit = definition.benefits.find(b => daysQuit < b.days);

            enriched.push({
                id: habitId,
                definition,
                userData,
                daysQuit,
                moneySaved,
                healthProgress,
                unlockedBenefits,
                nextBenefit,
                isQuit: userData.status === 'quit'
            });
        });

        return enriched;
    }

    /**
     * Calculate habit chain/streak data from task completions
     */
    function getHabitChainStats() {
        const today = new Date();
        let currentStreak = 0;
        let bestStreak = appState.streakData?.best || 0;
        let completedDays = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        const dayStatuses = [];

        // Analyze last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getDateString(date);
            const taskData = appState.userTasks?.[dateStr];

            let status = 'empty';
            let dayCompleted = 0;
            let dayTotal = 0;

            if (taskData) {
                dayTotal = Object.keys(taskData).length;
                dayCompleted = Object.values(taskData).filter(t => t.completed).length;
                totalTasks += dayTotal;
                completedTasks += dayCompleted;

                if (dayTotal > 0) {
                    const percent = (dayCompleted / dayTotal) * 100;
                    if (percent === 100) {
                        status = 'completed';
                        completedDays++;
                    } else if (percent > 0) {
                        status = 'partial';
                    } else {
                        status = 'missed';
                    }
                }
            }

            dayStatuses.push({
                date,
                dateStr,
                status,
                completed: dayCompleted,
                total: dayTotal,
                isToday: i === 0
            });

            // Calculate current streak (only count from today backwards while complete)
            if (i <= currentStreak && status === 'completed') {
                currentStreak++;
            }
        }

        bestStreak = Math.max(bestStreak, currentStreak);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            currentStreak,
            bestStreak,
            completedDays,
            completionRate,
            dayStatuses: dayStatuses.reverse() // oldest first
        };
    }

    /**
     * Generate insights based on habit data
     */
    function generateInsights() {
        const stats = getHabitChainStats();
        const trackedHabits = getTrackedHabitsEnriched();
        const insights = [];

        // Streak insights
        if (stats.currentStreak >= 21) {
            insights.push({ icon: '🏆', text: `Amazing ${stats.currentStreak}-day streak! You've formed a habit!` });
        } else if (stats.currentStreak >= 7) {
            insights.push({ icon: '🔥', text: `${stats.currentStreak}-day streak! Keep the momentum!` });
        } else if (stats.currentStreak >= 3) {
            insights.push({ icon: '💪', text: `${stats.currentStreak} days in a row! Building consistency!` });
        }

        // Completion rate insights
        if (stats.completionRate >= 90) {
            insights.push({ icon: '⭐', text: 'Outstanding! Over 90% completion rate this month.' });
        } else if (stats.completionRate >= 70) {
            insights.push({ icon: '✨', text: `${stats.completionRate}% completion - great consistency!` });
        }

        // Bad habit insights
        trackedHabits.forEach(habit => {
            if (habit.isQuit && habit.daysQuit >= 7) {
                insights.push({ 
                    icon: '🎉', 
                    text: `${habit.daysQuit} days without ${habit.definition.name.toLowerCase()}!` 
                });
            }
            if (habit.moneySaved >= 50) {
                insights.push({ 
                    icon: '💰', 
                    text: `$${habit.moneySaved.toFixed(0)} saved by quitting ${habit.definition.name.toLowerCase()}!` 
                });
            }
        });

        // Best day insight
        const bestDay = stats.dayStatuses.reduce((best, day) => 
            day.completed > best.completed ? day : best, { completed: 0 });
        
        if (bestDay.completed >= 5) {
            insights.push({ icon: '🎯', text: `Best day: ${bestDay.completed} tasks completed!` });
        }

        // Fallback
        if (insights.length === 0) {
            insights.push({ icon: '🚀', text: 'Complete tasks to earn insights and track your growth!' });
        }

        return insights.slice(0, 5); // Max 5 insights
    }

    /* ============================================================================
       Data Mutation Methods
       ============================================================================ */

    /**
     * Start tracking a bad habit
     */
    function addTrackedHabit(habitId, costPerDay, reason = '') {
        if (!BAD_HABITS[habitId]) return false;

        if (!appState.badHabits) appState.badHabits = {};

        appState.badHabits[habitId] = {
            status: 'tracking',
            costPerDay: costPerDay || BAD_HABITS[habitId].defaultCost,
            reason: reason,
            startDate: new Date().toISOString(),
            quitDate: null
        };

        saveHabitsToFirebase();
        return true;
    }

    /**
     * Mark a habit as quit (start the counter)
     */
    function markHabitQuit(habitId) {
        if (!appState.badHabits?.[habitId]) return false;

        appState.badHabits[habitId].status = 'quit';
        appState.badHabits[habitId].quitDate = new Date().toISOString();

        saveHabitsToFirebase();
        return true;
    }

    /**
     * Record a relapse (reset the counter)
     */
    function recordRelapse(habitId) {
        if (!appState.badHabits?.[habitId]) return false;

        appState.badHabits[habitId].status = 'tracking';
        appState.badHabits[habitId].quitDate = null;

        saveHabitsToFirebase();
        return true;
    }

    /**
     * Remove a habit from tracking
     */
    function removeTrackedHabit(habitId) {
        if (!appState.badHabits?.[habitId]) return false;

        delete appState.badHabits[habitId];
        saveHabitsToFirebase();
        return true;
    }

    /**
     * Persist habits to Firebase
     */
    async function saveHabitsToFirebase() {
        if (!appState.currentUser || !db) return;

        try {
            window.isLocalUpdate = true;
            await db.collection('users').doc(appState.currentUser.uid).update({
                badHabits: appState.badHabits
            }, { merge: true });
            setTimeout(() => { window.isLocalUpdate = false; }, 100);
        } catch (error) {
            console.error('[HabitsData] Save error:', error);
            window.isLocalUpdate = false;
        }
    }

    /* ============================================================================
       Utility Functions
       ============================================================================ */

    function getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    /* ============================================================================
       Public API
       ============================================================================ */

    return {
        getHabitDefinitions,
        getHabitDefinition,
        getTrackedHabits,
        getTrackedHabitsEnriched,
        getHabitChainStats,
        generateInsights,
        addTrackedHabit,
        markHabitQuit,
        recordRelapse,
        removeTrackedHabit
    };

})();
