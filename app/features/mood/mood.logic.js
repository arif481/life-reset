/**
 * @fileoverview Mood Business Logic
 * @description Pure functions for mood calculations and statistics
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Constants
// ============================================================================

const MOOD_VALUES = {
    'very-sad': 1,
    'sad': 2,
    'okay': 3,
    'good': 4,
    'great': 5
};

const MOOD_EMOJIS = {
    'very-sad': '😢',
    'sad': '😞',
    'okay': '😐',
    'good': '😊',
    'great': '😄'
};

const VALID_MOODS = Object.keys(MOOD_VALUES);

const MOOD_TRIGGERS = [
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'relationships', label: 'Relationships', icon: '💑' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'finances', label: 'Finances', icon: '💰' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'exercise', label: 'Exercise', icon: '🏃' },
    { id: 'food', label: 'Food', icon: '🍽️' }
];

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a mood value is valid
 * @param {string} mood - Mood value
 * @returns {boolean}
 */
function isValidMood(mood) {
    return VALID_MOODS.includes(mood);
}

/**
 * Validate and clamp intensity value
 * @param {number} intensity - Raw intensity value
 * @returns {number} Clamped value between 0-100
 */
function validateIntensity(intensity) {
    const num = parseInt(intensity, 10);
    if (isNaN(num)) return 50;
    return Math.max(0, Math.min(100, num));
}

/**
 * Validate mood entry data
 * @param {Object} data - Mood entry data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateMoodEntry(data) {
    const errors = [];
    
    if (!data.mood || !isValidMood(data.mood)) {
        errors.push('Please select a mood');
    }
    
    if (data.note && data.note.length > 1000) {
        errors.push('Note must be 1000 characters or less');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ============================================================================
// Calculations
// ============================================================================

/**
 * Get numeric value for a mood
 * @param {string} mood - Mood string
 * @returns {number} Value 1-5
 */
function getMoodValue(mood) {
    return MOOD_VALUES[mood] || 3;
}

/**
 * Get emoji for a mood
 * @param {string} mood - Mood string
 * @returns {string} Emoji
 */
function getMoodEmoji(mood) {
    return MOOD_EMOJIS[mood] || '😐';
}

/**
 * Get mood string from numeric value
 * @param {number} value - Numeric value 1-5
 * @returns {string} Mood string
 */
function getMoodFromValue(value) {
    const rounded = Math.round(Math.max(1, Math.min(5, value)));
    return Object.keys(MOOD_VALUES).find(k => MOOD_VALUES[k] === rounded) || 'okay';
}

/**
 * Calculate average mood from entries
 * @param {Array} entries - Mood entries
 * @returns {number} Average mood value (1-5)
 */
function calculateAverageMood(entries) {
    if (!entries || entries.length === 0) return 3;
    
    const total = entries.reduce((sum, entry) => {
        return sum + getMoodValue(entry.mood);
    }, 0);
    
    return total / entries.length;
}

/**
 * Find the best mood in a set of entries
 * @param {Array} entries - Mood entries
 * @returns {{ mood: string, value: number }}
 */
function findBestMood(entries) {
    if (!entries || entries.length === 0) {
        return { mood: 'okay', value: 3 };
    }
    
    let best = { mood: 'very-sad', value: 1 };
    
    entries.forEach(entry => {
        const value = getMoodValue(entry.mood);
        if (value > best.value) {
            best = { mood: entry.mood, value };
        }
    });
    
    return best;
}

/**
 * Calculate mood statistics from entries
 * @param {Array} entries - Mood entries
 * @returns {Object} Statistics object
 */
function calculateMoodStats(entries) {
    if (!entries || entries.length === 0) {
        return {
            average: null,
            averageEmoji: '😐',
            best: null,
            bestEmoji: '😐',
            count: 0,
            mostCommonTrigger: null,
            triggerCounts: {}
        };
    }
    
    // Calculate average
    const average = calculateAverageMood(entries);
    
    // Find best mood
    const best = findBestMood(entries);
    
    // Count triggers
    const triggerCounts = {};
    entries.forEach(entry => {
        if (entry.triggers && Array.isArray(entry.triggers)) {
            entry.triggers.forEach(trigger => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
            });
        }
    });
    
    // Find most common trigger
    let mostCommonTrigger = null;
    let maxCount = 0;
    Object.entries(triggerCounts).forEach(([trigger, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonTrigger = trigger;
        }
    });
    
    return {
        average,
        averageEmoji: getMoodEmoji(getMoodFromValue(average)),
        best: best.mood,
        bestEmoji: getMoodEmoji(best.mood),
        count: entries.length,
        mostCommonTrigger,
        triggerCounts
    };
}

/**
 * Get mood trend (improving, declining, stable)
 * @param {Array} entries - Mood entries sorted by date (newest first)
 * @returns {string} 'improving' | 'declining' | 'stable'
 */
function getMoodTrend(entries) {
    if (!entries || entries.length < 3) return 'stable';
    
    // Compare first half to second half
    const mid = Math.floor(entries.length / 2);
    const recentHalf = entries.slice(0, mid);
    const olderHalf = entries.slice(mid);
    
    const recentAvg = calculateAverageMood(recentHalf);
    const olderAvg = calculateAverageMood(olderHalf);
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
}

/**
 * Convert mood entry to chart data point
 * @param {Object} entry - Mood entry
 * @returns {Object} Chart data point
 */
function toChartDataPoint(entry) {
    const value = entry.intensity !== undefined 
        ? Math.max(0, Math.min(10, entry.intensity / 10))
        : getMoodValue(entry.mood) * 2;
    
    return {
        date: entry.date,
        value,
        mood: entry.mood,
        emoji: getMoodEmoji(entry.mood)
    };
}

// ============================================================================
// Exports
// ============================================================================

const MoodLogic = {
    // Constants
    MOOD_VALUES,
    MOOD_EMOJIS,
    VALID_MOODS,
    MOOD_TRIGGERS,
    
    // Validation
    isValidMood,
    validateIntensity,
    validateMoodEntry,
    
    // Calculations
    getMoodValue,
    getMoodEmoji,
    getMoodFromValue,
    calculateAverageMood,
    findBestMood,
    calculateMoodStats,
    getMoodTrend,
    toChartDataPoint
};

if (typeof window !== 'undefined') {
    window.MoodLogic = MoodLogic;
}
