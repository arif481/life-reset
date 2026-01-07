/**
 * @fileoverview Gamification Event Handlers
 * @description Orchestrates gamification system
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module State
// ============================================================================

let currentStats = null;
let soundEnabled = true;

// ============================================================================
// XP Rewards
// ============================================================================

const XP_REWARDS = {
    taskComplete: 10,
    habitComplete: 15,
    journalEntry: 20,
    moodLog: 5,
    streakBonus: 25,
    dailyLogin: 5
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize gamification system
 */
async function initGamification() {
    console.log('[GamificationEvents] Initializing gamification');
    
    // Load stats
    currentStats = window.GamificationData ? 
        await window.GamificationData.getGamificationStats() : 
        { xp: 0, level: 1, tasksCompleted: 0, badges: [] };
    
    // Update app state
    if (window.appState) {
        window.appState.userStats = currentStats;
    }
    
    // Render UI
    updateGamificationUI();
    
    // Check daily login bonus
    await checkDailyLogin();
    
    console.log('[GamificationEvents] Gamification initialized:', currentStats);
}

/**
 * Update all gamification UI elements
 */
function updateGamificationUI() {
    if (!currentStats) return;
    
    if (window.GamificationUI) {
        // Update XP bar
        window.GamificationUI.renderXPBar('xpBarContainer', currentStats);
        
        // Update header display
        window.GamificationUI.updateHeaderLevelDisplay(currentStats);
        
        // Update stats display if visible
        window.GamificationUI.renderGamificationStats('gamificationStatsContainer', currentStats);
    }
    
    // Update badges if on gamification view
    updateBadgesDisplay();
}

/**
 * Update badges display
 */
async function updateBadgesDisplay() {
    if (!window.GamificationData || !window.GamificationUI) return;
    
    const badgeProgress = await window.GamificationData.getBadgeProgress();
    window.GamificationUI.renderBadgesGrid('badgesContainer', badgeProgress);
}

// ============================================================================
// XP Operations
// ============================================================================

/**
 * Add XP for an action
 * @param {number} amount - XP amount
 * @param {HTMLElement} targetElement - Optional element to animate near
 */
async function addXP(amount, targetElement = null) {
    if (!window.GamificationData) {
        // Fallback
        if (window.appState?.userStats) {
            window.appState.userStats.xp = (window.appState.userStats.xp || 0) + amount;
        }
        return;
    }
    
    const result = await window.GamificationData.addXP(amount);
    currentStats = result;
    
    // Update app state
    if (window.appState) {
        window.appState.userStats = currentStats;
    }
    
    // Animate XP gain
    if (window.GamificationUI) {
        window.GamificationUI.animateXPGain(amount, targetElement);
    }
    
    // Check for level up
    if (result.leveledUp) {
        handleLevelUp(result.level);
    }
    
    // Update UI
    updateGamificationUI();
    
    // Play sound
    playSound('xp');
}

/**
 * Handle level up
 * @param {number} newLevel - New level achieved
 */
function handleLevelUp(newLevel) {
    console.log('[GamificationEvents] Level up!', newLevel);
    
    // Show celebration
    if (window.GamificationUI) {
        window.GamificationUI.showLevelUpCelebration(newLevel);
    }
    
    // Play sound
    playSound('levelUp');
    
    // Check for level-based badges
    checkAndUnlockBadges();
    
    // Show toast
    if (typeof showToast === 'function') {
        showToast(`🎉 Level Up! You're now level ${newLevel}!`, 'success');
    }
}

// ============================================================================
// Badge Operations
// ============================================================================

/**
 * Check and unlock badges
 */
async function checkAndUnlockBadges() {
    if (!window.GamificationData) return;
    
    const newBadges = await window.GamificationData.checkAndUnlockBadges();
    
    // Reload stats
    currentStats = await window.GamificationData.getGamificationStats();
    
    // Show notifications for new badges
    if (window.GamificationUI) {
        newBadges.forEach(badge => {
            window.GamificationUI.showBadgeUnlockNotification(badge);
            playSound('badge');
        });
    }
    
    // Update displays
    updateBadgesDisplay();
}

// ============================================================================
// Stat Tracking
// ============================================================================

/**
 * Record task completion
 */
