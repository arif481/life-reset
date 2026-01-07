/**
 * @fileoverview Mood Event Handlers
 * @description Wires event listeners and connects UI to logic for mood tracking
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let selectedMood = null;
let selectedTriggers = [];

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle mood selection
 * @param {string} mood - Selected mood
 * @param {Event} event - Click event
 */
function selectMood(mood, event) {
    selectedMood = mood;
    window.appState.selectedMood = mood;
    
    // Update UI
    document.querySelectorAll('#mood-view .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (event && event.target) {
        const btn = event.target.closest('.mood-btn');
        if (btn) btn.classList.add('selected');
    }
}

/**
 * Handle trigger toggle
 * @param {HTMLElement} element - Trigger element
 * @param {string} trigger - Trigger ID
 */
function toggleTrigger(element, trigger) {
    element.classList.toggle('active');
    
    if (element.classList.contains('active')) {
        if (!selectedTriggers.includes(trigger)) {
            selectedTriggers.push(trigger);
        }
    } else {
        selectedTriggers = selectedTriggers.filter(t => t !== trigger);
    }
}

/**
 * Handle mood entry save
 */
async function saveMoodEntry() {
    const mood = selectedMood || window.appState.selectedMood;
    
    if (!mood) {
        if (typeof showToast === 'function') {
            showToast('Please select a mood', 'error');
        }
        return;
    }
    
    if (!window.appState?.currentUser || !window.db) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'error');
        }
        return;
    }
    
    // Get form values
    const note = document.getElementById('moodNote')?.value || '';
    const intensity = parseInt(document.getElementById('moodIntensity')?.value || '50', 10);
    const dateString = new Date().toISOString().split('T')[0];
    
    // Store original state for rollback
    const originalStats = { ...window.appState.userStats };
    
    try {
        // Optimistic update
        window.appState.userStats.moodLogged++;
        if (typeof addXP === 'function') addXP(15);
        if (typeof checkAndUnlockBadges === 'function') checkAndUnlockBadges();
        
        // Save to Firestore
        if (window.MoodData) {
            await window.MoodData.saveMoodEntry(dateString, {
                mood,
                intensity,
                note,
                triggers: selectedTriggers
            });
        } else {
            // Fallback to direct Firestore
            await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('mood').doc(dateString)
                .set({
                    mood,
                    intensity,
                    note,
                    triggers: selectedTriggers,
                    timestamp: new Date(),
                    date: dateString
                }, { merge: true });
        }
        
        // Success - reset form
        if (typeof showToast === 'function') {
            showToast('Mood logged successfully! 🎉', 'success');
        }
        
        resetMoodForm();
        
        // Update UI
        if (typeof updateGamificationUI === 'function') {
            updateGamificationUI();
        }
        
        // Reload stats
        loadMoodStats();
        
    } catch (error) {
        // Rollback on failure
        window.appState.userStats = originalStats;
        if (typeof updateGamificationUI === 'function') {
            updateGamificationUI();
        }
        
        if (typeof showToast === 'function') {
            showToast('Error saving mood: ' + error.message, 'error');
        }
        console.error('[MoodEvents] Save error:', error);
    }
}

/**
 * Reset the mood form
 */
function resetMoodForm() {
    selectedMood = null;
    selectedTriggers = [];
    window.appState.selectedMood = null;
    
    // Clear UI
    document.querySelectorAll('#mood-view .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.trigger-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    const noteInput = document.getElementById('moodNote');
    if (noteInput) noteInput.value = '';
    
    const intensitySlider = document.getElementById('moodIntensity');
    const intensityValue = document.getElementById('intensityValue');
    if (intensitySlider) intensitySlider.value = 50;
    if (intensityValue) intensityValue.textContent = '50%';
}

/**
 * Load and display mood statistics
 */
async function loadMoodStats() {
    if (!window.appState?.currentUser || !window.db) return;
    
    try {
        // Get this week's moods
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const startDate = weekAgo.toISOString().split('T')[0];
        
        let entries = [];
        
        if (window.MoodData) {
            entries = await window.MoodData.getMoodHistory(7);
        } else {
            // Fallback
            const snapshot = await window.db.collection('users').doc(window.appState.currentUser.uid)
                .collection('mood')
                .where('date', '>=', startDate)
                .get();
            
            snapshot.forEach(doc => {
                entries.push({ id: doc.id, ...doc.data() });
            });
        }
        
        // Calculate stats
        let stats;
        if (window.MoodLogic) {
            stats = window.MoodLogic.calculateMoodStats(entries);
        } else {
            // Simple fallback calculation
            const moodValues = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };
            const moodEmojis = { 'very-sad': '😢', 'sad': '😞', 'okay': '😐', 'good': '😊', 'great': '😄' };
            
            let total = 0;
            let best = 0;
            const triggerCounts = {};
            
            entries.forEach(entry => {
                const value = moodValues[entry.mood] || 3;
                total += value;
                best = Math.max(best, value);
                
                if (entry.triggers) {
                    entry.triggers.forEach(t => {
                        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
                    });
                }
            });
            
            const avg = entries.length > 0 ? total / entries.length : null;
            const commonTrigger = Object.keys(triggerCounts).sort((a, b) => 
                triggerCounts[b] - triggerCounts[a]
            )[0] || null;
            
            stats = {
                average: avg,
                bestEmoji: moodEmojis[Object.keys(moodValues).find(k => moodValues[k] === best)] || '😄',
                count: entries.length,
                mostCommonTrigger: commonTrigger
            };
        }
        
        // Update display
        updateMoodStatsDisplay(stats);
        
    } catch (error) {
        console.error('[MoodEvents] Error loading stats:', error);
    }
}

/**
 * Update mood stats display
 * @param {Object} stats - Statistics object
 */
function updateMoodStatsDisplay(stats) {
    const avgEl = document.getElementById('averageMood');
    const bestEl = document.getElementById('bestMood');
    const streakEl = document.getElementById('moodStreak');
    const triggerEl = document.getElementById('commonTrigger');
    
    if (avgEl) avgEl.textContent = stats.average ? stats.average.toFixed(1) : '--';
    if (bestEl) bestEl.textContent = stats.bestEmoji || '😄';
    if (streakEl) streakEl.textContent = stats.count || 0;
    if (triggerEl) triggerEl.textContent = stats.mostCommonTrigger || '--';
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize mood feature
 */
function initMood() {
    // Reset state
    selectedMood = null;
    selectedTriggers = [];
    
    // Load stats
    loadMoodStats();
}

// ============================================================================
// Exports
// ============================================================================

export const MoodEvents = {
    initMood,
    selectMood,
    toggleTrigger,
    saveMoodEntry,
    loadMoodStats,
    resetMoodForm
};

if (typeof window !== 'undefined') {
    window.MoodEvents = MoodEvents;
    // Legacy function support
    window.selectMood = selectMood;
    window.toggleTrigger = toggleTrigger;
    window.saveMoodEntry = saveMoodEntry;
    window.loadMoodStats = loadMoodStats;
    window.initMoodDisplay = initMood;
}
