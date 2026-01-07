/**
 * @fileoverview Journal UI Rendering
 * @description Handles DOM construction for journal feature
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Entry Rendering
// ============================================================================

const MOOD_EMOJIS = {
    'very-sad': '😢',
    'sad': '😞',
    'okay': '😐',
    'good': '😊',
    'great': '😄'
};

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Render a single journal entry
 * @param {Object} entry - Journal entry data
 * @returns {string} HTML string
 */
function renderEntry(entry) {
    const date = entry.timestamp?.toDate ? 
        entry.timestamp.toDate() : 
        new Date(entry.timestamp?.seconds * 1000 || Date.now());
    
    const moodEmoji = MOOD_EMOJIS[entry.mood] || '📝';
    const summary = window.JournalLogic ? 
        window.JournalLogic.extractSummary(entry.content, 200) :
        entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : '');
    
    let tagsHtml = '';
    if (entry.tags && entry.tags.length > 0) {
        tagsHtml = `
            <div class="entry-tags">
                ${entry.tags.map(tag => `<div class="entry-tag">${escapeHtml(tag)}</div>`).join('')}
            </div>
        `;
    }
    
    return `
        <div class="journal-entry entry-${entry.mood || 'good'}" 
             data-id="${entry.id}"
             data-date="${entry.date || ''}"
             data-tags="${escapeHtml(JSON.stringify(entry.tags || []))}"
             data-sentiment="${entry.sentiment || ''}">
            <div class="entry-header">
                <span class="entry-mood-indicator">${moodEmoji}</span>
                <div class="entry-meta">
                    <span>${date.toLocaleDateString()}</span>
                    <span>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ${entry.wordCount ? `<span>${entry.wordCount} words</span>` : ''}
                </div>
            </div>
            ${entry.sentiment ? `
                <div class="entry-sentiment">
                    <i class="fas fa-chart-line"></i> Sentiment: ${entry.sentiment}
                </div>
            ` : ''}
            <div class="entry-content">${escapeHtml(summary)}</div>
            ${tagsHtml}
            <div class="entry-actions">
                <button class="action-btn" data-action="view" data-id="${entry.id}">
                    <i class="fas fa-expand"></i> Read More
                </button>
                <button class="action-btn" data-action="delete" data-id="${entry.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

/**
 * Render journal entries list
 * @param {string} containerId - Container element ID
 * @param {Array} entries - Journal entries
 * @param {Object} handlers - Event handlers { onView, onDelete }
 */
function renderEntries(containerId, entries, handlers = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                <p>No journal entries yet</p>
                <p style="opacity: 0.7; font-size: 14px;">Start writing to see your entries here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map(entry => renderEntry(entry)).join('');
    
    // Attach event handlers via delegation
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const action = btn.dataset.action;
        const entryId = btn.dataset.id;
        
        if (action === 'view' && handlers.onView) {
            handlers.onView(entryId);
        } else if (action === 'delete' && handlers.onDelete) {
            handlers.onDelete(entryId);
        }
    });
}

// ============================================================================
// Tags UI
// ============================================================================

/**
 * Render tags display
 * @param {string} containerId - Container element ID
 * @param {Array} tags - Array of tags
 * @param {Function} onRemove - Callback when tag is removed
 */
function renderTagsDisplay(containerId, tags, onRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!tags || tags.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = tags.map((tag, index) => `
        <div class="entry-tag">
            ${escapeHtml(tag)}
            <span class="tag-remove" data-index="${index}" style="cursor: pointer; margin-left: 5px;">×</span>
        </div>
    `).join('');
    
    if (onRemove) {
        container.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.tag-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index, 10);
                onRemove(index);
            }
        });
    }
}

// ============================================================================
// Editor UI
// ============================================================================

/**
 * Get editor content
 * @returns {string}
 */
function getEditorContent() {
    const editor = document.getElementById('journalEntry');
    return editor ? editor.value : '';
}

/**
 * Clear editor
 */
function clearEditor() {
    const editor = document.getElementById('journalEntry');
    if (editor) editor.value = '';
}

/**
 * Get tags input
 * @returns {string}
 */
function getTagsInput() {
    const input = document.getElementById('journalTags');
    return input ? input.value : '';
}

/**
 * Clear tags input
 */
function clearTagsInput() {
    const input = document.getElementById('journalTags');
    if (input) input.value = '';
}

// ============================================================================
// Filter UI
// ============================================================================

/**
 * Update active filter button
 * @param {string} activeFilter - Active filter value
 */
function updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset?.filter === activeFilter);
    });
}

/**
 * Hide/show entries based on filter
 * @param {string} period - 'all' | 'week' | 'month'
 */
function applyDateFilter(period) {
    const entries = document.querySelectorAll('.journal-entry');
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    entries.forEach(entry => {
        const dateStr = entry.getAttribute('data-date');
        const entryDate = dateStr ? new Date(dateStr) : new Date(0);
        
        let show = true;
        if (period === 'week') {
            show = entryDate >= weekAgo;
        } else if (period === 'month') {
            show = entryDate >= monthAgo;
        }
        
        entry.style.display = show ? 'block' : 'none';
    });
}

// ============================================================================
// Full Entry Modal
// ============================================================================

/**
 * Show full entry in a modal
 * @param {Object} entry - Journal entry
 */
function showFullEntryModal(entry) {
    const date = entry.timestamp?.toDate ? 
        entry.timestamp.toDate() : 
        new Date(entry.timestamp?.seconds * 1000 || Date.now());
    
    const moodEmoji = MOOD_EMOJIS[entry.mood] || '📝';
    const isDark = document.body.classList.contains('dark-mode');
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'journalEntryModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    modal.innerHTML = `
        <div style="background: ${isDark ? '#2b2d42' : '#fff'}; color: ${isDark ? '#e0e0e0' : '#333'}; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">${moodEmoji}</span>
                    <div>
                        <div style="font-weight: 600;">${date.toLocaleDateString()}</div>
                        <div style="opacity: 0.7; font-size: 14px;">${date.toLocaleTimeString()}</div>
                    </div>
                </div>
                <button id="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: ${isDark ? '#e0e0e0' : '#333'};">×</button>
            </div>
            ${entry.sentiment ? `<div style="margin-bottom: 16px; padding: 8px 12px; background: ${isDark ? '#3a3a4e' : '#f5f5f5'}; border-radius: 8px; font-size: 14px;"><i class="fas fa-chart-line"></i> Sentiment: ${entry.sentiment}</div>` : ''}
            <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(entry.content)}</div>
            ${entry.tags && entry.tags.length > 0 ? `
                <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;">
                    ${entry.tags.map(tag => `<span style="padding: 4px 12px; background: ${isDark ? '#4361ee' : '#e7e9ff'}; color: ${isDark ? '#fff' : '#4361ee'}; border-radius: 16px; font-size: 13px;">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('#closeModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape' && document.body.contains(modal)) {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handler);
        }
    });
}

// ============================================================================
// Exports
// ============================================================================

const JournalUI = {
    renderEntry,
    renderEntries,
    renderTagsDisplay,
    getEditorContent,
    clearEditor,
    getTagsInput,
    clearTagsInput,
    updateFilterButtons,
    applyDateFilter,
    showFullEntryModal,
    escapeHtml
};

if (typeof window !== 'undefined') {
    window.JournalUI = JournalUI;
    window.escapeHtml = escapeHtml;
}
