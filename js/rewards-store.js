/**
 * @fileoverview Rewards & Achievements Store Module
 * @description Virtual rewards, milestones, badges, achievement system
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Achievement Definitions
   ========================================================================== */

const ACHIEVEMENTS = {
    // Streak achievements
    streak_starter: {
        id: 'streak_starter',
        name: 'Streak Starter',
        description: 'Complete tasks 3 days in a row',
        icon: '🔥',
        category: 'streak',
        requirement: { type: 'streak', value: 3 },
        xpReward: 50,
        rarity: 'common'
    },
    week_warrior: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '⚔️',
        category: 'streak',
        requirement: { type: 'streak', value: 7 },
        xpReward: 100,
        rarity: 'uncommon'
    },
    fortnight_fighter: {
        id: 'fortnight_fighter',
        name: 'Fortnight Fighter',
        description: 'Maintain a 14-day streak',
        icon: '🛡️',
        category: 'streak',
        requirement: { type: 'streak', value: 14 },
        xpReward: 200,
        rarity: 'rare'
    },
    monthly_master: {
        id: 'monthly_master',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        category: 'streak',
        requirement: { type: 'streak', value: 30 },
        xpReward: 500,
        rarity: 'epic'
    },
    century_champion: {
        id: 'century_champion',
        name: 'Century Champion',
        description: 'Maintain a 100-day streak',
        icon: '💯',
        category: 'streak',
        requirement: { type: 'streak', value: 100 },
        xpReward: 2000,
        rarity: 'legendary'
    },

    // Task achievements
    first_task: {
        id: 'first_task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '👣',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 1 },
        xpReward: 10,
        rarity: 'common'
    },
    task_10: {
        id: 'task_10',
        name: 'Getting Started',
        description: 'Complete 10 tasks',
        icon: '📝',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 10 },
        xpReward: 30,
        rarity: 'common'
    },
    task_50: {
        id: 'task_50',
        name: 'Task Tackler',
        description: 'Complete 50 tasks',
        icon: '✅',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 50 },
        xpReward: 100,
        rarity: 'uncommon'
    },
    task_100: {
        id: 'task_100',
        name: 'Centurion',
        description: 'Complete 100 tasks',
        icon: '💪',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 100 },
        xpReward: 200,
        rarity: 'rare'
    },
    task_500: {
        id: 'task_500',
        name: 'Task Legend',
        description: 'Complete 500 tasks',
        icon: '🏆',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 500 },
        xpReward: 750,
        rarity: 'epic'
    },
    task_1000: {
        id: 'task_1000',
        name: 'Productivity God',
        description: 'Complete 1000 tasks',
        icon: '⚡',
        category: 'tasks',
        requirement: { type: 'tasks_completed', value: 1000 },
        xpReward: 2000,
        rarity: 'legendary'
    },

    // Mood achievements
    mood_first: {
        id: 'mood_first',
        name: 'Self-Aware',
        description: 'Log your first mood',
        icon: '😊',
        category: 'mood',
        requirement: { type: 'moods_logged', value: 1 },
        xpReward: 10,
        rarity: 'common'
    },
    mood_week: {
        id: 'mood_week',
        name: 'Mood Tracker',
        description: 'Log mood for 7 consecutive days',
        icon: '📊',
        category: 'mood',
        requirement: { type: 'mood_streak', value: 7 },
        xpReward: 75,
        rarity: 'uncommon'
    },
    mood_month: {
        id: 'mood_month',
        name: 'Emotional Intelligence',
        description: 'Log mood for 30 consecutive days',
        icon: '🧠',
        category: 'mood',
        requirement: { type: 'mood_streak', value: 30 },
        xpReward: 300,
        rarity: 'rare'
    },
    positive_vibes: {
        id: 'positive_vibes',
        name: 'Positive Vibes',
        description: 'Log "great" mood 10 times',
        icon: '✨',
        category: 'mood',
        requirement: { type: 'great_moods', value: 10 },
        xpReward: 100,
        rarity: 'uncommon'
    },

    // Journal achievements
    journal_first: {
        id: 'journal_first',
        name: 'Dear Diary',
        description: 'Write your first journal entry',
        icon: '📖',
        category: 'journal',
        requirement: { type: 'journal_entries', value: 1 },
        xpReward: 15,
        rarity: 'common'
    },
    journal_10: {
        id: 'journal_10',
        name: 'Reflective',
        description: 'Write 10 journal entries',
        icon: '📝',
        category: 'journal',
        requirement: { type: 'journal_entries', value: 10 },
        xpReward: 75,
        rarity: 'uncommon'
    },
    journal_50: {
        id: 'journal_50',
        name: 'Thoughtful Writer',
        description: 'Write 50 journal entries',
        icon: '✍️',
        category: 'journal',
        requirement: { type: 'journal_entries', value: 50 },
        xpReward: 250,
        rarity: 'rare'
    },
    long_entry: {
        id: 'long_entry',
        name: 'Deep Thinker',
        description: 'Write a journal entry with 500+ words',
        icon: '📚',
        category: 'journal',
        requirement: { type: 'long_journal', value: 500 },
        xpReward: 50,
        rarity: 'uncommon'
    },

    // Level achievements
    level_5: {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        category: 'level',
        requirement: { type: 'level', value: 5 },
        xpReward: 100,
        rarity: 'common'
    },
    level_10: {
        id: 'level_10',
        name: 'Double Digits',
        description: 'Reach level 10',
        icon: '🌟',
        category: 'level',
        requirement: { type: 'level', value: 10 },
        xpReward: 200,
        rarity: 'uncommon'
    },
    level_25: {
        id: 'level_25',
        name: 'Quarter Century',
        description: 'Reach level 25',
        icon: '💫',
        category: 'level',
        requirement: { type: 'level', value: 25 },
        xpReward: 500,
        rarity: 'rare'
    },
    level_50: {
        id: 'level_50',
        name: 'Halfway Hero',
        description: 'Reach level 50',
        icon: '🔮',
        category: 'level',
        requirement: { type: 'level', value: 50 },
        xpReward: 1000,
        rarity: 'epic'
    },

    // Special achievements
    early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete 5 tasks before 8 AM',
        icon: '🌅',
        category: 'special',
        requirement: { type: 'early_tasks', value: 5 },
        xpReward: 100,
        rarity: 'uncommon'
    },
    night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 5 tasks after 10 PM',
        icon: '🦉',
        category: 'special',
        requirement: { type: 'late_tasks', value: 5 },
        xpReward: 100,
        rarity: 'uncommon'
    },
    weekend_warrior: {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Complete 20 tasks on weekends',
        icon: '🎉',
        category: 'special',
        requirement: { type: 'weekend_tasks', value: 20 },
        xpReward: 150,
        rarity: 'uncommon'
    },
    focus_master: {
        id: 'focus_master',
        name: 'Focus Master',
        description: 'Complete 50 focus timer sessions',
        icon: '⏱️',
        category: 'special',
        requirement: { type: 'focus_sessions', value: 50 },
        xpReward: 300,
        rarity: 'rare'
    },
    challenge_champion: {
        id: 'challenge_champion',
        name: 'Challenge Champion',
        description: 'Complete 10 challenges',
        icon: '🏅',
        category: 'special',
        requirement: { type: 'challenges_completed', value: 10 },
        xpReward: 400,
        rarity: 'rare'
    }
};

