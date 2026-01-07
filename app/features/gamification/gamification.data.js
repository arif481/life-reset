/**
 * @fileoverview Gamification Data Layer
 * @description Handles XP, levels, badges, and achievements persistence
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Constants
// ============================================================================

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;

const BADGE_DEFINITIONS = {
    // Task badges
    'first-task': {
        id: 'first-task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        condition: (stats) => stats.tasksCompleted >= 1
    },
    'task-master-10': {
        id: 'task-master-10',
        name: 'Task Starter',
        description: 'Complete 10 tasks',
        icon: '📋',
        condition: (stats) => stats.tasksCompleted >= 10
    },
    'task-master-50': {
        id: 'task-master-50',
        name: 'Task Master',
        description: 'Complete 50 tasks',
        icon: '🏆',
        condition: (stats) => stats.tasksCompleted >= 50
    },
    'task-master-100': {
        id: 'task-master-100',
        name: 'Task Legend',
        description: 'Complete 100 tasks',
        icon: '👑',
        condition: (stats) => stats.tasksCompleted >= 100
    },
    
    // Habit badges
    'habit-starter': {
        id: 'habit-starter',
        name: 'Habit Builder',
        description: 'Create your first habit',
        icon: '🌱',
        condition: (stats) => stats.habitsCreated >= 1
    },
    'streak-7': {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Achieve a 7-day streak',
        icon: '🔥',
        condition: (stats) => stats.longestStreak >= 7
    },
    'streak-30': {
        id: 'streak-30',
        name: 'Monthly Master',
        description: 'Achieve a 30-day streak',
        icon: '⚡',
        condition: (stats) => stats.longestStreak >= 30
    },
    
    // Journal badges
    'journal-starter': {
        id: 'journal-starter',
        name: 'Dear Diary',
        description: 'Write your first journal entry',
        icon: '📝',
        condition: (stats) => stats.journalEntries >= 1
    },
    'journal-master': {
        id: 'journal-master',
        name: 'Storyteller',
        description: 'Write 30 journal entries',
        icon: '📚',
        condition: (stats) => stats.journalEntries >= 30
    },
    
    // Mood badges
    'mood-tracker': {
        id: 'mood-tracker',
        name: 'Self-Aware',
        description: 'Log your mood 7 days in a row',
        icon: '🧠',
        condition: (stats) => stats.moodStreak >= 7
    },
    
    // Level badges
    'level-5': {
        id: 'level-5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        condition: (stats) => stats.level >= 5
    },
    'level-10': {
        id: 'level-10',
        name: 'Achiever',
        description: 'Reach level 10',
        icon: '🌟',
        condition: (stats) => stats.level >= 10
    },
    'level-25': {
        id: 'level-25',
        name: 'Expert',
        description: 'Reach level 25',
        icon: '💫',
        condition: (stats) => stats.level >= 25
    }
};

// ============================================================================
// Data Operations
// ============================================================================

/**
 * Get gamification stats
 * @returns {Promise<Object>}
 */
async function getGamificationStats() {
    const defaultStats = {
        xp: 0,
        level: 1,
        tasksCompleted: 0,
        habitsCreated: 0,
        habitsDone: 0,
        journalEntries: 0,
        moodStreak: 0,
        longestStreak: 0,
        badges: []
    };
    
    // Try Firebase first
    if (window.db && window.appState?.currentUser) {
        try {
            const doc = await window.db.collection('users').doc(window.appState.currentUser.uid).get();
            if (doc.exists && doc.data().gamification) {
                return { ...defaultStats, ...doc.data().gamification };
            }
        } catch (error) {
            console.error('[GamificationData] Firebase error:', error);
        }
    }
    
    // Fall back to localStorage
    const stored = localStorage.getItem('lifeResetGamification');
    if (stored) {
        try {
            return { ...defaultStats, ...JSON.parse(stored) };
        } catch (e) {
            console.error('[GamificationData] Parse error:', e);
        }
    }
    
    return defaultStats;
}

/**
 * Save gamification stats
 * @param {Object} stats - Stats to save
 * @returns {Promise<void>}
 */
async function saveGamificationStats(stats) {
    // Always save to localStorage
    localStorage.setItem('lifeResetGamification', JSON.stringify(stats));
    
    // Save to Firebase if logged in
    if (window.db && window.appState?.currentUser) {
        try {
            await window.db.collection('users').doc(window.appState.currentUser.uid).set({
                gamification: stats
            }, { merge: true });
        } catch (error) {
            console.error('[GamificationData] Firebase save error:', error);
        }
    }
}

