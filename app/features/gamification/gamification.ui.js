/**
 * @fileoverview Gamification UI Components
 * @description Renders XP bars, badges, level displays
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// XP Bar
// ============================================================================

/**
 * Render XP progress bar
 * @param {string} containerId - Container element ID
 * @param {Object} stats - Gamification stats
 */
function renderXPBar(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const xpPerLevel = window.GamificationData?.XP_PER_LEVEL || 100;
    const xpInCurrentLevel = stats.xp % xpPerLevel;
    const progress = (xpInCurrentLevel / xpPerLevel) * 100;
    
    container.innerHTML = `
        <div class="xp-bar-container">
            <div class="xp-header">
                <span class="level-badge">Level ${stats.level}</span>
                <span class="xp-text">${xpInCurrentLevel}/${xpPerLevel} XP</span>
            </div>
            <div class="xp-bar">
                <div class="xp-fill" style="width: ${progress}%"></div>
            </div>
        </div>
    `;
}

/**
 * Animate XP gain
 * @param {number} amount - XP gained
 * @param {HTMLElement} targetElement - Element to animate near
 */
function animateXPGain(amount, targetElement) {
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.textContent = `+${amount} XP`;
    
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top}px`;
    } else {
        popup.style.right = '20px';
        popup.style.top = '80px';
    }
    
    document.body.appendChild(popup);
    
    // Animate up and fade out
    popup.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-50px)' }
    ], {
        duration: 1500,
        easing: 'ease-out'
    }).onfinish = () => {
        popup.remove();
    };
}

// ============================================================================
// Level Up Animation
// ============================================================================

/**
 * Show level up celebration
 * @param {number} newLevel - New level achieved
 */
function showLevelUpCelebration(newLevel) {
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';
    overlay.innerHTML = `
        <div class="level-up-content">
            <div class="level-up-icon">🎉</div>
            <h2>Level Up!</h2>
            <div class="new-level">Level ${newLevel}</div>
            <p>Keep up the great work!</p>
            <button class="btn btn-primary" id="closeLevelUp">Continue</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add confetti effect
    createConfetti();
    
    // Close handlers
    overlay.querySelector('#closeLevelUp').addEventListener('click', () => {
        overlay.remove();
    });
    
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            overlay.remove();
        }
    }, 5000);
}

/**
 * Create confetti animation
 */
function createConfetti() {
    const colors = ['#4361ee', '#22c55e', '#f97316', '#eab308', '#8b5cf6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
    }
}

// ============================================================================
// Badges Display
// ============================================================================

/**
 * Render badges grid
 * @param {string} containerId - Container element ID
 * @param {Array} badges - Badge data with unlocked status
 */
function renderBadgesGrid(containerId, badges) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = badges.map(badge => `
        <div class="badge-card ${badge.unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon">${badge.unlocked ? badge.icon : '🔒'}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
            ${!badge.unlocked && badge.progress !== undefined ? `
                <div class="badge-progress">
                    <div class="badge-progress-bar" style="width: ${badge.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Show badge unlock notification
 * @param {Object} badge - Unlocked badge
 */
function showBadgeUnlockNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-notification-content">
            <div class="badge-notification-icon">${badge.icon}</div>
            <div class="badge-notification-text">
                <strong>Badge Unlocked!</strong>
                <span>${badge.name}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after animation
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================================================
// Stats Display
// ============================================================================

/**
 * Render gamification stats
 * @param {string} containerId - Container element ID
 * @param {Object} stats - Gamification stats
 */
function renderGamificationStats(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const statItems = [
        { icon: '✅', label: 'Tasks Completed', value: stats.tasksCompleted },
        { icon: '🔄', label: 'Habits Done', value: stats.habitsDone },
        { icon: '📝', label: 'Journal Entries', value: stats.journalEntries },
        { icon: '🔥', label: 'Longest Streak', value: `${stats.longestStreak} days` },
        { icon: '🏆', label: 'Badges Earned', value: stats.badges?.length || 0 }
    ];
    
    container.innerHTML = `
        <div class="gamification-stats-grid">
            ${statItems.map(item => `
                <div class="gamification-stat-item">
                    <span class="stat-icon">${item.icon}</span>
                    <span class="stat-value">${item.value}</span>
                    <span class="stat-label">${item.label}</span>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Update header level display
 * @param {Object} stats - Gamification stats
 */
function updateHeaderLevelDisplay(stats) {
    const levelDisplay = document.getElementById('userLevel');
    if (levelDisplay) {
        levelDisplay.textContent = `Lvl ${stats.level}`;
    }
    
    const xpDisplay = document.getElementById('userXP');
    if (xpDisplay) {
        const xpPerLevel = window.GamificationData?.XP_PER_LEVEL || 100;
        const xpInCurrentLevel = stats.xp % xpPerLevel;
        xpDisplay.textContent = `${xpInCurrentLevel}/${xpPerLevel} XP`;
    }
}

// ============================================================================
// Streak Display
// ============================================================================

/**
 * Render streak display
 * @param {string} containerId - Container element ID
 * @param {number} currentStreak - Current streak days
 * @param {number} longestStreak - Longest streak days
 */
function renderStreakDisplay(containerId, currentStreak, longestStreak) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="streak-display">
            <div class="streak-current">
                <span class="streak-fire">🔥</span>
                <span class="streak-number">${currentStreak}</span>
                <span class="streak-label">Day Streak</span>
            </div>
            <div class="streak-best">
                <span class="streak-label">Best: ${longestStreak} days</span>
            </div>
        </div>
    `;
}

// ============================================================================
// Exports
// ============================================================================

const GamificationUI = {
    renderXPBar,
    animateXPGain,
    showLevelUpCelebration,
    createConfetti,
    renderBadgesGrid,
    showBadgeUnlockNotification,
    renderGamificationStats,
    updateHeaderLevelDisplay,
    renderStreakDisplay
};

if (typeof window !== 'undefined') {
    window.GamificationUI = GamificationUI;
}