/* ==========================================================================
   Rewards Store
   ========================================================================== */

const STORE_ITEMS = {
    // Themes
    theme_ocean: {
        id: 'theme_ocean',
        name: 'Ocean Theme',
        description: 'Calm blue color scheme',
        icon: '🌊',
        category: 'theme',
        price: 500,
        type: 'permanent'
    },
    theme_forest: {
        id: 'theme_forest',
        name: 'Forest Theme',
        description: 'Natural green color scheme',
        icon: '🌲',
        category: 'theme',
        price: 500,
        type: 'permanent'
    },
    theme_sunset: {
        id: 'theme_sunset',
        name: 'Sunset Theme',
        description: 'Warm orange and pink colors',
        icon: '🌅',
        category: 'theme',
        price: 500,
        type: 'permanent'
    },
    theme_galaxy: {
        id: 'theme_galaxy',
        name: 'Galaxy Theme',
        description: 'Deep space purple theme',
        icon: '🌌',
        category: 'theme',
        price: 750,
        type: 'permanent'
    },

    // Profile badges
    badge_fire: {
        id: 'badge_fire',
        name: 'Fire Badge',
        description: 'Show your hot streak',
        icon: '🔥',
        category: 'badge',
        price: 200,
        type: 'permanent'
    },
    badge_star: {
        id: 'badge_star',
        name: 'Star Badge',
        description: 'Shine bright',
        icon: '⭐',
        category: 'badge',
        price: 200,
        type: 'permanent'
    },
    badge_crown: {
        id: 'badge_crown',
        name: 'Crown Badge',
        description: 'Rule your goals',
        icon: '👑',
        category: 'badge',
        price: 500,
        type: 'permanent'
    },
    badge_diamond: {
        id: 'badge_diamond',
        name: 'Diamond Badge',
        description: 'Unbreakable dedication',
        icon: '💎',
        category: 'badge',
        price: 1000,
        type: 'permanent'
    },

    // Boosters
    xp_boost_2x: {
        id: 'xp_boost_2x',
        name: '2x XP Boost',
        description: 'Double XP for 24 hours',
        icon: '⚡',
        category: 'booster',
        price: 300,
        type: 'consumable',
        duration: 24 * 60 * 60 * 1000 // 24 hours
    },
    streak_shield: {
        id: 'streak_shield',
        name: 'Streak Shield',
        description: 'Protect your streak for one missed day',
        icon: '🛡️',
        category: 'booster',
        price: 400,
        type: 'consumable'
    },
    bonus_challenge: {
        id: 'bonus_challenge',
        name: 'Bonus Challenge',
        description: 'Unlock an extra daily challenge',
        icon: '🎯',
        category: 'booster',
        price: 250,
        type: 'consumable'
    }
};

