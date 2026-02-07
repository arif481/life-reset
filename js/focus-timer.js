/**
 * @fileoverview Focus Timer / Pomodoro Module
 * @description Built-in timer with task integration, focus sessions, breaks
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Timer Configuration
   ========================================================================== */

const TIMER_PRESETS = {
    pomodoro: { work: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 },
    deep_work: { work: 50, shortBreak: 10, longBreak: 30, sessionsBeforeLong: 2 },
    quick_focus: { work: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 4 },
    custom: { work: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 }
};

const TIMER_SOUNDS = {
    bell: 'bell',
    chime: 'chime',
    digital: 'digital',
    none: 'none'
};

const AMBIENT_SOUNDS = {
    none: { name: 'None', icon: '🔇' },
    rain: { name: 'Rain', icon: '🌧️' },
    forest: { name: 'Forest', icon: '🌲' },
    ocean: { name: 'Ocean', icon: '🌊' },
    fire: { name: 'Fireplace', icon: '🔥' },
    cafe: { name: 'Café', icon: '☕' },
    white_noise: { name: 'White Noise', icon: '📻' }
};

/* ==========================================================================
   Timer State
   ========================================================================== */

let timerState = {
    isRunning: false,
    isPaused: false,
    mode: 'work', // work, shortBreak, longBreak
    preset: 'pomodoro',
    settings: { ...TIMER_PRESETS.pomodoro },
    timeRemaining: 25 * 60, // seconds
    totalTime: 25 * 60,
    sessionsCompleted: 0,
    totalSessionsToday: 0,
    totalFocusMinutes: 0,
    currentTask: null,
    intervalId: null,
    ambientSound: 'none',
    notifyOnComplete: true,
    autoStartBreaks: false,
    autoStartWork: false
};

let timerHistory = [];

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initFocusTimer() {
    console.log('[Timer] Initializing...');
    await loadTimerData();
    console.log('[Timer] Initialized');
}

async function loadTimerData() {
    try {
        const saved = localStorage.getItem('focusTimer');
        if (saved) {
            const data = JSON.parse(saved);
            timerState.settings = data.settings || timerState.settings;
            timerState.preset = data.preset || 'pomodoro';
            timerState.totalSessionsToday = data.todaySessions || 0;
            timerState.totalFocusMinutes = data.totalMinutes || 0;
            timerState.ambientSound = data.ambientSound || 'none';
            timerState.notifyOnComplete = data.notifyOnComplete !== false;
            timerState.autoStartBreaks = data.autoStartBreaks || false;
            timerState.autoStartWork = data.autoStartWork || false;
            timerHistory = data.history || [];

            // Reset daily count if new day
            const lastDate = data.lastDate;
            const today = new Date().toISOString().split('T')[0];
            if (lastDate !== today) {
                timerState.totalSessionsToday = 0;
            }
        }

        // Also try Firebase
        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('features')
                .doc('focusTimer')
                .get();

            if (doc.exists) {
                const data = doc.data();
                timerState.totalFocusMinutes = data.totalMinutes || timerState.totalFocusMinutes;
                timerHistory = data.history || timerHistory;
            }
        }
    } catch (error) {
        console.error('[Timer] Load error:', error);
    }
}

