/**
 * @fileoverview Challenges & Competitions System
 * @description Weekly/monthly challenges, personal goals, streaks, seasonal events
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Challenge Definitions
   ========================================================================== */

const CHALLENGE_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    SEASONAL: 'seasonal',
    PERSONAL: 'personal'
};

const CHALLENGE_CATEGORIES = {
    TASKS: 'tasks',
    MOOD: 'mood',
    HABITS: 'habits',
    JOURNAL: 'journal',
    STREAK: 'streak',
    WELLNESS: 'wellness'
};

// Pre-defined challenges
const CHALLENGE_TEMPLATES = {
    // Daily Challenges
    daily_task_warrior: {
        id: 'daily_task_warrior',
        name: 'Task Warrior',
        description: 'Complete 5 tasks today',
        type: CHALLENGE_TYPES.DAILY,
        category: CHALLENGE_CATEGORIES.TASKS,
        target: 5,
        metric: 'tasksCompleted',
        xpReward: 50,
        icon: '⚔️'
    },
    daily_early_bird: {
        id: 'daily_early_bird',
        name: 'Early Bird',
        description: 'Complete 3 tasks before noon',
        type: CHALLENGE_TYPES.DAILY,
        category: CHALLENGE_CATEGORIES.TASKS,
        target: 3,
        metric: 'earlyTasks',
        xpReward: 40,
        icon: '🌅'
    },
    daily_mood_master: {
        id: 'daily_mood_master',
        name: 'Mood Master',
        description: 'Log your mood today',
        type: CHALLENGE_TYPES.DAILY,
        category: CHALLENGE_CATEGORIES.MOOD,
        target: 1,
        metric: 'moodLogged',
        xpReward: 20,
        icon: '😊'
    },
    daily_reflector: {
        id: 'daily_reflector',
        name: 'Daily Reflector',
        description: 'Write a journal entry',
        type: CHALLENGE_TYPES.DAILY,
        category: CHALLENGE_CATEGORIES.JOURNAL,
        target: 1,
        metric: 'journalEntries',
        xpReward: 30,
        icon: '📝'
    },

    // Weekly Challenges
    weekly_task_champion: {
        id: 'weekly_task_champion',
        name: 'Task Champion',
        description: 'Complete 25 tasks this week',
        type: CHALLENGE_TYPES.WEEKLY,
        category: CHALLENGE_CATEGORIES.TASKS,
        target: 25,
        metric: 'weeklyTasks',
        xpReward: 200,
        icon: '🏆'
    },
    weekly_consistency: {
        id: 'weekly_consistency',
        name: 'Consistency King',
        description: 'Log tasks for 7 consecutive days',
        type: CHALLENGE_TYPES.WEEKLY,
        category: CHALLENGE_CATEGORIES.STREAK,
        target: 7,
        metric: 'consecutiveDays',
        xpReward: 250,
        icon: '👑'
    },
    weekly_mood_tracker: {
        id: 'weekly_mood_tracker',
        name: 'Mood Explorer',
        description: 'Log your mood 5 times this week',
        type: CHALLENGE_TYPES.WEEKLY,
        category: CHALLENGE_CATEGORIES.MOOD,
        target: 5,
        metric: 'weeklyMoods',
        xpReward: 100,
        icon: '🎭'
    },
    weekly_journal_master: {
        id: 'weekly_journal_master',
        name: 'Journal Master',
        description: 'Write 3 journal entries this week',
        type: CHALLENGE_TYPES.WEEKLY,
        category: CHALLENGE_CATEGORIES.JOURNAL,
        target: 3,
        metric: 'weeklyJournals',
        xpReward: 150,
        icon: '📚'
    },
    weekly_perfectionist: {
        id: 'weekly_perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% task completion for 3 days',
        type: CHALLENGE_TYPES.WEEKLY,
        category: CHALLENGE_CATEGORIES.TASKS,
        target: 3,
        metric: 'perfectDays',
        xpReward: 300,
        icon: '💯'
    },

    // Monthly Challenges
    monthly_legend: {
        id: 'monthly_legend',
        name: 'Monthly Legend',
        description: 'Complete 100 tasks this month',
        type: CHALLENGE_TYPES.MONTHLY,
        category: CHALLENGE_CATEGORIES.TASKS,
        target: 100,
        metric: 'monthlyTasks',
        xpReward: 500,
        icon: '🌟'
    },
    monthly_streak_master: {
        id: 'monthly_streak_master',
        name: 'Streak Master',
        description: 'Maintain a 21-day streak',
        type: CHALLENGE_TYPES.MONTHLY,
        category: CHALLENGE_CATEGORIES.STREAK,
        target: 21,
        metric: 'streakDays',
        xpReward: 600,
        icon: '🔥'
    },
    monthly_wellness: {
        id: 'monthly_wellness',
        name: 'Wellness Warrior',
        description: 'Complete all daily wellness tasks for 15 days',
        type: CHALLENGE_TYPES.MONTHLY,
        category: CHALLENGE_CATEGORIES.WELLNESS,
        target: 15,
        metric: 'wellnessDays',
        xpReward: 400,
        icon: '🧘'
    },
    monthly_mindful: {
        id: 'monthly_mindful',
        name: 'Mindful Month',
        description: 'Log mood and journal every day for 2 weeks',
        type: CHALLENGE_TYPES.MONTHLY,
        category: CHALLENGE_CATEGORIES.MOOD,
        target: 14,
        metric: 'mindfulDays',
        xpReward: 450,
        icon: '🧠'
    }
};

