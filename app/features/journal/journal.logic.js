/**
 * @fileoverview Journal Business Logic
 * @description Pure functions for journal processing and sentiment analysis
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Sentiment Analysis
// ============================================================================

const POSITIVE_WORDS = [
    'happy', 'great', 'amazing', 'wonderful', 'excellent', 'good', 'love', 
    'awesome', 'fantastic', 'beautiful', 'grateful', 'thankful', 'blessed',
    'excited', 'joy', 'peaceful', 'calm', 'content', 'hopeful', 'inspired',
    'proud', 'accomplished', 'motivated', 'energized', 'relaxed'
];

const NEGATIVE_WORDS = [
    'sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 
    'disappointed', 'depressed', 'anxious', 'worried', 'stressed', 'upset',
    'lonely', 'hopeless', 'overwhelmed', 'exhausted', 'afraid', 'scared',
    'hurt', 'confused', 'lost', 'tired', 'miserable', 'annoyed'
];

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @returns {'positive' | 'negative' | 'neutral'}
 */
function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') return 'neutral';
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    POSITIVE_WORDS.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        positiveCount += (lowerText.match(regex) || []).length;
    });
    
    NEGATIVE_WORDS.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        negativeCount += (lowerText.match(regex) || []).length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

/**
 * Get sentiment score (-1 to 1)
 * @param {string} text - Text to analyze
 * @returns {number} Score from -1 (negative) to 1 (positive)
 */
function getSentimentScore(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    POSITIVE_WORDS.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        positiveCount += (lowerText.match(regex) || []).length;
    });
    
    NEGATIVE_WORDS.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        negativeCount += (lowerText.match(regex) || []).length;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
}

// ============================================================================
// Text Processing
// ============================================================================

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
function countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Extract summary from text
 * @param {string} text - Full text
 * @param {number} maxLength - Maximum summary length (default 200)
 * @returns {string} Summary text
 */
function extractSummary(text, maxLength = 200) {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    // Try to cut at a sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastPeriod > maxLength * 0.5) {
        return truncated.substring(0, lastPeriod + 1);
    }
    
    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

/**
 * Extract tags from text (words starting with #)
 * @param {string} text - Text to process
 * @returns {string[]} Array of tags
 */
function extractHashtags(text) {
    if (!text || typeof text !== 'string') return [];
    
    const matches = text.match(/#[\w]+/g) || [];
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
}

/**
 * Parse tags input (comma or space separated)
 * @param {string} input - Raw tag input
 * @returns {string[]} Array of cleaned tags
 */
function parseTags(input) {
    if (!input || typeof input !== 'string') return [];
    
    // Remove # prefix, split by comma/space, filter empty
    return input
        .split(/[,\s]+/)
        .map(tag => tag.replace(/^#/, '').trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .filter((tag, index, self) => self.indexOf(tag) === index); // Unique
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate journal entry
 * @param {Object} entry - Entry data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateJournalEntry(entry) {
    const errors = [];
    
    if (!entry.content || entry.content.trim().length === 0) {
        errors.push('Please write something');
    }
    
    if (entry.content && entry.content.length > 50000) {
        errors.push('Entry is too long (max 50,000 characters)');
    }
    
    if (entry.tags && entry.tags.length > 20) {
        errors.push('Too many tags (max 20)');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filter entries by date range
 * @param {Array} entries - Journal entries
 * @param {string} period - 'week' | 'month' | 'all'
 * @returns {Array} Filtered entries
 */
function filterByPeriod(entries, period) {
    if (!entries || period === 'all') return entries;
    
    const now = new Date();
    let cutoffDate;
    
    if (period === 'week') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
        return entries;
    }
    
    return entries.filter(entry => {
        const entryDate = entry.date ? new Date(entry.date) : 
            (entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(0));
        return entryDate >= cutoffDate;
    });
}

/**
 * Search entries by text
 * @param {Array} entries - Journal entries
 * @param {string} query - Search query
 * @returns {Array} Matching entries
 */
function searchEntries(entries, query) {
    if (!entries || !query || query.trim().length === 0) return entries;
    
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => {
        const content = (entry.content || '').toLowerCase();
        const tags = (entry.tags || []).join(' ').toLowerCase();
        
        return content.includes(lowerQuery) || tags.includes(lowerQuery);
    });
}

// ============================================================================
// Exports
// ============================================================================

export const JournalLogic = {
    // Sentiment
    analyzeSentiment,
    getSentimentScore,
    POSITIVE_WORDS,
    NEGATIVE_WORDS,
    
    // Text processing
    countWords,
    extractSummary,
    extractHashtags,
    parseTags,
    
    // Validation
    validateJournalEntry,
    
    // Filtering
    filterByPeriod,
    searchEntries
};

if (typeof window !== 'undefined') {
    window.JournalLogic = JournalLogic;
    window.analyzeSentiment = analyzeSentiment;
}
