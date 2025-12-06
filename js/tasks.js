// Task Management Functions

function renderTaskCategories() {
    const container = document.getElementById('taskCategories');
    if (!container) return;
    container.innerHTML = '';
    
    const categoryIcons = {
        morning: 'fa-sun',
        health: 'fa-heart',
        productivity: 'fa-rocket',
        evening: 'fa-moon',
        custom: 'fa-star'
    };
    
    const categoryNames = {
        morning: 'Morning Routine',
        health: 'Health & Wellness',
        productivity: 'Productivity',
        evening: 'Evening Routine',
        custom: 'Custom Tasks'
    };
    
    for (const category in appState.userTasks) {
        const tasks = appState.userTasks[category] || [];
        const taskEl = document.createElement('div');
        taskEl.className = 'task-category';
        
        let taskList = '';
        tasks.forEach(task => {
            taskList += `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask('${task.id}')">
                    <label>${task.name}</label>
                </div>
            `;
        });
        
        taskEl.innerHTML = `
            <div class="category-header">
                <i class="fas ${categoryIcons[category]}"></i>
                <div class="category-title">${categoryNames[category] || category}</div>
            </div>
            <div class="task-list">${taskList}</div>
        `;
        container.appendChild(taskEl);
    }
}

function toggleTask(taskId) {
    for (const category in appState.userTasks) {
        const task = appState.userTasks[category].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                appState.userStats.tasksCompleted++;
                addXP(10);
            }
            saveTaskCompletion(taskId, task.completed);
            updateProgress();
            checkAndUnlockBadges();
            break;
        }
    }
}

function updateProgress() {
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const category in appState.userTasks) {
        appState.userTasks[category].forEach(task => {
            totalTasks++;
            if (task.completed) completedTasks++;
        });
    }
    
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const progressBar = document.getElementById('todayProgress');
    if (progressBar) progressBar.style.width = progressPercentage + '%';
    
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = `${progressPercentage}% of today's tasks completed`;
    
    const completionRate = document.getElementById('completionRate');
    if (completionRate) completionRate.textContent = `${progressPercentage}%`;
    
    appState.userStats.consistency = progressPercentage;
    updateGamificationUI();
}

async function saveTaskCompletion(taskId, completed) {
    if (db && appState.currentUser) {
        try {
            const dateString = getDateString(appState.currentDate);
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('tasks').doc(dateString)
                .set(
                    { [taskId]: completed },
                    { merge: true }
                );
        } catch (error) {
            console.log('Error saving task:', error);
        }
    }
}

async function loadTasksForDate() {
    // Reset all tasks
    for (const category in appState.userTasks) {
        appState.userTasks[category].forEach(task => task.completed = false);
    }
    
    // Load from Firebase
    if (db && appState.currentUser) {
        try {
            const dateString = getDateString(appState.currentDate);
            const doc = await db.collection('users').doc(appState.currentUser.uid)
                .collection('tasks').doc(dateString).get();
            
            if (doc.exists) {
                const data = doc.data();
                for (const category in appState.userTasks) {
                    appState.userTasks[category].forEach(task => {
                        if (data[task.id] !== undefined) {
                            task.completed = data[task.id];
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Error loading tasks:', error);
        }
    }
    
    renderTaskCategories();
    updateProgress();
}

function showAddTaskModal() {
    document.getElementById('addTaskModal').classList.add('show');
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').classList.remove('show');
}

async function addCustomTask() {
    const taskName = document.getElementById('customTaskName').value;
    const taskCategory = document.getElementById('taskCategory').value;
    
    if (!taskName.trim()) {
        showToast('Please enter a task name', 'error');
        return;
    }
    
    const newTask = {
        id: 'custom_' + Date.now(),
        name: taskName,
        completed: false
    };
    
    if (!appState.userTasks[taskCategory]) {
        appState.userTasks[taskCategory] = [];
    }
    appState.userTasks[taskCategory].push(newTask);
    
    // Save to Firebase
    if (db && appState.currentUser) {
        try {
            const dateString = getDateString(appState.currentDate);
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('customTasks').doc(taskCategory).set(
                    { tasks: appState.userTasks[taskCategory] },
                    { merge: true }
                );
        } catch (error) {
            console.log('Error saving custom task:', error);
        }
    }
    
    renderTaskCategories();
    closeAddTaskModal();
    showToast('Task added successfully!', 'success');
    
    document.getElementById('customTaskName').value = '';
}

async function loadCustomTasks() {
    if (db && appState.currentUser) {
        try {
            const snapshot = await db.collection('users').doc(appState.currentUser.uid)
                .collection('customTasks').get();
            
            snapshot.forEach(doc => {
                appState.userTasks[doc.id] = doc.data().tasks || [];
            });
        } catch (error) {
            console.log('Error loading custom tasks:', error);
        }
    }
    
    // Initialize default tasks
    for (const category in defaultTasks) {
        if (!appState.userTasks[category]) {
            appState.userTasks[category] = JSON.parse(JSON.stringify(defaultTasks[category]));
        }
    }
    
    loadTasksForDate();
}