// Seasonal Events
const SEASONAL_EVENTS = {
    new_year_reset: {
        id: 'new_year_reset',
        name: 'New Year Reset',
        description: 'Start the year strong! Complete daily challenges for 7 days.',
        startMonth: 0, // January
        startDay: 1,
        duration: 14, // days
        challenges: ['daily_task_warrior', 'daily_mood_master', 'daily_reflector'],
        bonusMultiplier: 2,
        icon: '🎆',
        badge: 'new_year_champion'
    },
    spring_renewal: {
        id: 'spring_renewal',
        name: 'Spring Renewal',
        description: 'Refresh your habits for spring!',
        startMonth: 2, // March
        startDay: 20,
        duration: 14,
        challenges: ['weekly_consistency', 'weekly_mood_tracker'],
        bonusMultiplier: 1.5,
        icon: '🌸',
        badge: 'spring_champion'
    },
    summer_challenge: {
        id: 'summer_challenge',
        name: 'Summer Challenge',
        description: 'Stay consistent through summer!',
        startMonth: 5, // June
        startDay: 21,
        duration: 21,
        challenges: ['weekly_task_champion', 'weekly_perfectionist'],
        bonusMultiplier: 1.5,
        icon: '☀️',
        badge: 'summer_champion'
    },
    fall_focus: {
        id: 'fall_focus',
        name: 'Fall Focus',
        description: 'Get focused this autumn!',
        startMonth: 8, // September
        startDay: 22,
        duration: 14,
        challenges: ['weekly_journal_master', 'daily_early_bird'],
        bonusMultiplier: 1.5,
        icon: '🍂',
        badge: 'fall_champion'
    },
    year_end_sprint: {
        id: 'year_end_sprint',
        name: 'Year-End Sprint',
        description: 'Finish the year strong!',
        startMonth: 11, // December
        startDay: 15,
        duration: 17,
        challenges: ['monthly_legend', 'weekly_consistency'],
        bonusMultiplier: 2,
        icon: '🎄',
        badge: 'year_end_champion'
    }
};

/* ==========================================================================
   Challenge State
   ========================================================================== */

let activeChallenges = [];
let completedChallenges = [];
let personalChallenges = [];
let challengeStats = {
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    xpEarned: 0
};

/* ==========================================================================
   Challenge Management
   ========================================================================== */

/**
 * Initialize challenges system
 */
