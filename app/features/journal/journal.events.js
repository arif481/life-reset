/**
 * @fileoverview Journal Event Handlers
 * @description Wires event listeners for journal feature
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let journalTags = [];
let selectedJournalMood = null;
let currentEntries = [];

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle journal mood selection
 * @param {string} mood - Selected mood
 * @param {Event} event - Click event
 */
function selectJournalMood(mood, event) {
    selectedJournalMood = mood;
    
    document.querySelectorAll('.journal-container .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (event && event.target) {
        const btn = event.target.closest('.mood-btn');
        if (btn) btn.classList.add('selected');
    }
}

/**
 * Handle adding a tag
 * @param {string} tag - Tag to add
 */
function addTag(tag) {
    const cleaned = tag.trim().toLowerCase().replace(/^#/, '');
    if (cleaned && !journalTags.includes(cleaned)) {
        journalTags.push(cleaned);
        updateJournalTagsDisplay();
    }
}

/**
 * Handle removing a tag
 * @param {number} index - Tag index to remove
 */
function removeJournalTag(index) {
    journalTags.splice(index, 1);
    updateJournalTagsDisplay();
}

/**
 * Update the tags display
 */
function updateJournalTagsDisplay() {
    const container = document.getElementById('journalTagsDisplay');
    if (!container) return;
    
    container.innerHTML = '';
    journalTags.forEach((tag, index) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'entry-tag';
        tagEl.innerHTML = `${tag} <span style="cursor: pointer; margin-left: 5px;" onclick="removeJournalTag(${index})">×</span>`;
        container.appendChild(tagEl);
    });
}

/**
 * Handle saving journal entry
 */
async function saveJournalEntry() {
    const content = document.getElementById('journalEntry')?.value;
    
    if (!content || !content.trim()) {
        if (typeof showToast === 'function') {
            showToast('Please write something', 'error');
        }
        return;
    }
    
    if (!window.appState?.currentUser || !window.db) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    // Validate
    if (window.JournalLogic) {
        const validation = window.JournalLogic.validateJournalEntry({ content, tags: journalTags });
        if (!validation.valid) {
            if (typeof showToast === 'function') {
                showToast(validation.errors[0], 'error');
            }
            return;
        }
    }
    
    // Store original state for rollback
    const originalStats = { ...window.appState.userStats };
    
    try {
        // Optimistic update
        window.appState.userStats.journalEntries++;
        if (typeof addXP === 'function') addXP(20);
        if (typeof checkAndUnlockBadges === 'function') checkAndUnlockBadges();
        
        // Analyze sentiment
        const sentiment = window.JournalLogic ? 
            window.JournalLogic.analyzeSentiment(content) : 
            'neutral';
        
        // Save to Firestore
        const entryData = {
            content: content,
            mood: selectedJournalMood,
            tags: journalTags,
            sentiment: sentiment
        };
        
        if (window.JournalData) {
            await window.JournalData.saveJournalEntry(entryData);
        } else {
            // Fallback
            await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('journal').add({
                    ...entryData,
                    wordCount: content.trim().split(/\s+/).length,
                    timestamp: new Date(),
                    date: new Date().toISOString().split('T')[0]
                });
        }
        
        // Success
        if (typeof showToast === 'function') {
            showToast('Journal entry saved! 📝', 'success');
        }
        
        // Reset form
        resetJournalForm();
        
        // Update UI
        if (typeof updateGamificationUI === 'function') {
            updateGamificationUI();
        }
        
        // Reload entries
        loadJournalEntries();
        
    } catch (error) {
        // Rollback on failure
        window.appState.userStats = originalStats;
        if (typeof updateGamificationUI === 'function') {
            updateGamificationUI();
        }
        
        if (typeof showToast === 'function') {
            showToast('Error saving journal: ' + error.message, 'error');
        }
        console.error('[JournalEvents] Save error:', error);
    }
}

/**
 * Reset journal form
 */