async function saveTimerData() {
    const data = {
        settings: timerState.settings,
        preset: timerState.preset,
        todaySessions: timerState.totalSessionsToday,
        totalMinutes: timerState.totalFocusMinutes,
        ambientSound: timerState.ambientSound,
        notifyOnComplete: timerState.notifyOnComplete,
        autoStartBreaks: timerState.autoStartBreaks,
        autoStartWork: timerState.autoStartWork,
        history: timerHistory.slice(-100), // Keep last 100 sessions
        lastDate: new Date().toISOString().split('T')[0]
    };

    try {
        localStorage.setItem('focusTimer', JSON.stringify(data));

        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('features')
                .doc('focusTimer')
                .set({
                    totalMinutes: timerState.totalFocusMinutes,
                    history: timerHistory.slice(-100),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        }
    } catch (error) {
        console.error('[Timer] Save error:', error);
    }
}

/* ==========================================================================
   Timer Controls
   ========================================================================== */

function startTimer(taskId = null) {
    if (timerState.isRunning) return;

    if (taskId) {
        timerState.currentTask = appState.tasks?.find(t => t.id === taskId) || null;
    }

    timerState.isRunning = true;
    timerState.isPaused = false;

    // Start countdown
    timerState.intervalId = setInterval(() => {
        if (!timerState.isPaused) {
            timerState.timeRemaining--;
            updateTimerDisplay();

            if (timerState.timeRemaining <= 0) {
                completeTimerSession();
            }
        }
    }, 1000);

    updateTimerDisplay();
    playAmbientSound();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('timerStarted', {
        detail: { mode: timerState.mode, task: timerState.currentTask }
    }));
}

function pauseTimer() {
    timerState.isPaused = true;
    stopAmbientSound();
    updateTimerDisplay();
}

function resumeTimer() {
    timerState.isPaused = false;
    playAmbientSound();
    updateTimerDisplay();
}

function stopTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }

    timerState.isRunning = false;
    timerState.isPaused = false;
    stopAmbientSound();
    
    resetTimerToMode(timerState.mode);
    updateTimerDisplay();
}

function resetTimer() {
    stopTimer();
    timerState.mode = 'work';
    timerState.sessionsCompleted = 0;
    resetTimerToMode('work');
    updateTimerDisplay();
}

function resetTimerToMode(mode) {
    switch (mode) {
        case 'work':
            timerState.timeRemaining = timerState.settings.work * 60;
            timerState.totalTime = timerState.settings.work * 60;
            break;
        case 'shortBreak':
            timerState.timeRemaining = timerState.settings.shortBreak * 60;
            timerState.totalTime = timerState.settings.shortBreak * 60;
            break;
        case 'longBreak':
            timerState.timeRemaining = timerState.settings.longBreak * 60;
            timerState.totalTime = timerState.settings.longBreak * 60;
            break;
    }
}

function completeTimerSession() {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.isRunning = false;
    stopAmbientSound();

    if (timerState.mode === 'work') {
        timerState.sessionsCompleted++;
        timerState.totalSessionsToday++;
        timerState.totalFocusMinutes += timerState.settings.work;

        // Record session
        timerHistory.push({
            date: new Date().toISOString(),
            duration: timerState.settings.work,
            taskId: timerState.currentTask?.id,
            taskName: timerState.currentTask?.title
        });

        // Award XP
        const xpEarned = Math.round(timerState.settings.work * 2);
        if (typeof addXP === 'function') {
            addXP(xpEarned, 'Focus session completed');
        }

        // Determine next break type
        if (timerState.sessionsCompleted % timerState.settings.sessionsBeforeLong === 0) {
            timerState.mode = 'longBreak';
        } else {
            timerState.mode = 'shortBreak';
        }
    } else {
        // Break completed, switch to work
        timerState.mode = 'work';
    }

    // Notify
    playCompletionSound();
    if (timerState.notifyOnComplete && typeof sendNotification === 'function') {
        const message = timerState.mode === 'work' 
            ? 'Break over! Time to focus again.' 
            : `Great work! Take a ${timerState.mode === 'longBreak' ? 'long' : 'short'} break.`;
        sendNotification('⏱️ Timer Complete', { body: message, tag: 'timer' });
    }

    saveTimerData();
    resetTimerToMode(timerState.mode);
    updateTimerDisplay();

    // Show completion modal
    showTimerCompleteModal();

    // Auto-start next session if enabled
    if ((timerState.mode !== 'work' && timerState.autoStartBreaks) ||
        (timerState.mode === 'work' && timerState.autoStartWork)) {
        setTimeout(() => startTimer(), 3000);
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent('timerCompleted', {
        detail: { 
            mode: timerState.mode,
            sessionsCompleted: timerState.sessionsCompleted,
            task: timerState.currentTask
        }
    }));
}

