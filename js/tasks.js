// Task Management Functions

let tasksRealtimeUnsubscribe = null;
let customTasksRealtimeUnsubscribe = null;
let midnightRefreshTimer = null;

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getAllTasksFlat() {
    const all = [];
    for (const category in appState.userTasks) {
        (appState.userTasks[category] || []).forEach(t => all.push(t));
    }
    return all;
}

function getTotalTaskCount() {
    return getAllTasksFlat().length;
}

function saveCustomTasksForCategory(category) {
    if (!db || !appState.currentUser) return;

    const tasks = (appState.userTasks[category] || [])
        .filter(t => t && t.isCustom)
        .map(t => ({ id: t.id, name: t.name || 'Untitled task' }));

    const saveFn = async () => {
        try {
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('customTasks').doc(category)
                .set({ tasks, updatedAt: new Date() }, { merge: true });
        } catch (error) {
            console.log('Error saving custom tasks:', error);
        }
    };

    if (typeof debouncedSave === 'function') {
        debouncedSave(`customTasks_${category}`, saveFn, 400);
    } else {
        saveFn();
    }
}

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
            const taskName = (task && task.name) ? task.name : 'Untitled task';
            const customActions = task && task.isCustom ? `
                <button class="task-action-btn" onclick="editCustomTask('${task.id}')" title="Edit task">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="task-action-btn danger" onclick="deleteCustomTask('${task.id}')" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            ` : '';
            taskList += `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask('${task.id}')">
                    <label>${taskName}</label>
                    ${customActions}
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

function findTaskById(taskId) {
    for (const category in appState.userTasks) {
        const tasks = appState.userTasks[category] || [];
        const task = tasks.find(t => t && t.id === taskId);
        if (task) return { task, category };
    }
    return null;
}

function editCustomTask(taskId) {
    const found = findTaskById(taskId);
    if (!found || !found.task.isCustom) return;
    const newName = prompt('Edit task name:', found.task.name || '');
    if (!newName || !newName.trim()) return;
    found.task.name = newName.trim();
    saveCustomTasksForCategory(found.category);
    renderTaskCategories();
    showToast('Task updated', 'success');
}

function deleteCustomTask(taskId) {
    const found = findTaskById(taskId);
    if (!found || !found.task.isCustom) return;
    if (!confirm('Delete this custom task?')) return;
    appState.userTasks[found.category] = (appState.userTasks[found.category] || []).filter(t => t && t.id !== taskId);
    saveCustomTasksForCategory(found.category);
    renderTaskCategories();
    updateProgress();
    showToast('Task deleted', 'info');
}

function toggleTask(taskId) {
    for (const category in appState.userTasks) {
        const task = appState.userTasks[category].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                appState.userStats.tasksCompleted++;
                addXP(10);
            } else {
                appState.userStats.tasksCompleted = Math.max(0, (appState.userStats.tasksCompleted || 0) - 1);
                // Keep XP non-negative; we do not "level down".
                appState.userStats.xp = Math.max(0, (appState.userStats.xp || 0) - 10);
                if (typeof queueDailyXP === 'function') queueDailyXP(-10);
                if (typeof saveUserStatsRealtime === 'function') saveUserStatsRealtime();
                else if (typeof saveUserStats === 'function') saveUserStats();
            }
            saveTaskCompletionRealtime(taskId, task.completed);
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
            window.isLocalTaskUpdate = true;
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('tasks').doc(dateString)
                .set(
                    {
                        [taskId]: completed,
                        _totalTasks: getTotalTaskCount(),
                        _updatedAt: new Date()
                    },
                    { merge: true }
                );
            setTimeout(() => { window.isLocalTaskUpdate = false; }, 100);
        } catch (error) {
            console.log('Error saving task:', error);
            window.isLocalTaskUpdate = false;
        }
    }
}

// Real-time task save with debouncing
function saveTaskCompletionRealtime(taskId, completed) {
    const key = `task_${taskId}`;
    if (typeof debouncedSave === 'function') {
        debouncedSave(key, () => saveTaskCompletion(taskId, completed), 300);
    } else {
        saveTaskCompletion(taskId, completed);
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

    // Ensure realtime listener points at the selected day
    if (typeof setupTasksRealtimeListener === 'function') {
        setupTasksRealtimeListener();
    }
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
        completed: false,
        isCustom: true
    };
    
    if (!appState.userTasks[taskCategory]) {
        appState.userTasks[taskCategory] = [];
    }
    appState.userTasks[taskCategory].push(newTask);
    saveCustomTasksForCategory(taskCategory);
    
    renderTaskCategories();
    closeAddTaskModal();
    showToast('Task added successfully!', 'success');
    
    document.getElementById('customTaskName').value = '';
}

async function loadCustomTasks() {
    // Start from defaults, then overlay custom tasks
    appState.userTasks = {};
    for (const category in defaultTasks) {
        appState.userTasks[category] = deepCopy(defaultTasks[category]).map(t => ({
            ...t,
            completed: false,
            isCustom: false
        }));
    }

    if (db && appState.currentUser) {
        try {
            const snapshot = await db.collection('users').doc(appState.currentUser.uid)
                .collection('customTasks').get();
            
            snapshot.forEach(doc => {
                const category = doc.id;
                const saved = (doc.data() && Array.isArray(doc.data().tasks)) ? doc.data().tasks : [];
                if (!appState.userTasks[category]) appState.userTasks[category] = [];
                saved.forEach(t => {
                    if (!t || !t.id) return;
                    const exists = appState.userTasks[category].some(existing => existing && existing.id === t.id);
                    if (!exists) {
                        appState.userTasks[category].push({
                            id: t.id,
                            name: t.name || 'Untitled task',
                            completed: false,
                            isCustom: true
                        });
                    }
                });
            });
        } catch (error) {
            console.log('Error loading custom tasks:', error);
        }
    }
}

function applyCustomTasksSnapshot(snapshot) {
    // Remove existing custom tasks
    for (const category in appState.userTasks) {
        appState.userTasks[category] = (appState.userTasks[category] || []).filter(t => !(t && t.isCustom));
    }

    snapshot.forEach(doc => {
        const category = doc.id;
        const saved = (doc.data() && Array.isArray(doc.data().tasks)) ? doc.data().tasks : [];
        if (!appState.userTasks[category]) appState.userTasks[category] = [];
        saved.forEach(t => {
            if (!t || !t.id) return;
            const exists = appState.userTasks[category].some(existing => existing && existing.id === t.id);
            if (!exists) {
                appState.userTasks[category].push({
                    id: t.id,
                    name: t.name || 'Untitled task',
                    completed: false,
                    isCustom: true
                });
            }
        });
    });
}

function setupCustomTasksRealtimeListener() {
    if (!db || !appState.currentUser) return;
    if (customTasksRealtimeUnsubscribe) customTasksRealtimeUnsubscribe();
    customTasksRealtimeUnsubscribe = db.collection('users').doc(appState.currentUser.uid)
        .collection('customTasks')
        .onSnapshot((snapshot) => {
            applyCustomTasksSnapshot(snapshot);
            // Re-apply completion for the current day if a new task was added
            loadTasksForDate();
        }, (error) => {
            console.warn('Custom tasks realtime listener error:', error);
        });
}

function setupTasksRealtimeListener() {
    if (!db || !appState.currentUser) return;
    if (tasksRealtimeUnsubscribe) tasksRealtimeUnsubscribe();

    const dateString = getDateString(appState.currentDate);
    tasksRealtimeUnsubscribe = db.collection('users').doc(appState.currentUser.uid)
        .collection('tasks').doc(dateString)
        .onSnapshot((doc) => {
            if (window.isLocalTaskUpdate) return;
            // Reset completion state
            for (const category in appState.userTasks) {
                (appState.userTasks[category] || []).forEach(task => { task.completed = false; });
            }
            if (doc.exists) {
                const data = doc.data();
                for (const category in appState.userTasks) {
                    (appState.userTasks[category] || []).forEach(task => {
                        if (data && data[task.id] !== undefined) {
                            task.completed = !!data[task.id];
                        }
                    });
                }

                // Update tasks history bucket for analytics
                const completed = Object.keys(data).filter(k => !k.startsWith('_') && data[k] === true).length;
                const total = data._totalTasks || Object.keys(data).filter(k => !k.startsWith('_')).length;
                const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                appState.tasksHistory[dateString] = { completed, total, rate };
            }
            renderTaskCategories();
            updateProgress();
            if (appState.currentView === 'analytics' && typeof initAnalytics === 'function') {
                initAnalytics();
            }
            if (appState.currentView === 'dashboard' && typeof initDashboard === 'function') {
                initDashboard();
            }
        }, (error) => {
            console.warn('Tasks realtime listener error:', error);
        });
}

function scheduleMidnightTrackerRefresh() {
    if (!appState.currentUser) return;
    if (midnightRefreshTimer) clearTimeout(midnightRefreshTimer);
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 1, 0); // 00:00:01 local time
    const ms = next.getTime() - now.getTime();
    midnightRefreshTimer = setTimeout(() => {
        appState.currentDate = new Date();
        updateDateDisplay();
        loadTasksForDate();
        scheduleMidnightTrackerRefresh();
    }, ms);
}

async function loadTasksHistory(daysBack = 30) {
    if (!db || !appState.currentUser) return;
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (daysBack - 1));
        const startId = getDateString(start);
        const endId = getDateString(end);

        const fieldPath = firebase.firestore.FieldPath.documentId();
        const snap = await db.collection('users').doc(appState.currentUser.uid)
            .collection('tasks')
            .orderBy(fieldPath)
            .startAt(startId)
            .endAt(endId)
            .get();

        const history = {};
        snap.forEach(doc => {
            const data = doc.data() || {};
            const completed = Object.keys(data).filter(k => !k.startsWith('_') && data[k] === true).length;
            const total = data._totalTasks || Object.keys(data).filter(k => !k.startsWith('_')).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            history[doc.id] = { completed, total, rate };
        });

        appState.tasksHistory = history;
    } catch (error) {
        console.warn('Error loading tasks history:', error);
    }
}