/* ==========================================================================
   State
   ========================================================================== */

let rewardsState = {
    unlockedAchievements: [],
    purchasedItems: [],
    activeBoosts: [],
    coins: 0,
    equippedBadge: null,
    equippedTheme: null
};

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initRewards() {
    console.log('[Rewards] Initializing...');
    await loadRewardsData();
    checkAllAchievements();
    console.log('[Rewards] Initialized with', rewardsState.unlockedAchievements.length, 'achievements');
}

async function loadRewardsData() {
    try {
        const saved = localStorage.getItem('rewardsData');
        if (saved) {
            Object.assign(rewardsState, JSON.parse(saved));
        }

        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('gamification')
                .doc('rewards')
                .get();

            if (doc.exists) {
                const data = doc.data();
                rewardsState.unlockedAchievements = data.achievements || rewardsState.unlockedAchievements;
                rewardsState.purchasedItems = data.purchased || rewardsState.purchasedItems;
                rewardsState.coins = data.coins || rewardsState.coins;
                rewardsState.equippedBadge = data.equippedBadge || null;
                rewardsState.equippedTheme = data.equippedTheme || null;
            }
        }

        // Clean up expired boosts
        rewardsState.activeBoosts = rewardsState.activeBoosts.filter(boost => {
            return !boost.expiresAt || new Date(boost.expiresAt) > new Date();
        });
    } catch (error) {
        console.error('[Rewards] Load error:', error);
    }
}

async function saveRewardsData() {
    try {
        localStorage.setItem('rewardsData', JSON.stringify(rewardsState));

        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('gamification')
                .doc('rewards')
                .set({
                    achievements: rewardsState.unlockedAchievements,
                    purchased: rewardsState.purchasedItems,
                    coins: rewardsState.coins,
                    equippedBadge: rewardsState.equippedBadge,
                    equippedTheme: rewardsState.equippedTheme,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        }
    } catch (error) {
        console.error('[Rewards] Save error:', error);
    }
}

/* ==========================================================================
   Achievement System
   ========================================================================== */

function checkAllAchievements() {
    const stats = gatherAchievementStats();

    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!rewardsState.unlockedAchievements.includes(achievement.id)) {
            if (checkAchievementRequirement(achievement, stats)) {
                unlockAchievement(achievement);
            }
        }
    });
}