function skipToNextPhase() {
    stopTimer();
    
    if (timerState.mode === 'work') {
        timerState.mode = timerState.sessionsCompleted % timerState.settings.sessionsBeforeLong === 0
            ? 'longBreak' : 'shortBreak';
    } else {
        timerState.mode = 'work';
    }

    resetTimerToMode(timerState.mode);
    updateTimerDisplay();
}

/* ==========================================================================
   Timer Settings
   ========================================================================== */

function setTimerPreset(presetName) {
    if (!TIMER_PRESETS[presetName]) return;

    timerState.preset = presetName;
    timerState.settings = { ...TIMER_PRESETS[presetName] };
    resetTimerToMode(timerState.mode);
    updateTimerDisplay();
    saveTimerData();
}

function setCustomTimerSettings(settings) {
    timerState.preset = 'custom';
    timerState.settings = {
        work: settings.work || 25,
        shortBreak: settings.shortBreak || 5,
        longBreak: settings.longBreak || 15,
        sessionsBeforeLong: settings.sessionsBeforeLong || 4
    };
    TIMER_PRESETS.custom = { ...timerState.settings };
    resetTimerToMode(timerState.mode);
    updateTimerDisplay();
    saveTimerData();
}

function setAmbientSound(sound) {
    timerState.ambientSound = sound;
    if (timerState.isRunning && !timerState.isPaused) {
        playAmbientSound();
    }
    saveTimerData();
}

/* ==========================================================================
   Sound Functions
   ========================================================================== */

let ambientAudio = null;

function playAmbientSound() {
    stopAmbientSound();
    
    if (timerState.ambientSound === 'none') return;

    // In a real app, you'd load actual audio files
    // For now, we'll use the Web Audio API to generate simple sounds
    try {
        // Create audio context for ambient sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        // Placeholder - in production, load actual audio files
        console.log('[Timer] Playing ambient sound:', timerState.ambientSound);
    } catch (error) {
        console.log('[Timer] Audio not supported');
    }
}

function stopAmbientSound() {
    if (ambientAudio) {
        ambientAudio.pause();
        ambientAudio = null;
    }
}

function playCompletionSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);

        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            osc2.connect(gainNode);
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            osc2.start();
            osc2.stop(ctx.currentTime + 0.5);
        }, 300);
    } catch (error) {
        console.log('[Timer] Sound not supported');
    }
}

/* ==========================================================================
   UI Functions
   ========================================================================== */

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const progress = document.getElementById('timerProgress');
    const modeLabel = document.getElementById('timerMode');
    const controls = document.getElementById('timerControls');

    if (display) {
        display.textContent = formatTime(timerState.timeRemaining);
    }

    if (progress) {
        const percent = ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100;
        progress.style.strokeDashoffset = 440 - (440 * percent / 100);
    }

    if (modeLabel) {
        const modeLabels = {
            work: '🎯 Focus Time',
            shortBreak: '☕ Short Break',
            longBreak: '🌴 Long Break'
        };
        modeLabel.textContent = modeLabels[timerState.mode] || 'Focus';
    }

    // Update document title
    if (timerState.isRunning) {
        document.title = `${formatTime(timerState.timeRemaining)} - Life Reset`;
    } else {
        document.title = 'Life Reset: Recovery & Growth Platform';
    }
}

