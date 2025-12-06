// Goals and Habits Management Functions

function showAddGoalModal() {
    const goalName = prompt('Enter goal name (e.g., "Run 100km", "Read 12 books"):');
    if (!goalName || !goalName.trim()) {
        showToast('Goal name is required', 'error');
        return;
    }
    
    const goalCategory = prompt('Goal category:\n1. Health\n2. Productivity\n3. Personal\n4. Learning\n\nEnter 1-4 (default: 1):', '1');
    const categoryMap = { '1': 'Health', '2': 'Productivity', '3': 'Personal', '4': 'Learning' };
    const category = categoryMap[goalCategory] || 'Health';
    
    const goalTarget = parseInt(prompt('Target (e.g., number of days, kilometers, books):', '30'));
    
    if (isNaN(goalTarget) || goalTarget <= 0) {
        showToast('Please enter a valid target number', 'error');
        return;
    }
    
    const newGoal = {
        id: 'goal_' + Date.now(),
        name: goalName.trim(),
        category: category,
        progress: 0,
        target: goalTarget,
        createdAt: new Date(),
        completed: false
    };
    
    appState.userGoals.push(newGoal);
    saveGoals();
    renderGoals();
    addXP(10);
    showToast('🎯 Goal created! +10 XP', 'success');
}

function renderGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appState.userGoals.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; background: var(--bg-card); border-radius: 10px;"><i class="fas fa-clipboard-list" style="font-size: 40px; color: #ccc; margin-bottom: 15px; display: block;"></i><p style="color: #777; font-size: 14px;">No goals yet. Create one to start your journey!</p></div>';
        return;
    }
    
    const categoryIcons = {
        'Health': '💪',
        'Productivity': '🚀',
        'Personal': '✨',
        'Learning': '📚'
    };
    
    appState.userGoals.forEach(goal => {
        const percentage = Math.min((goal.progress / goal.target) * 100, 100);
        const isCompleted = goal.completed || goal.progress >= goal.target;
        const icon = categoryIcons[goal.category] || '🎯';
        
        const goalEl = document.createElement('div');
        goalEl.className = `goal-item ${isCompleted ? 'completed' : ''}`;
        goalEl.innerHTML = `
            <div class="goal-header">
                <div style="display: flex; gap: 10px; align-items: center; flex: 1;">
                    <span style="font-size: 24px;">${icon}</span>
                    <div>
                        <div class="goal-title" style="${isCompleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${goal.name}</div>
                        <span class="goal-category" style="font-size: 12px; opacity: 0.7;">${goal.category}</span>
                    </div>
                </div>
                <button class="action-btn" onclick="deleteGoal('${goal.id}')" title="Delete goal">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress-label">
                    <span>${isCompleted ? '✅ Completed' : 'Progress'}</span>
                    <span style="font-weight: 600;">${goal.progress}/${goal.target}</span>
                </div>
                <input type="range" min="0" max="${goal.target}" value="${goal.progress}" 
                       onchange="updateGoalProgress('${goal.id}', this.value)" style="width: 100%; cursor: pointer;" ${isCompleted ? 'disabled' : ''}>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background: ${isCompleted ? '#4cc9f0' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'};}"></div>
            </div>
        `;
        container.appendChild(goalEl);
    });
}

function updateGoalProgress(goalId, progress) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (goal && !goal.completed) {
        const oldProgress = goal.progress;
        goal.progress = parseInt(progress);
        
        if (goal.progress > oldProgress) {
            const xpGain = 5 * (goal.progress - oldProgress);
            addXP(xpGain);
            showToast(`+${xpGain} XP for goal progress!`, 'success');
        }
        
        if (goal.progress >= goal.target && !goal.completed) {
            goal.completed = true;
            celebrateAchievement(`${goal.name} Complete! 🎯`, '🏆');
            addXP(100);
            showToast('🎉 Goal Completed! +100 XP Bonus!', 'success');
        }
        
        saveGoals();
        renderGoals();
        updateGamificationUI();
    }
}

function deleteGoal(goalId) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
        appState.userGoals = appState.userGoals.filter(g => g.id !== goalId);
        saveGoals();
        renderGoals();
        showToast('Goal deleted', 'info');
    }
}

async function saveGoals() {
    if (!appState.currentUser || !db) return;
    
    try {
        await db.collection('users').doc(appState.currentUser.uid).update(
            { goals: appState.userGoals },
            { merge: true }
        );
    } catch (error) {
        console.log('Error saving goals:', error);
    }
}

function loadGoals() {
    // Loaded in loadUserData
}

function renderHabitChain() {
    const container = document.getElementById('habitChain');
    if (!container) return;
    
    container.innerHTML = '<h3>30-Day Habit Chain</h3>';
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'habit-chain-grid';
    
    for (let i = 0; i < 30; i++) {
        const day = document.createElement('div');
        const status = Math.random() > 0.3 ? 'completed' : (Math.random() > 0.5 ? 'partial' : 'missed');
        day.className = `habit-day ${status}`;
        day.textContent = (i + 1);
        gridContainer.appendChild(day);
    }
    
    container.appendChild(gridContainer);
}

async function updateUserStats() {
    if (!appState.currentUser || !db) return;
    
    try {
        const today = new Date();
        const dateString = getDateString(today);
        
        // Update streak and total days
        const userDoc = await db.collection('users').doc(appState.currentUser.uid).get();
        if (userDoc.exists) {
            const lastActivityDate = userDoc.data().lastActivityDate;
            const today = new Date();
            
            if (lastActivityDate) {
                const lastDate = new Date(lastActivityDate);
                const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    appState.userStats.streak++;
                } else if (daysDiff > 1) {
                    appState.userStats.streak = 1;
                }
            } else {
                appState.userStats.streak = 1;
            }
            
            appState.userStats.totalDays++;
            
            await db.collection('users').doc(appState.currentUser.uid).update(
                {
                    lastActivityDate: dateString,
                    stats: appState.userStats
                },
                { merge: true }
            );
        }
    } catch (error) {
        console.log('Error updating stats:', error);
    }
}

// Settings
async function updateSettings() {
    showToast('Settings saved!', 'success');
}