function gatherAchievementStats() {
    const stats = {
        streak: appState.userStats?.streak || 0,
        tasks_completed: appState.userStats?.tasksCompleted || 0,
        moods_logged: appState.moodHistory?.length || 0,
        mood_streak: calculateMoodStreak(),
        great_moods: countGreatMoods(),
        journal_entries: appState.journalEntries?.length || 0,
        level: appState.userStats?.level || 1,
        early_tasks: countEarlyTasks(),
        late_tasks: countLateTasks(),
        weekend_tasks: countWeekendTasks(),
        focus_sessions: parseInt(localStorage.getItem('focusSessionCount') || '0'),
        challenges_completed: parseInt(localStorage.getItem('challengesCompleted') || '0')
    };

    return stats;
}

function checkAchievementRequirement(achievement, stats) {
    const req = achievement.requirement;
    const value = stats[req.type] || 0;
    return value >= req.value;
}

function unlockAchievement(achievement) {
    if (rewardsState.unlockedAchievements.includes(achievement.id)) return;

    rewardsState.unlockedAchievements.push(achievement.id);
    
    // Award XP
    if (typeof addXP === 'function') {
        addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
    }

    // Award coins (10% of XP)
    rewardsState.coins += Math.round(achievement.xpReward * 0.1);

    saveRewardsData();
    showAchievementUnlocked(achievement);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: { achievement }
    }));
}