function resetJournalForm() {
    const editor = document.getElementById('journalEntry');
    const tagsInput = document.getElementById('journalTags');
    
    if (editor) editor.value = '';
    if (tagsInput) tagsInput.value = '';
    
    journalTags = [];
    selectedJournalMood = null;
    
    updateJournalTagsDisplay();
    
    document.querySelectorAll('.journal-container .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

/**
 * Load and display journal entries
 */
async function loadJournalEntries() {
    const container = document.getElementById('journalEntriesContainer');
    if (!container || !window.appState?.currentUser || !window.db) return;
    
    try {
        let entries = [];
        
        if (window.JournalData) {
            entries = await window.JournalData.getJournalEntries({ limit: 50 });
        } else {
            // Fallback
            const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('journal')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            snapshot.forEach(doc => {
                entries.push({ id: doc.id, ...doc.data() });
            });
        }
        
        currentEntries = entries;
        
        // Render entries
        if (window.JournalUI) {
            window.JournalUI.renderEntries('journalEntriesContainer', entries, {
                onView: viewFullEntry,
                onDelete: deleteJournalEntry
            });
        } else {
            // Fallback rendering
            renderEntriesLegacy(container, entries);
        }
        
    } catch (error) {
        console.error('[JournalEvents] Error loading entries:', error);
    }
}

/**
 * Legacy entry rendering (fallback)
 */
function renderEntriesLegacy(container, entries) {
    const moodEmojis = { 'very-sad': '😢', 'sad': '😞', 'okay': '😐', 'good': '😊', 'great': '😄' };
    
    container.innerHTML = '';
    entries.forEach(entry => {
        const data = entry;
        const date = new Date(data.timestamp?.seconds * 1000 || Date.now());
        const moodEmoji = moodEmojis[data.mood] || '📝';
        
        const entryEl = document.createElement('div');
        entryEl.className = `journal-entry entry-${data.mood || 'good'}`;
        entryEl.setAttribute('data-date', data.date || '');
        
        let tagHTML = '';
        if (data.tags && data.tags.length > 0) {
            tagHTML = '<div class="entry-tags">' + 
                data.tags.map(tag => `<div class="entry-tag">${tag}</div>`).join('') + 
                '</div>';
        }
        
        entryEl.innerHTML = `
            <div class="entry-header">
                <span class="entry-mood-indicator">${moodEmoji}</span>
                <div class="entry-meta">
                    <span>${date.toLocaleDateString()}</span>
                    <span>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ${data.wordCount ? `<span>${data.wordCount} words</span>` : ''}
                </div>
            </div>
            ${data.sentiment ? `<div class="entry-sentiment"><i class="fas fa-chart-line"></i> Sentiment: ${data.sentiment}</div>` : ''}
            <div class="entry-content">${escapeHtml(data.content.substring(0, 200))}${data.content.length > 200 ? '...' : ''}</div>
            ${tagHTML}
            <div class="entry-actions">
                <button class="action-btn" onclick="viewFullEntry('${entry.id}')"><i class="fas fa-expand"></i> Read More</button>
                <button class="action-btn" onclick="deleteJournalEntry('${entry.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        container.appendChild(entryEl);
    });
}

/**
 * View full entry
 * @param {string} entryId - Entry ID
 */
async function viewFullEntry(entryId) {
    // Find entry in current entries
    let entry = currentEntries.find(e => e.id === entryId);
    
    if (!entry && window.JournalData) {
        entry = await window.JournalData.getJournalEntry(entryId);
    }
    
    if (entry && window.JournalUI) {
        window.JournalUI.showFullEntryModal(entry);
    } else {
        if (typeof showToast === 'function') {
            showToast('Opening full entry...', 'info');
        }
    }
}

/**
 * Delete journal entry
 * @param {string} entryId - Entry ID
 */
async function deleteJournalEntry(entryId) {
    if (!window.appState?.currentUser || !window.db) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    if (!confirm('Delete this entry?')) return;
    
    try {
        if (window.JournalData) {
            await window.JournalData.deleteJournalEntry(entryId);
        } else {
            await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('journal').doc(entryId).delete();
        }
        
        loadJournalEntries();
        
        if (typeof showToast === 'function') {
            showToast('Entry deleted', 'success');
        }
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Error deleting entry: ' + error.message, 'error');
        }
    }
}

/**
 * Filter journal entries by period
 * @param {string} period - 'all' | 'week' | 'month'
 * @param {HTMLElement} element - Clicked button
 */
function filterJournalEntries(period, element) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    
    // Apply filter
    if (window.JournalUI) {
        window.JournalUI.applyDateFilter(period);
    } else {
        // Fallback
        const entries = document.querySelectorAll('.journal-entry');
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        entries.forEach(entry => {
            const dateStr = entry.getAttribute('data-date');
            const date = new Date(dateStr);
            let show = true;
            
            if (period === 'week') show = date >= weekAgo;
            else if (period === 'month') show = date >= monthAgo;
            
            entry.style.display = show ? 'block' : 'none';
        });
    }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// Tag Input Handler
// ============================================================================

/**
 * Initialize tag input handler
 */
function initTagInput() {
    const tagsInput = document.getElementById('journalTags');
    if (tagsInput) {
        tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagsInput.value);
                tagsInput.value = '';
            }
        });
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initTagInput);
}

// ============================================================================
// Exports
// ============================================================================

const JournalEvents = {
    selectJournalMood,
    addTag,
    removeJournalTag,
    updateJournalTagsDisplay,
    saveJournalEntry,
    loadJournalEntries,
    viewFullEntry,
    deleteJournalEntry,
    filterJournalEntries,
    resetJournalForm
};

if (typeof window !== 'undefined') {
    window.JournalEvents = JournalEvents;
    // Legacy support
    window.selectJournalMood = selectJournalMood;
    window.removeJournalTag = removeJournalTag;
    window.updateJournalTagsDisplay = updateJournalTagsDisplay;
    window.saveJournalEntry = saveJournalEntry;
    window.loadJournalEntries = loadJournalEntries;
    window.viewFullEntry = viewFullEntry;
    window.deleteJournalEntry = deleteJournalEntry;
    window.filterJournalEntries = filterJournalEntries;
}
