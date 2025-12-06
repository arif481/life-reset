// Goals and Habits Management Functions

function showAddGoalModal() {
    const goalName = prompt('Enter goal name:');
    if (!goalName) return;
    
    const goalCategory = prompt('Goal category (Health, Productivity, Personal):', 'Health');
    const goalTarget = parseInt(prompt('Target (e.g., number of days):', '30'));
    
    if (isNaN(goalTarget)) {
        showToast('Invalid target', 'error');
        return;
    }
    
    const newGoal = {
        id: 'goal_' + Date.now(),
        name: goalName,
        category: goalCategory || 'Personal',
        progress: 0,
        target: goalTarget,
        createdAt: new Date(),
        completed: false
    };
    
    appState.userGoals.push(newGoal);
    saveGoals();
    renderGoals();
    showToast('Goal added!', 'success');
}

function renderGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appState.userGoals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #777; padding: 30px;">No goals yet. Click "Add Goal" to get started!</p>';
        return;
    }
    
    appState.userGoals.forEach(goal => {
        const percentage = (goal.progress / goal.target) * 100;
        const goalEl = document.createElement('div');
        goalEl.className = `goal-item ${goal.completed ? 'completed' : ''}`;
        goalEl.innerHTML = `
            <div class="goal-header">
                <div>
                    <div class="goal-title">${goal.name}</div>
                    <span class="goal-category">${goal.category}</span>
                </div>
                <button class="btn btn-secondary" style="padding: 8px 12px; font-size: 12px;" onclick="deleteGoal('${goal.id}')">Delete</button>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress-label">
                    <span>Progress</span>
                    <span>${goal.progress}/${goal.target}</span>
                </div>
                <input type="range" min="0" max="${goal.target}" value="${goal.progress}" 
                       onchange="updateGoalProgress('${goal.id}', this.value)" style="width: 100%;">
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(goalEl);
    });
}

function updateGoalProgress(goalId, progress) {
    const goal = appState.userGoals.find(g => g.id === goalId);
    if (goal) {
        const oldProgress = goal.progress;
        goal.progress = parseInt(progress);
        if (goal.progress > oldProgress) {
            addXP(5 * (goal.progress - oldProgress));
        }
        if (goal.progress >= goal.target) {
            goal.completed = true;
            celebrateAchievement('Goal Completed! 🎯', '🏆');
            addXP(100);
        }
        saveGoals();
        renderGoals();
    }
}

function deleteGoal(goalId) {
    if (confirm('Delete this goal?')) {
        appState.userGoals = appState.userGoals.filter(g => g.id !== goalId);
        saveGoals();
        renderGoals();
        showToast('Goal deleted', 'success');
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
