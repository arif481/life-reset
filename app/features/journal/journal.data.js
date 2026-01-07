/**
 * @fileoverview Journal Data Layer
 * @description Handles Firebase/Firestore operations for journal entries
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Journal Entry Operations
// ============================================================================

/**
 * Save a new journal entry
 * @param {Object} entryData - Journal entry data
 * @returns {Promise<string>} Document ID
 */
async function saveJournalEntry(entryData) {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    const entry = {
        content: entryData.content,
        mood: entryData.mood || null,
        tags: entryData.tags || [],
        sentiment: entryData.sentiment || 'neutral',
        wordCount: entryData.content.trim().split(/\s+/).length,
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0]
    };
    
    const docRef = await window.db.collection('users').doc(window.appState.currentUser.uid)
        .collection('journal').add(entry);
    
    return docRef.id;
}

/**
 * Get a specific journal entry
 * @param {string} entryId - Entry document ID
 * @returns {Promise<Object|null>}
 */
async function getJournalEntry(entryId) {
    if (!window.db || !window.appState?.currentUser) {
        return null;
    }
    
    try {
        const doc = await window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('journal').doc(entryId).get();
        
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
    } catch (error) {
        console.error('[JournalData] Error loading entry:', error);
    }
    
    return null;
}

/**
 * Get journal entries with pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Max entries to return (default 50)
 * @param {Object} options.startAfter - Cursor for pagination
 * @returns {Promise<Array>}
 */
async function getJournalEntries(options = {}) {
    if (!window.db || !window.appState?.currentUser) {
        return [];
    }
    
    const { limit = 50, startAfter = null } = options;
    
    try {
        let query = window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(limit);
        
        if (startAfter) {
            query = query.startAfter(startAfter);
        }
        
        const snapshot = await query.get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });
        
        return entries;
    } catch (error) {
        console.error('[JournalData] Error loading entries:', error);
        return [];
    }
}

/**
 * Delete a journal entry
 * @param {string} entryId - Entry document ID
 * @returns {Promise<void>}
 */
async function deleteJournalEntry(entryId) {
    if (!window.db || !window.appState?.currentUser) {
        throw new Error('Not authenticated');
    }
    
    await window.db.collection('users').doc(window.appState.currentUser.uid)
        .collection('journal').doc(entryId).delete();
}

/**
 * Search journal entries by tags or content
 * @param {Object} options - Search options
 * @param {Array} options.tags - Tags to filter by
 * @param {string} options.sentiment - Sentiment to filter by
 * @returns {Promise<Array>}
 */
async function searchJournalEntries(options = {}) {
    if (!window.db || !window.appState?.currentUser) {
        return [];
    }
    
    try {
        let query = window.db.collection('users').doc(window.appState.currentUser.uid)
            .collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(100);
        
        if (options.sentiment) {
            query = query.where('sentiment', '==', options.sentiment);
        }
        
        const snapshot = await query.get();
        let entries = [];
        
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });
        
        // Filter by tags client-side (Firestore doesn't support array-contains-any + orderBy)
        if (options.tags && options.tags.length > 0) {
            entries = entries.filter(entry => {
                if (!entry.tags) return false;
                return options.tags.some(tag => entry.tags.includes(tag));
            });
        }
        
        return entries;
    } catch (error) {
        console.error('[JournalData] Error searching entries:', error);
        return [];
    }
}

// ============================================================================
// Exports
// ============================================================================

const JournalData = {
    saveJournalEntry,
    getJournalEntry,
    getJournalEntries,
    deleteJournalEntry,
    searchJournalEntries
};

if (typeof window !== 'undefined') {
    window.JournalData = JournalData;
}