async function initChallenges() {
    console.log('[Challenges] Initializing challenges system');
    await loadChallengesFromStorage();
    await refreshDailyChallenges();
    await checkSeasonalEvents();
    renderChallengesUI();
}

/**
 * Load challenges from storage
 */
async function loadChallengesFromStorage() {
    try {
        if (db && appState.currentUser) {
            const doc = await db.collection('users').doc(appState.currentUser.uid)
                .collection('challenges').doc('state').get();
            
            if (doc.exists) {
                const data = doc.data();
                activeChallenges = data.active || [];
                completedChallenges = data.completed || [];
                personalChallenges = data.personal || [];
                challengeStats = data.stats || challengeStats;
            }
        } else {
            // Load from localStorage
            const cached = localStorage.getItem('life_reset_challenges');
            if (cached) {
                const data = JSON.parse(cached);
                activeChallenges = data.active || [];
                completedChallenges = data.completed || [];
                personalChallenges = data.personal || [];
                challengeStats = data.stats || challengeStats;
            }
        }
    } catch (error) {
        console.warn('[Challenges] Error loading challenges:', error);
    }
}

/**
 * Save challenges to storage
 */
async function saveChallenges() {
    const data = {
        active: activeChallenges,
        completed: completedChallenges,
        personal: personalChallenges,
        stats: challengeStats,
        lastUpdated: new Date().toISOString()
    };

    try {
        if (db && appState.currentUser) {
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('challenges').doc('state').set(data, { merge: true });
        }
        localStorage.setItem('life_reset_challenges', JSON.stringify(data));
    } catch (error) {
        console.warn('[Challenges] Error saving challenges:', error);
    }
}

/**
 * Refresh daily challenges
 */
async function refreshDailyChallenges() {
    const today = getDateString(new Date());
    const lastRefresh = localStorage.getItem('challenges_last_refresh');
    
    if (lastRefresh !== today) {
        // Remove expired daily challenges
        activeChallenges = activeChallenges.filter(c => c.type !== CHALLENGE_TYPES.DAILY);
        
        // Add new daily challenges
        const dailyChallenges = Object.values(CHALLENGE_TEMPLATES)
            .filter(c => c.type === CHALLENGE_TYPES.DAILY);
        
        // Randomly select 3 daily challenges
        const shuffled = dailyChallenges.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        selected.forEach(template => {
            activeChallenges.push({
                ...template,
                startDate: today,
                expiresAt: getEndOfDay(),
                progress: 0,
                completed: false
            });
        });
        
        localStorage.setItem('challenges_last_refresh', today);
        await saveChallenges();
    }
    
    // Check weekly challenges
    await refreshWeeklyChallenges();
}

/**
 * Refresh weekly challenges
 */
async function refreshWeeklyChallenges() {
    const now = new Date();
    const weekStart = getStartOfWeek(now);
    const weekKey = getDateString(weekStart);
    const lastWeekRefresh = localStorage.getItem('challenges_week_refresh');
    
    if (lastWeekRefresh !== weekKey) {
        // Remove expired weekly challenges
        activeChallenges = activeChallenges.filter(c => c.type !== CHALLENGE_TYPES.WEEKLY);
        
        // Add new weekly challenges
        const weeklyChallenges = Object.values(CHALLENGE_TEMPLATES)
            .filter(c => c.type === CHALLENGE_TYPES.WEEKLY);
        
        // Select 2 random weekly challenges
        const shuffled = weeklyChallenges.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        
        selected.forEach(template => {
            activeChallenges.push({
                ...template,
                startDate: weekKey,
                expiresAt: getEndOfWeek(),
                progress: 0,
                completed: false
            });
        });
        
        localStorage.setItem('challenges_week_refresh', weekKey);
        await saveChallenges();
    }
}

/**
 * Check for active seasonal events
 */