async function recordTaskCompletion() {
    if (window.GamificationData) {
        await window.GamificationData.incrementStat('tasksCompleted');
    } else if (window.appState?.userStats) {
        window.appState.userStats.tasksCompleted++;
    }
    
    await addXP(XP_REWARDS.taskComplete);
    await checkAndUnlockBadges();
}

/**
 * Record habit completion
 * @param {number} currentStreak - Current habit streak
 */
async function recordHabitCompletion(currentStreak = 0) {
    if (window.GamificationData) {
        await window.GamificationData.incrementStat('habitsDone');
        await window.GamificationData.updateLongestStreak(currentStreak);
    } else if (window.appState?.userStats) {
        window.appState.userStats.habitsDone++;
        if (currentStreak > (window.appState.userStats.longestStreak || 0)) {
            window.appState.userStats.longestStreak = currentStreak;
        }
    }
    
    let xp = XP_REWARDS.habitComplete;
    
    // Streak bonus
    if (currentStreak > 0 && currentStreak % 7 === 0) {
        xp += XP_REWARDS.streakBonus;
        if (typeof showToast === 'function') {
            showToast(`🔥 ${currentStreak}-day streak bonus! +${XP_REWARDS.streakBonus} XP`, 'success');
        }
    }
    
    await addXP(xp);
    await checkAndUnlockBadges();
}

/**
 * Record journal entry
 */
async function recordJournalEntry() {
    if (window.GamificationData) {
        await window.GamificationData.incrementStat('journalEntries');
    } else if (window.appState?.userStats) {
        window.appState.userStats.journalEntries++;
    }
    
    await addXP(XP_REWARDS.journalEntry);
    await checkAndUnlockBadges();
}

/**
 * Record mood log
 */
async function recordMoodLog() {
    await addXP(XP_REWARDS.moodLog);
}

// ============================================================================
// Daily Login
// ============================================================================

/**
 * Check and award daily login bonus
 */
async function checkDailyLogin() {
    const lastLogin = localStorage.getItem('lastLoginDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastLogin !== today) {
        localStorage.setItem('lastLoginDate', today);
        
        // Award daily login bonus
        await addXP(XP_REWARDS.dailyLogin);
        
        if (typeof showToast === 'function') {
            showToast(`Welcome back! +${XP_REWARDS.dailyLogin} XP`, 'success');
        }
    }
}

// ============================================================================
// Sound Effects
// ============================================================================

/**
 * Play a sound effect
 * @param {string} soundType - Type of sound
 */
function playSound(soundType) {
    if (!soundEnabled) return;
    
    // Check settings
    const settings = localStorage.getItem('lifeResetSettings');
    if (settings) {
        try {
            const parsed = JSON.parse(settings);
            if (parsed.soundEffects === false) return;
        } catch (e) {}
    }
    
    // Simple beep sounds using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const sounds = {
            xp: { freq: 800, duration: 0.1 },
            levelUp: { freq: 1000, duration: 0.3 },
            badge: { freq: 600, duration: 0.2 },
            complete: { freq: 500, duration: 0.15 }
        };
        
        const sound = sounds[soundType] || sounds.complete;
        
        oscillator.frequency.value = sound.freq;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
        // Audio not supported
    }
}

/**
 * Toggle sound effects
 * @param {boolean} enabled - Enable sounds
 */
function setSoundEnabled(enabled) {
    soundEnabled = enabled;
}

// ============================================================================
// Legacy Support
// ============================================================================

/**
 * Legacy addXP function
 */
window.addXP = addXP;
window.checkAndUnlockBadges = checkAndUnlockBadges;
window.updateGamificationUI = updateGamificationUI;

// ============================================================================
// Exports
// ============================================================================

export const GamificationEvents = {
    XP_REWARDS,
    initGamification,
    updateGamificationUI,
    addXP,
    handleLevelUp,
    checkAndUnlockBadges,
    recordTaskCompletion,
    recordHabitCompletion,
    recordJournalEntry,
    recordMoodLog,
    checkDailyLogin,
    playSound,
    setSoundEnabled,
    getCurrentStats: () => currentStats
};

if (typeof window !== 'undefined') {
    window.GamificationEvents = GamificationEvents;
}