/**
 * Add XP and handle level up
 * @param {number} amount - XP to add
 * @returns {Promise<Object>} Updated stats with levelUp flag
 */
async function addXP(amount) {
    const stats = await getGamificationStats();
    const previousLevel = stats.level;
    
    stats.xp += amount;
    
    // Calculate new level
    const newLevel = Math.floor(stats.xp / XP_PER_LEVEL) + 1;
    stats.level = Math.min(newLevel, MAX_LEVEL);
    
    const leveledUp = stats.level > previousLevel;
    
    await saveGamificationStats(stats);
    
    return {
        ...stats,
        leveledUp,
        previousLevel,
        xpGained: amount
    };
}

/**
 * Increment a stat counter
 * @param {string} statName - Stat to increment
 * @param {number} amount - Amount to add (default 1)
 * @returns {Promise<Object>}
 */
async function incrementStat(statName, amount = 1) {
    const stats = await getGamificationStats();
    
    if (typeof stats[statName] === 'number') {
        stats[statName] += amount;
    }
    
    await saveGamificationStats(stats);
    return stats;
}

/**
 * Update longest streak
 * @param {number} currentStreak - Current streak value
 * @returns {Promise<Object>}
 */
async function updateLongestStreak(currentStreak) {
    const stats = await getGamificationStats();
    
    if (currentStreak > stats.longestStreak) {
        stats.longestStreak = currentStreak;
        await saveGamificationStats(stats);
    }
    
    return stats;
}

// ============================================================================
// Badge Operations
// ============================================================================

/**
 * Get all available badges
 * @returns {Object}
 */
function getBadgeDefinitions() {
    return BADGE_DEFINITIONS;
}

/**
 * Check and unlock eligible badges
 * @returns {Promise<Array>} Newly unlocked badges
 */
async function checkAndUnlockBadges() {
    const stats = await getGamificationStats();
    const newBadges = [];
    
    Object.values(BADGE_DEFINITIONS).forEach(badge => {
        if (!stats.badges.includes(badge.id) && badge.condition(stats)) {
            stats.badges.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    if (newBadges.length > 0) {
        await saveGamificationStats(stats);
    }
    
    return newBadges;
}

/**
 * Get user's unlocked badges
 * @returns {Promise<Array>}
 */
async function getUnlockedBadges() {
    const stats = await getGamificationStats();
    return stats.badges.map(id => BADGE_DEFINITIONS[id]).filter(Boolean);
}

/**
 * Get badge progress
 * @returns {Promise<Array>}
 */
async function getBadgeProgress() {
    const stats = await getGamificationStats();
    
    return Object.values(BADGE_DEFINITIONS).map(badge => ({
        ...badge,
        unlocked: stats.badges.includes(badge.id),
        progress: calculateBadgeProgress(badge, stats)
    }));
}

/**
 * Calculate progress toward a badge
 * @param {Object} badge - Badge definition
 * @param {Object} stats - Current stats
 * @returns {number} Progress percentage (0-100)
 */
function calculateBadgeProgress(badge, stats) {
    // Extract target from badge ID
    const match = badge.id.match(/(\d+)$/);
    if (!match) return badge.condition(stats) ? 100 : 0;
    
    const target = parseInt(match[1], 10);
    
    if (badge.id.includes('task')) {
        return Math.min(100, Math.round((stats.tasksCompleted / target) * 100));
    }
    if (badge.id.includes('streak')) {
        return Math.min(100, Math.round((stats.longestStreak / target) * 100));
    }
    if (badge.id.includes('level')) {
        return Math.min(100, Math.round((stats.level / target) * 100));
    }
    if (badge.id.includes('journal')) {
        return Math.min(100, Math.round((stats.journalEntries / target) * 100));
    }
    
    return badge.condition(stats) ? 100 : 0;
}

// ============================================================================
// Exports
// ============================================================================

const GamificationData = {
    XP_PER_LEVEL,
    MAX_LEVEL,
    BADGE_DEFINITIONS,
    getGamificationStats,
    saveGamificationStats,
    addXP,
    incrementStat,
    updateLongestStreak,
    getBadgeDefinitions,
    checkAndUnlockBadges,
    getUnlockedBadges,
    getBadgeProgress,
    calculateBadgeProgress
};

if (typeof window !== 'undefined') {
    window.GamificationData = GamificationData;
}
