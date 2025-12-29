// Gamification System Functions

let pendingDailyXP = 0;

function queueDailyXP(amount) {
    if (!db || !appState.currentUser || !firebase || !firebase.firestore) return;
    pendingDailyXP += amount;

    const flush = async () => {
        const delta = pendingDailyXP;
        if (delta === 0) return;
        
        // Subtract what we're about to save, not reset to 0
        pendingDailyXP -= delta;
        
        try {
            const dateString = getDateString(new Date());
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('xpDaily').doc(dateString)
                .set({
                    xp: firebase.firestore.FieldValue.increment(delta),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            // Update in-memory history for analytics
            appState.xpDailyHistory[dateString] = (appState.xpDailyHistory[dateString] || 0) + delta;
        } catch (error) {
            console.log('Error saving daily XP:', error);
            // Restore XP if save failed
            pendingDailyXP += delta;
        }
    };

    if (typeof debouncedSave === 'function') {
        debouncedSave('xpDaily', flush, 1000);
    } else {
        flush();
    }
}

function addXP(amount) {
    appState.userStats.xp += amount;
    
    while (appState.userStats.xp >= appState.userStats.xpNeeded) {
        appState.userStats.xp -= appState.userStats.xpNeeded;
        levelUp();
    }
    
    updateGamificationUI();

    // Persist stats smoothly
    if (typeof saveUserStatsRealtime === 'function') {
        saveUserStatsRealtime();
    } else {
        saveUserStats();
    }

    // Record real XP for analytics/history
    queueDailyXP(amount);
}

function levelUp() {
    appState.userStats.level++;
    appState.userStats.xpNeeded = Math.round(100 * Math.pow(1.1, appState.userStats.level - 1));
    showToast(`🎉 Level Up! You are now Level ${appState.userStats.level}!`, 'success');
    celebrateAchievement(`Level ${appState.userStats.level}`, 'fa-star');
}

function updateGamificationUI() {
    // Update level badge
    const levelBadge = document.getElementById('levelBadge');
    if (levelBadge) levelBadge.textContent = appState.userStats.level;
    
    // Update XP bar
    const xpPercentage = (appState.userStats.xp / appState.userStats.xpNeeded) * 100;
    const xpFill = document.getElementById('xpFill');
    const xpText = document.getElementById('xpText');
    if (xpFill) xpFill.style.width = xpPercentage + '%';
    if (xpText) xpText.textContent = `${appState.userStats.xp}/${appState.userStats.xpNeeded} XP`;
    
    // Update streak
    const streakDays = document.getElementById('streakDays');
    if (streakDays) streakDays.textContent = `${appState.userStats.streak} Days`;
    
    // Update health score
    calculateHealthScore();
    const healthScore = document.getElementById('healthScore');
    if (healthScore) healthScore.textContent = Math.round(appState.userStats.healthScore);
    
    // Update stats
    const taskCompletionStat = document.getElementById('taskCompletionStat');
    if (taskCompletionStat) {
        taskCompletionStat.textContent = appState.userStats.tasksCompleted > 0 
            ? Math.round((appState.userStats.tasksCompleted / (appState.userStats.tasksCompleted + 10)) * 100) + '%' 
            : '0%';
    }
    
    const journalEntriesStat = document.getElementById('journalEntriesStat');
    if (journalEntriesStat) journalEntriesStat.textContent = appState.userStats.journalEntries;
    
    const consistencyStat = document.getElementById('consistencyStat');
    if (consistencyStat) consistencyStat.textContent = Math.round(appState.userStats.consistency) + '%';
}

function calculateHealthScore() {
    let score = 0;
    
    // 30 points for task completion
    const taskCompletion = Math.min((appState.userStats.tasksCompleted / 100) * 100, 30);
    score += taskCompletion;
    
    // 20 points for mood tracking
    const moodTracking = Math.min((appState.userStats.moodLogged / 30) * 100, 20);
    score += moodTracking;
    
    // 25 points for streak
    const streakScore = Math.min((appState.userStats.streak / 30) * 100, 25);
    score += streakScore;
    
    // 25 points for consistency
    score += Math.min(appState.userStats.consistency, 25);
    
    appState.userStats.healthScore = Math.min(score, 100);
}

async function loadXPDailyHistory(daysBack = 30) {
    if (!db || !appState.currentUser || !firebase || !firebase.firestore) return;

    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - Math.max(0, daysBack - 1));

        const startId = getDateString(start);
        const endId = getDateString(end);

        const snap = await db.collection('users').doc(appState.currentUser.uid)
            .collection('xpDaily')
            .where(firebase.firestore.FieldPath.documentId(), '>=', startId)
            .where(firebase.firestore.FieldPath.documentId(), '<=', endId)
            .orderBy(firebase.firestore.FieldPath.documentId())
            .get();

        appState.xpDailyHistory = appState.xpDailyHistory || {};
        snap.forEach(doc => {
            const data = doc.data() || {};
            if (typeof data.xp === 'number') {
                appState.xpDailyHistory[doc.id] = data.xp;
            }
        });
    } catch (error) {
        console.log('Error loading XP daily history:', error);
    }
}