async function checkSeasonalEvents() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    for (const event of Object.values(SEASONAL_EVENTS)) {
        const eventStart = new Date(now.getFullYear(), event.startMonth, event.startDay);
        const eventEnd = new Date(eventStart.getTime() + event.duration * 24 * 60 * 60 * 1000);
        
        if (now >= eventStart && now <= eventEnd) {
            // Check if event already added
            const exists = activeChallenges.find(c => c.seasonalEvent === event.id);
            if (!exists) {
                // Add seasonal challenge
                activeChallenges.push({
                    id: `seasonal_${event.id}`,
                    name: event.name,
                    description: event.description,
                    type: CHALLENGE_TYPES.SEASONAL,
                    icon: event.icon,
                    seasonalEvent: event.id,
                    challenges: event.challenges,
                    bonusMultiplier: event.bonusMultiplier,
                    badge: event.badge,
                    startDate: getDateString(eventStart),
                    expiresAt: eventEnd,
                    progress: 0,
                    target: event.challenges.length * event.duration,
                    completed: false,
                    xpReward: 1000
                });
                
                showToast(`🎉 ${event.name} event has started!`, 'success');
                await saveChallenges();
            }
        }
    }
}

/* ==========================================================================
   Challenge Progress Tracking
   ========================================================================== */

/**
 * Update challenge progress
 * @param {string} metric - The metric being updated
 * @param {number} value - The value to add
 */
async function updateChallengeProgress(metric, value = 1) {
    let updated = false;
    
    for (const challenge of activeChallenges) {
        if (challenge.completed) continue;
        
        if (challenge.metric === metric || shouldUpdateChallenge(challenge, metric)) {
            challenge.progress = Math.min(challenge.progress + value, challenge.target);
            updated = true;
            
            // Check if completed
            if (challenge.progress >= challenge.target) {
                await completeChallenge(challenge);
            }
        }
    }
    
    if (updated) {
        await saveChallenges();
        renderChallengesUI();
    }
}

/**
 * Check if a challenge should be updated based on metric
 */
function shouldUpdateChallenge(challenge, metric) {
    const metricMappings = {
        tasksCompleted: ['weeklyTasks', 'monthlyTasks'],
        moodLogged: ['weeklyMoods'],
        journalEntries: ['weeklyJournals'],
        consecutiveDays: ['streakDays']
    };
    
    return metricMappings[metric]?.includes(challenge.metric);
}

/**
 * Complete a challenge
 * @param {Object} challenge - The challenge to complete
 */
async function completeChallenge(challenge) {
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();
    
    // Calculate XP with any bonuses
    let xpReward = challenge.xpReward || 50;
    if (challenge.bonusMultiplier) {
        xpReward = Math.round(xpReward * challenge.bonusMultiplier);
    }
    
    // Award XP
    if (typeof addXP === 'function') {
        addXP(xpReward);
    }
    
    // Update stats
    challengeStats.totalCompleted++;
    challengeStats.xpEarned += xpReward;
    
    // Move to completed
    completedChallenges.push({
        ...challenge,
        xpAwarded: xpReward
    });
    
    // Remove from active
    activeChallenges = activeChallenges.filter(c => c.id !== challenge.id);
    
    // Show celebration
    showChallengeComplete(challenge, xpReward);
    
    // Check for badge unlock
    if (challenge.badge) {
        unlockChallengeBadge(challenge.badge);
    }
    
    await saveChallenges();
}

/**
 * Show challenge completion celebration
 */
