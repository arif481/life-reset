/**
 * @fileoverview Mood UI Rendering
 * @description Handles DOM construction and updates for mood tracking
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Mood Selection UI
// ============================================================================

/**
 * Render mood selector buttons
 * @param {string} containerId - Container element ID
 * @param {Function} onSelect - Callback when mood is selected
 */
function renderMoodSelector(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const moods = [
        { id: 'very-sad', emoji: '😢', label: 'Very Sad' },
        { id: 'sad', emoji: '😞', label: 'Sad' },
        { id: 'okay', emoji: '😐', label: 'Okay' },
        { id: 'good', emoji: '😊', label: 'Good' },
        { id: 'great', emoji: '😄', label: 'Great' }
    ];
    
    container.innerHTML = moods.map(mood => `
        <button class="mood-btn" data-mood="${mood.id}" title="${mood.label}">
            <span>${mood.emoji}</span>
            <span class="mood-label">${mood.label}</span>
        </button>
    `).join('');
    
    // Event delegation
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.mood-btn');
        if (!btn) return;
        
        const mood = btn.dataset.mood;
        
        // Update selection UI
        container.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        if (onSelect) onSelect(mood);
    });
}

/**
 * Set the selected mood in the UI
 * @param {string} containerId - Container element ID
 * @param {string} mood - Mood to select
 */
function setSelectedMood(containerId, mood) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === mood);
    });
}

/**
 * Clear mood selection
 * @param {string} containerId - Container element ID
 */
function clearMoodSelection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ============================================================================
// Trigger Tags UI
// ============================================================================

/**
 * Render trigger tag buttons
 * @param {string} containerId - Container element ID
 * @param {Function} onToggle - Callback when trigger is toggled
 */
function renderTriggerTags(containerId, onToggle) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const triggers = [
        { id: 'work', label: 'Work', icon: '💼' },
        { id: 'relationships', label: 'Relationships', icon: '💑' },
        { id: 'health', label: 'Health', icon: '🏥' },
        { id: 'finances', label: 'Finances', icon: '💰' },
        { id: 'social', label: 'Social', icon: '👥' },
        { id: 'sleep', label: 'Sleep', icon: '😴' },
        { id: 'exercise', label: 'Exercise', icon: '🏃' },
        { id: 'food', label: 'Food', icon: '🍽️' }
    ];
    
    container.innerHTML = triggers.map(trigger => `
        <div class="trigger-tag" data-trigger="${trigger.id}">
            ${trigger.icon} ${trigger.label}
        </div>
    `).join('');
    
    container.addEventListener('click', (e) => {
        const tag = e.target.closest('.trigger-tag');
        if (!tag) return;
        
        const triggerId = tag.dataset.trigger;
        const isActive = tag.classList.toggle('active');
        
        if (onToggle) onToggle(triggerId, isActive);
    });
}

/**
 * Set active triggers
 * @param {string} containerId - Container element ID
 * @param {Array} triggers - Array of trigger IDs
 */
function setActiveTriggers(containerId, triggers) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.trigger-tag').forEach(tag => {
        const triggerId = tag.dataset.trigger;
        tag.classList.toggle('active', triggers.includes(triggerId));
    });
}

/**
 * Clear all trigger selections
 * @param {string} containerId - Container element ID
 */
function clearTriggerSelections(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.trigger-tag').forEach(tag => {
        tag.classList.remove('active');
    });
}

// ============================================================================
// Intensity Slider UI
// ============================================================================

/**
 * Update intensity display
 * @param {number} value - Intensity value (0-100)
 */
function updateIntensityDisplay(value) {
    const display = document.getElementById('intensityValue');
    if (display) {
        display.textContent = `${value}%`;
    }
}

/**
 * Reset intensity slider to default
 */
function resetIntensitySlider() {
    const slider = document.getElementById('moodIntensity');
    const display = document.getElementById('intensityValue');
    
    if (slider) slider.value = 50;
    if (display) display.textContent = '50%';
}

// ============================================================================
// Mood Stats UI
// ============================================================================

/**
 * Update mood statistics display
 * @param {Object} stats - Statistics object from MoodLogic.calculateMoodStats
 */
function updateMoodStatsDisplay(stats) {
    const elements = {
        averageMood: document.getElementById('averageMood'),
        bestMood: document.getElementById('bestMood'),
        moodStreak: document.getElementById('moodStreak'),
        commonTrigger: document.getElementById('commonTrigger')
    };
    
    if (elements.averageMood) {
        elements.averageMood.textContent = stats.average ? stats.average.toFixed(1) : '--';
    }
    
    if (elements.bestMood) {
        elements.bestMood.textContent = stats.bestEmoji || '😄';
    }
    
    if (elements.moodStreak) {
        elements.moodStreak.textContent = stats.count || 0;
    }
    
    if (elements.commonTrigger) {
        elements.commonTrigger.textContent = stats.mostCommonTrigger || '--';
    }
}

// ============================================================================
// Mood Note UI
// ============================================================================

/**
 * Get mood note value
 * @returns {string}
 */
function getMoodNote() {
    const input = document.getElementById('moodNote');
    return input ? input.value : '';
}

/**
 * Clear mood note
 */
function clearMoodNote() {
    const input = document.getElementById('moodNote');
    if (input) input.value = '';
}

/**
 * Get intensity value
 * @returns {number}
 */
function getIntensityValue() {
    const slider = document.getElementById('moodIntensity');
    return slider ? parseInt(slider.value, 10) : 50;
}

// ============================================================================
// Reset Form
// ============================================================================

/**
 * Reset the entire mood form
 */
function resetMoodForm() {
    clearMoodSelection('mood-view');
    clearTriggerSelections('mood-view');
    clearMoodNote();
    resetIntensitySlider();
}

// ============================================================================
// Exports
// ============================================================================

export const MoodUI = {
    renderMoodSelector,
    setSelectedMood,
    clearMoodSelection,
    renderTriggerTags,
    setActiveTriggers,
    clearTriggerSelections,
    updateIntensityDisplay,
    resetIntensitySlider,
    updateMoodStatsDisplay,
    getMoodNote,
    clearMoodNote,
    getIntensityValue,
    resetMoodForm
};

if (typeof window !== 'undefined') {
    window.MoodUI = MoodUI;
    // Legacy support
    window.updateIntensityDisplay = function() {
        const slider = document.getElementById('moodIntensity');
        if (slider) updateIntensityDisplay(slider.value);
    };
}