function renderBadges() {
    const container = document.getElementById('badgesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    badgesData.forEach(badge => {
        const isUnlocked = appState.userStats.unlockedBadges.includes(badge.id);
        const badgeEl = document.createElement('div');
        badgeEl.className = `badge ${!isUnlocked ? 'locked' : ''}`;
        badgeEl.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-progress">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
        `;
        container.appendChild(badgeEl);
    });
}

function checkAndUnlockBadges() {
    badgesData.forEach(badge => {
        if (!appState.userStats.unlockedBadges.includes(badge.id)) {
            // Safe condition evaluation without eval()
            if (evaluateBadgeCondition(badge.id)) {
                unlockBadge(badge);
            }
        }
    });
}

// Safe badge condition evaluation without eval()
function evaluateBadgeCondition(badgeId) {
    const stats = appState.userStats;
    switch(badgeId) {
        case 'first_task': return stats.tasksCompleted >= 1;
        case 'task_master': return stats.tasksCompleted >= 50;
        case 'mood_tracker': return stats.moodLogged >= 10;
        case 'journal_starter': return stats.journalEntries >= 5;
        case 'week_warrior': return stats.streak >= 7;
        case 'month_champion': return stats.streak >= 30;
        case 'health_guru': return stats.healthScore >= 80;
        case 'consistency_king': return stats.consistency >= 90;
        default: return false;
    }
}

function unlockBadge(badge) {
    appState.userStats.unlockedBadges.push(badge.id);
    celebrateAchievement(badge.name, badge.icon);
    addXP(50);
    saveUserStats();
    renderBadges();
}

function celebrateAchievement(title, icon) {
    // Show popup
    const popup = document.getElementById('achievementPopup');
    if (popup) {
        document.getElementById('popupTitle').textContent = title;
        const iconEl = document.getElementById('popupIcon');
        
        // Check if icon is a Font Awesome class (contains 'fa-')
        if (typeof icon === 'string' && icon.includes('fa-')) {
            iconEl.innerHTML = `<i class="fas ${icon}"></i>`;
        } else {
            // Otherwise treat as emoji or text
            iconEl.textContent = typeof icon === 'string' ? icon : '🏆';
        }
        
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }
    
    // Create confetti
    createConfetti();
}

function createConfetti() {
    const confettiPieces = 30;
    for (let i = 0; i < confettiPieces; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 1500);
    }
}

async function saveUserStats() {
    if (!appState.currentUser || !db) return;
    
    try {
        window.isLocalUpdate = true;
        await db.collection('users').doc(appState.currentUser.uid).update(
            { stats: appState.userStats },
            { merge: true }
        );
        setTimeout(() => { window.isLocalUpdate = false; }, 100);
    } catch (error) {
        console.log('Error saving stats:', error);
        window.isLocalUpdate = false;
    }
}

// Real-time save wrapper with debouncing
function saveUserStatsRealtime() {
    if (typeof debouncedSave === 'function') {
        debouncedSave('userStats', saveUserStats, 500);
    } else {
        saveUserStats();
    }
}