function showAchievementUnlocked(achievement) {
    const modal = document.createElement('div');
    modal.className = 'modal achievement-modal';
    modal.id = 'achievementModal';
    modal.innerHTML = `
        <div class="modal-content celebration">
            <div class="achievement-unlock-animation">
                <div class="achievement-icon ${achievement.rarity}">${achievement.icon}</div>
            </div>
            <h2>Achievement Unlocked!</h2>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <div class="achievement-rewards">
                <span class="xp-reward">+${achievement.xpReward} XP</span>
                <span class="coin-reward">+${Math.round(achievement.xpReward * 0.1)} 🪙</span>
            </div>
            <span class="rarity-badge ${achievement.rarity}">${achievement.rarity}</span>
            <button class="btn-primary" onclick="this.closest('.modal').remove()">
                Awesome!
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => modal.remove(), 6000);
}

// Helper functions for stats
function calculateMoodStreak() {
    if (!appState.moodHistory || appState.moodHistory.length === 0) return 0;
    
    let streak = 0;
    const sorted = [...appState.moodHistory].sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp?.toDate?.());
        const dateB = new Date(b.date || b.timestamp?.toDate?.());
        return dateB - dateA;
    });

    const today = new Date().toISOString().split('T')[0];
    let expectedDate = today;

    for (const entry of sorted) {
        const entryDate = entry.date || (entry.timestamp?.toDate?.()?.toISOString().split('T')[0]);
        if (entryDate === expectedDate) {
            streak++;
            const prevDate = new Date(expectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            expectedDate = prevDate.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    return streak;
}

function countGreatMoods() {
    return (appState.moodHistory || []).filter(m => m.mood === 'great').length;
}

function countEarlyTasks() {
    return (appState.tasks || []).filter(t => {
        if (!t.completed || !t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        return hour < 8;
    }).length;
}

function countLateTasks() {
    return (appState.tasks || []).filter(t => {
        if (!t.completed || !t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        return hour >= 22;
    }).length;
}

function countWeekendTasks() {
    return (appState.tasks || []).filter(t => {
        if (!t.completed || !t.completedAt) return false;
        const day = new Date(t.completedAt).getDay();
        return day === 0 || day === 6;
    }).length;
}

/* ==========================================================================
   Store System
   ========================================================================== */

function purchaseItem(itemId) {
    const item = STORE_ITEMS[itemId];
    if (!item) return { success: false, error: 'Item not found' };

    if (rewardsState.coins < item.price) {
        return { success: false, error: 'Not enough coins' };
    }

    if (item.type === 'permanent' && rewardsState.purchasedItems.includes(itemId)) {
        return { success: false, error: 'Already owned' };
    }

    rewardsState.coins -= item.price;
    
    if (item.type === 'permanent') {
        rewardsState.purchasedItems.push(itemId);
    } else if (item.type === 'consumable') {
        const boost = {
            itemId,
            activatedAt: new Date().toISOString(),
            expiresAt: item.duration ? new Date(Date.now() + item.duration).toISOString() : null
        };
        rewardsState.activeBoosts.push(boost);
    }

    saveRewardsData();

    if (typeof showToast === 'function') {
        showToast(`Purchased ${item.name}! ${item.icon}`);
    }

    return { success: true };
}

function equipBadge(badgeId) {
    if (!rewardsState.purchasedItems.includes(badgeId)) {
        return { success: false, error: 'Badge not owned' };
    }

    rewardsState.equippedBadge = badgeId;
    saveRewardsData();
    return { success: true };
}

function equipTheme(themeId) {
    if (!rewardsState.purchasedItems.includes(themeId)) {
        return { success: false, error: 'Theme not owned' };
    }

    rewardsState.equippedTheme = themeId;
    applyTheme(themeId);
    saveRewardsData();
    return { success: true };
}

function applyTheme(themeId) {
    const themes = {
        theme_ocean: { primary: '#0ea5e9', secondary: '#06b6d4' },
        theme_forest: { primary: '#22c55e', secondary: '#10b981' },
        theme_sunset: { primary: '#f97316', secondary: '#ec4899' },
        theme_galaxy: { primary: '#8b5cf6', secondary: '#a855f7' }
    };

    const theme = themes[themeId];
    if (theme) {
        document.documentElement.style.setProperty('--accent-primary', theme.primary);
        document.documentElement.style.setProperty('--accent-secondary', theme.secondary);
    }
}

function hasActiveBoost(boostType) {
    return rewardsState.activeBoosts.some(boost => {
        if (boost.itemId !== boostType) return false;
        if (boost.expiresAt && new Date(boost.expiresAt) < new Date()) return false;
        return true;
    });
}

function useStreakShield() {
    const shieldIndex = rewardsState.activeBoosts.findIndex(b => b.itemId === 'streak_shield');
    if (shieldIndex === -1) return false;

    rewardsState.activeBoosts.splice(shieldIndex, 1);
    saveRewardsData();
    return true;
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderRewardsStore() {
    const container = document.getElementById('rewardsContainer');
    if (!container) return;

    const unlockedCount = rewardsState.unlockedAchievements.length;
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;

    container.innerHTML = `
        <div class="rewards-section">
            <div class="rewards-header">
                <h2>🏆 Rewards & Achievements</h2>
                <div class="coin-balance">
                    <span class="coins">🪙 ${rewardsState.coins}</span>
                </div>
            </div>

            <div class="rewards-tabs">
                <button class="tab-btn active" onclick="showRewardsTab('achievements')">Achievements</button>
                <button class="tab-btn" onclick="showRewardsTab('store')">Store</button>
                <button class="tab-btn" onclick="showRewardsTab('inventory')">Inventory</button>
            </div>

            <div id="achievementsTab" class="tab-content active">
                <div class="achievements-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(unlockedCount / totalAchievements) * 100}%"></div>
                    </div>
                    <span>${unlockedCount}/${totalAchievements} Unlocked</span>
                </div>

                <div class="achievements-grid">
                    ${Object.values(ACHIEVEMENTS).map(achievement => {
                        const unlocked = rewardsState.unlockedAchievements.includes(achievement.id);
                        return `
                            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'} ${achievement.rarity}">
                                <div class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</div>
                                <div class="achievement-info">
                                    <h4>${achievement.name}</h4>
                                    <p>${achievement.description}</p>
                                    <span class="rarity-badge ${achievement.rarity}">${achievement.rarity}</span>
                                </div>
                                ${unlocked ? `<span class="xp-earned">+${achievement.xpReward} XP</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div id="storeTab" class="tab-content" style="display: none;">
                <div class="store-categories">
                    <h3>🎨 Themes</h3>
                    <div class="store-items">
                        ${Object.values(STORE_ITEMS).filter(i => i.category === 'theme').map(item => renderStoreItem(item)).join('')}
                    </div>

                    <h3>🏅 Badges</h3>
                    <div class="store-items">
                        ${Object.values(STORE_ITEMS).filter(i => i.category === 'badge').map(item => renderStoreItem(item)).join('')}
                    </div>

                    <h3>⚡ Boosters</h3>
                    <div class="store-items">
                        ${Object.values(STORE_ITEMS).filter(i => i.category === 'booster').map(item => renderStoreItem(item)).join('')}
                    </div>
                </div>
            </div>

            <div id="inventoryTab" class="tab-content" style="display: none;">
                <h3>📦 Your Items</h3>
                ${rewardsState.purchasedItems.length > 0 ? `
                    <div class="inventory-items">
                        ${rewardsState.purchasedItems.map(itemId => {
                            const item = STORE_ITEMS[itemId];
                            if (!item) return '';
                            const isEquipped = rewardsState.equippedBadge === itemId || rewardsState.equippedTheme === itemId;
                            return `
                                <div class="inventory-item ${isEquipped ? 'equipped' : ''}">
                                    <span class="item-icon">${item.icon}</span>
                                    <span class="item-name">${item.name}</span>
                                    ${item.category === 'badge' || item.category === 'theme' ? `
                                        <button class="btn-sm ${isEquipped ? 'btn-secondary' : 'btn-primary'}" 
                                                onclick="${item.category === 'badge' ? `equipBadge('${itemId}')` : `equipTheme('${itemId}')`}; renderRewardsStore();">
                                            ${isEquipped ? 'Equipped' : 'Equip'}
                                        </button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p class="empty-state">No items yet. Visit the store!</p>'}

                ${rewardsState.activeBoosts.length > 0 ? `
                    <h3>⚡ Active Boosts</h3>
                    <div class="active-boosts">
                        ${rewardsState.activeBoosts.map(boost => {
                            const item = STORE_ITEMS[boost.itemId];
                            const timeLeft = boost.expiresAt ? getTimeLeft(boost.expiresAt) : 'Until used';
                            return `
                                <div class="boost-item">
                                    <span class="boost-icon">${item?.icon || '⚡'}</span>
                                    <span class="boost-name">${item?.name || 'Boost'}</span>
                                    <span class="boost-time">${timeLeft}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderStoreItem(item) {
    const owned = rewardsState.purchasedItems.includes(item.id);
    const canAfford = rewardsState.coins >= item.price;

    return `
        <div class="store-item ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'unaffordable' : ''}">
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
            </div>
            <div class="item-price">
                ${owned && item.type === 'permanent' 
                    ? '<span class="owned-badge">Owned</span>'
                    : `<button class="btn-primary btn-sm" onclick="purchaseItem('${item.id}'); renderRewardsStore();" ${!canAfford ? 'disabled' : ''}>
                        🪙 ${item.price}
                       </button>`
                }
            </div>
        </div>
    `;
}

function showRewardsTab(tabName) {
    document.querySelectorAll('.rewards-section .tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.rewards-section .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}Tab`).style.display = 'block';
    event.target.classList.add('active');
}

function getTimeLeft(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initRewards = initRewards;
window.checkAllAchievements = checkAllAchievements;
window.unlockAchievement = unlockAchievement;
window.purchaseItem = purchaseItem;
window.equipBadge = equipBadge;
window.equipTheme = equipTheme;
window.hasActiveBoost = hasActiveBoost;
window.useStreakShield = useStreakShield;
window.renderRewardsStore = renderRewardsStore;
window.showRewardsTab = showRewardsTab;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.STORE_ITEMS = STORE_ITEMS;
window.rewardsState = rewardsState;