function renderFocusTimer() {
    const container = document.getElementById('focusTimerContainer');
    if (!container) return;

    const progress = ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100;

    container.innerHTML = `
        <div class="focus-timer-section">
            <div class="timer-header">
                <h2>⏱️ Focus Timer</h2>
                <div class="timer-stats">
                    <span class="stat">🔥 ${timerState.totalSessionsToday} today</span>
                    <span class="stat">⏰ ${timerState.totalFocusMinutes} min total</span>
                </div>
            </div>

            <div class="timer-main">
                <div class="timer-circle">
                    <svg viewBox="0 0 160 160">
                        <circle class="timer-bg" cx="80" cy="80" r="70" />
                        <circle class="timer-progress" id="timerProgress" cx="80" cy="80" r="70"
                                style="stroke-dashoffset: ${440 - (440 * progress / 100)}"
                                class="${timerState.mode}" />
                    </svg>
                    <div class="timer-display" id="timerDisplay">
                        ${formatTime(timerState.timeRemaining)}
                    </div>
                </div>

                <div class="timer-mode" id="timerMode">
                    ${timerState.mode === 'work' ? '🎯 Focus Time' : timerState.mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
                </div>

                <div class="session-dots">
                    ${Array(timerState.settings.sessionsBeforeLong).fill(0).map((_, i) => `
                        <span class="session-dot ${i < (timerState.sessionsCompleted % timerState.settings.sessionsBeforeLong) ? 'completed' : ''}"></span>
                    `).join('')}
                </div>
            </div>

            <div class="timer-controls" id="timerControls">
                ${timerState.isRunning ? `
                    ${timerState.isPaused ? `
                        <button class="btn-primary btn-lg" onclick="resumeTimer()">▶️ Resume</button>
                    ` : `
                        <button class="btn-secondary btn-lg" onclick="pauseTimer()">⏸️ Pause</button>
                    `}
                    <button class="btn-secondary" onclick="stopTimer()">⏹️ Stop</button>
                ` : `
                    <button class="btn-primary btn-lg" onclick="startTimer()">▶️ Start</button>
                    <button class="btn-secondary" onclick="skipToNextPhase()">⏭️ Skip</button>
                `}
            </div>

            ${timerState.currentTask ? `
                <div class="current-task-banner">
                    <span>Working on: ${timerState.currentTask.title}</span>
                    <button class="btn-link" onclick="timerState.currentTask = null; renderFocusTimer();">×</button>
                </div>
            ` : `
                <button class="btn-link select-task" onclick="showSelectTaskModal()">
                    📋 Select a task to work on
                </button>
            `}

            <div class="timer-presets">
                <h4>Presets</h4>
                <div class="preset-buttons">
                    <button class="${timerState.preset === 'pomodoro' ? 'active' : ''}" onclick="setTimerPreset('pomodoro')">
                        🍅 Pomodoro (25/5)
                    </button>
                    <button class="${timerState.preset === 'deep_work' ? 'active' : ''}" onclick="setTimerPreset('deep_work')">
                        🧠 Deep Work (50/10)
                    </button>
                    <button class="${timerState.preset === 'quick_focus' ? 'active' : ''}" onclick="setTimerPreset('quick_focus')">
                        ⚡ Quick (15/3)
                    </button>
                    <button onclick="showCustomTimerModal()">⚙️ Custom</button>
                </div>
            </div>

            <div class="ambient-sounds">
                <h4>Ambient Sounds</h4>
                <div class="sound-buttons">
                    ${Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => `
                        <button class="${timerState.ambientSound === key ? 'active' : ''}" 
                                onclick="setAmbientSound('${key}')">
                            ${sound.icon}
                        </button>
                    `).join('')}
                </div>
            </div>

            ${timerHistory.length > 0 ? `
                <div class="timer-history">
                    <h4>Recent Sessions</h4>
                    <div class="history-list">
                        ${timerHistory.slice(-5).reverse().map(session => `
                            <div class="history-item">
                                <span class="duration">${session.duration}min</span>
                                <span class="task">${session.taskName || 'Free focus'}</span>
                                <span class="date">${new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function showTimerCompleteModal() {
    const isBreak = timerState.mode !== 'work';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'timerCompleteModal';
    modal.innerHTML = `
        <div class="modal-content celebration">
            <div class="celebration-icon">${isBreak ? '☕' : '🎯'}</div>
            <h2>${isBreak ? 'Break Time!' : 'Session Complete!'}</h2>
            <p>${isBreak 
                ? `Take a ${timerState.mode === 'longBreak' ? 'long' : 'short'} break. You've earned it!`
                : `Great focus! You completed ${timerState.sessionsCompleted} session${timerState.sessionsCompleted > 1 ? 's' : ''}.`
            }</p>
            <div class="timer-complete-stats">
                <span>🔥 ${timerState.totalSessionsToday} sessions today</span>
                <span>⏰ ${timerState.totalFocusMinutes} total minutes</span>
            </div>
            <button class="btn-primary" onclick="this.closest('.modal').remove()">
                ${isBreak ? 'Start Break' : 'Got it!'}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Auto close after 5 seconds
    setTimeout(() => modal.remove(), 5000);
}

function showSelectTaskModal() {
    const incompleteTasks = (appState.tasks || []).filter(t => !t.completed);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'selectTaskModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📋 Select Task</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${incompleteTasks.length > 0 ? `
                    <div class="task-selection-list">
                        ${incompleteTasks.slice(0, 10).map(task => `
                            <button class="task-option" onclick="selectTaskForTimer('${task.id}')">
                                <span class="task-title">${task.title}</span>
                                ${task.priority ? `<span class="priority-badge ${task.priority}">${task.priority}</span>` : ''}
                            </button>
                        `).join('')}
                    </div>
                ` : `
                    <p class="empty-state">No tasks available. Add some tasks first!</p>
                `}
                <button class="btn-link" onclick="this.closest('.modal').remove(); startTimer();">
                    Or start without a task
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function selectTaskForTimer(taskId) {
    document.getElementById('selectTaskModal')?.remove();
    startTimer(taskId);
    renderFocusTimer();
}

function showCustomTimerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'customTimerModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚙️ Custom Timer</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Work Duration (minutes)</label>
                    <input type="number" id="customWork" min="5" max="120" value="${timerState.settings.work}">
                </div>
                <div class="form-group">
                    <label>Short Break (minutes)</label>
                    <input type="number" id="customShortBreak" min="1" max="30" value="${timerState.settings.shortBreak}">
                </div>
                <div class="form-group">
                    <label>Long Break (minutes)</label>
                    <input type="number" id="customLongBreak" min="5" max="60" value="${timerState.settings.longBreak}">
                </div>
                <div class="form-group">
                    <label>Sessions before long break</label>
                    <input type="number" id="customSessions" min="2" max="8" value="${timerState.settings.sessionsBeforeLong}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="saveCustomTimer()">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function saveCustomTimer() {
    const settings = {
        work: parseInt(document.getElementById('customWork').value) || 25,
        shortBreak: parseInt(document.getElementById('customShortBreak').value) || 5,
        longBreak: parseInt(document.getElementById('customLongBreak').value) || 15,
        sessionsBeforeLong: parseInt(document.getElementById('customSessions').value) || 4
    };

    setCustomTimerSettings(settings);
    document.getElementById('customTimerModal')?.remove();
    renderFocusTimer();

    if (typeof showToast === 'function') {
        showToast('Timer settings saved! ⏱️');
    }
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initFocusTimer = initFocusTimer;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resumeTimer = resumeTimer;
window.stopTimer = stopTimer;
window.resetTimer = resetTimer;
window.skipToNextPhase = skipToNextPhase;
window.setTimerPreset = setTimerPreset;
window.setCustomTimerSettings = setCustomTimerSettings;
window.setAmbientSound = setAmbientSound;
window.renderFocusTimer = renderFocusTimer;
window.showSelectTaskModal = showSelectTaskModal;
window.selectTaskForTimer = selectTaskForTimer;
window.showCustomTimerModal = showCustomTimerModal;
window.saveCustomTimer = saveCustomTimer;
window.timerState = timerState;