function showChallengeComplete(challenge, xpReward) {
    showToast(`🎉 Challenge Complete: ${challenge.name}! +${xpReward} XP`, 'success');
    
    // Create celebration modal
    const modal = document.createElement('div');
    modal.className = 'challenge-complete-modal';
    modal.innerHTML = `
        <div class="challenge-complete-content">
            <div class="challenge-complete-icon">${challenge.icon}</div>
            <h2>Challenge Complete!</h2>
            <h3>${challenge.name}</h3>
            <p>${challenge.description}</p>
            <div class="challenge-reward">
                <span class="xp-badge">+${xpReward} XP</span>
            </div>
            <button class="btn-primary" onclick="this.closest('.challenge-complete-modal').remove()">
                Awesome! 🎉
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => modal.remove(), 5000);
}

/* ==========================================================================
   Personal Challenges
   ========================================================================== */

/**
 * Create a personal challenge
 */
function createPersonalChallenge(name, description, target, metric, duration, xpReward = 100) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const challenge = {
        id: `personal_${Date.now()}`,
        name,
        description,
        type: CHALLENGE_TYPES.PERSONAL,
        category: CHALLENGE_CATEGORIES.TASKS,
        target,
        metric,
        xpReward,
        icon: '🎯',
        startDate: getDateString(now),
        expiresAt,
        progress: 0,
        completed: false,
        isPersonal: true
    };
    
    activeChallenges.push(challenge);
    personalChallenges.push(challenge);
    saveChallenges();
    renderChallengesUI();
    
    showToast(`Personal challenge created: ${name}`, 'success');
    return challenge;
}

/**
 * Show create personal challenge modal
 */
function showCreateChallengeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal challenge-create-modal';
    modal.id = 'createChallengeModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎯 Create Personal Challenge</h3>
                <button class="close-btn" onclick="closeCreateChallengeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Challenge Name</label>
                    <input type="text" id="challengeName" placeholder="e.g., Read 30 minutes daily" maxlength="50">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="challengeDesc" placeholder="What do you want to achieve?" maxlength="200"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Target</label>
                        <input type="number" id="challengeTarget" value="7" min="1" max="100">
                    </div>
                    <div class="form-group">
                        <label>Duration (days)</label>
                        <input type="number" id="challengeDuration" value="7" min="1" max="30">
                    </div>
                </div>
                <div class="form-group">
                    <label>Track</label>
                    <select id="challengeMetric">
                        <option value="tasksCompleted">Tasks Completed</option>
                        <option value="consecutiveDays">Consecutive Days</option>
                        <option value="moodLogged">Mood Logs</option>
                        <option value="journalEntries">Journal Entries</option>
                        <option value="custom">Custom Count</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>XP Reward</label>
                    <input type="number" id="challengeXP" value="100" min="10" max="500" step="10">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeCreateChallengeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitPersonalChallenge()">Create Challenge</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeCreateChallengeModal() {
    const modal = document.getElementById('createChallengeModal');
    if (modal) modal.remove();
}

function submitPersonalChallenge() {
    const name = document.getElementById('challengeName').value.trim();
    const desc = document.getElementById('challengeDesc').value.trim();
    const target = parseInt(document.getElementById('challengeTarget').value) || 7;
    const duration = parseInt(document.getElementById('challengeDuration').value) || 7;
    const metric = document.getElementById('challengeMetric').value;
    const xp = parseInt(document.getElementById('challengeXP').value) || 100;
    
    if (!name) {
        showToast('Please enter a challenge name', 'error');
        return;
    }
    
    createPersonalChallenge(name, desc || name, target, metric, duration, xp);
    closeCreateChallengeModal();
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

/**
 * Render challenges UI
 */
function renderChallengesUI() {
    const container = document.getElementById('challengesContainer');
    if (!container) return;
    
    const dailyChallenges = activeChallenges.filter(c => c.type === CHALLENGE_TYPES.DAILY);
    const weeklyChallenges = activeChallenges.filter(c => c.type === CHALLENGE_TYPES.WEEKLY);
    const seasonalChallenges = activeChallenges.filter(c => c.type === CHALLENGE_TYPES.SEASONAL);
    const personal = activeChallenges.filter(c => c.type === CHALLENGE_TYPES.PERSONAL);
    
    container.innerHTML = `
        <div class="challenges-header">
            <h2>🎯 Challenges</h2>
            <button class="btn-primary btn-sm" onclick="showCreateChallengeModal()">
                <i class="fas fa-plus"></i> Create Challenge
            </button>
        </div>
        
        <div class="challenges-stats">
            <div class="stat-card">
                <span class="stat-value">${challengeStats.totalCompleted}</span>
                <span class="stat-label">Completed</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${challengeStats.xpEarned}</span>
                <span class="stat-label">XP Earned</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${activeChallenges.length}</span>
                <span class="stat-label">Active</span>
            </div>
        </div>
        
        ${seasonalChallenges.length ? `
            <div class="challenges-section seasonal">
                <h3>🎄 Seasonal Events</h3>
                <div class="challenges-grid">
                    ${seasonalChallenges.map(c => renderChallengeCard(c)).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="challenges-section">
            <h3>📅 Daily Challenges</h3>
            <div class="challenges-grid">
                ${dailyChallenges.length ? dailyChallenges.map(c => renderChallengeCard(c)).join('') : 
                    '<p class="empty-state">No daily challenges available</p>'}
            </div>
        </div>
        
        <div class="challenges-section">
            <h3>📆 Weekly Challenges</h3>
            <div class="challenges-grid">
                ${weeklyChallenges.length ? weeklyChallenges.map(c => renderChallengeCard(c)).join('') : 
                    '<p class="empty-state">No weekly challenges available</p>'}
            </div>
        </div>
        
        ${personal.length ? `
            <div class="challenges-section personal">
                <h3>🎯 Personal Challenges</h3>
                <div class="challenges-grid">
                    ${personal.map(c => renderChallengeCard(c)).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="challenges-section completed">
            <h3>✅ Recently Completed</h3>
            <div class="completed-list">
                ${completedChallenges.slice(-5).reverse().map(c => `
                    <div class="completed-item">
                        <span class="icon">${c.icon}</span>
                        <span class="name">${c.name}</span>
                        <span class="xp">+${c.xpAwarded} XP</span>
                    </div>
                `).join('') || '<p class="empty-state">No completed challenges yet</p>'}
            </div>
        </div>
    `;
}

/**
 * Render a single challenge card
 */
function renderChallengeCard(challenge) {
    const progress = Math.round((challenge.progress / challenge.target) * 100);
    const timeLeft = getTimeRemaining(challenge.expiresAt);
    
    return `
        <div class="challenge-card ${challenge.completed ? 'completed' : ''} ${challenge.type}">
            <div class="challenge-icon">${challenge.icon}</div>
            <div class="challenge-info">
                <h4>${challenge.name}</h4>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${challenge.progress}/${challenge.target}</span>
                </div>
                <div class="challenge-footer">
                    <span class="time-left">${timeLeft}</span>
                    <span class="xp-reward">🎁 ${challenge.xpReward} XP</span>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   Helper Functions
   ========================================================================== */

function getEndOfDay() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
}

function getEndOfWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = 7 - dayOfWeek;
    const end = new Date(now);
    end.setDate(now.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end;
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getTimeRemaining(expiresAt) {
    if (!expiresAt) return 'No deadline';
    
    const now = new Date();
    const end = new Date(expiresAt);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h';
}

function unlockChallengeBadge(badgeId) {
    // Integrate with existing badge system
    if (typeof checkAndUnlockBadges === 'function') {
        checkAndUnlockBadges();
    }
}

/* ==========================================================================
   Integration Hooks
   ========================================================================== */

// Hook into task completion
window.addEventListener('taskCompleted', () => {
    updateChallengeProgress('tasksCompleted', 1);
});

// Hook into mood logging
window.addEventListener('moodLogged', () => {
    updateChallengeProgress('moodLogged', 1);
});

// Hook into journal entry
window.addEventListener('journalSaved', () => {
    updateChallengeProgress('journalEntries', 1);
});

// Export for global access
window.initChallenges = initChallenges;
window.updateChallengeProgress = updateChallengeProgress;
window.createPersonalChallenge = createPersonalChallenge;
window.showCreateChallengeModal = showCreateChallengeModal;
window.closeCreateChallengeModal = closeCreateChallengeModal;
window.submitPersonalChallenge = submitPersonalChallenge;
window.renderChallengesUI = renderChallengesUI;
