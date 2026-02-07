/**
 * @fileoverview Data Export & Backup Module
 * @description CSV/JSON export, cloud backup, data portability
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Export Formats
   ========================================================================== */

const EXPORT_FORMATS = {
    json: {
        name: 'JSON',
        extension: '.json',
        mimeType: 'application/json'
    },
    csv: {
        name: 'CSV',
        extension: '.csv',
        mimeType: 'text/csv'
    }
};

const EXPORTABLE_DATA = {
    tasks: {
        name: 'Tasks',
        description: 'All your tasks and completions',
        icon: '✅'
    },
    habits: {
        name: 'Habits',
        description: 'Habit definitions and tracking data',
        icon: '🔄'
    },
    goals: {
        name: 'Goals',
        description: 'Your goals and progress',
        icon: '🎯'
    },
    journal: {
        name: 'Journal Entries',
        description: 'All journal entries and moods',
        icon: '📔'
    },
    mood: {
        name: 'Mood History',
        description: 'Mood logs and patterns',
        icon: '😊'
    },
    stats: {
        name: 'Statistics',
        description: 'XP, levels, streaks, achievements',
        icon: '📊'
    },
    settings: {
        name: 'Settings',
        description: 'App preferences and configurations',
        icon: '⚙️'
    }
};

/* ==========================================================================
   State
   ========================================================================== */

let exportState = {
    lastBackup: null,
    autoBackupEnabled: false,
    backupFrequency: 'weekly', // daily, weekly, monthly
    cloudBackups: []
};

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initDataExport() {
    console.log('[Export] Initializing...');
    await loadExportSettings();
    checkAutoBackup();
    console.log('[Export] Initialized');
}

async function loadExportSettings() {
    try {
        const saved = localStorage.getItem('exportSettings');
        if (saved) {
            Object.assign(exportState, JSON.parse(saved));
        }

        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('backup')
                .get();

            if (doc.exists) {
                const data = doc.data();
                exportState.lastBackup = data.lastBackup?.toDate?.()?.toISOString() || exportState.lastBackup;
                exportState.autoBackupEnabled = data.autoBackupEnabled ?? exportState.autoBackupEnabled;
                exportState.backupFrequency = data.backupFrequency || exportState.backupFrequency;
            }

            // Load cloud backup list
            const backups = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('backups')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            exportState.cloudBackups = backups.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
    } catch (error) {
        console.error('[Export] Load settings error:', error);
    }
}

async function saveExportSettings() {
    try {
        localStorage.setItem('exportSettings', JSON.stringify(exportState));

        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('backup')
                .set({
                    lastBackup: exportState.lastBackup ? new Date(exportState.lastBackup) : null,
                    autoBackupEnabled: exportState.autoBackupEnabled,
                    backupFrequency: exportState.backupFrequency,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        }
    } catch (error) {
        console.error('[Export] Save settings error:', error);
    }
}

/* ==========================================================================
   Data Collection
   ========================================================================== */

function collectAllData() {
    const data = {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        tasks: collectTasks(),
        habits: collectHabits(),
        goals: collectGoals(),
        journal: collectJournal(),
        mood: collectMood(),
        stats: collectStats(),
        settings: collectSettings()
    };

    return data;
}

function collectTasks() {
    return (appState.tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority || 'medium',
        completed: task.completed || false,
        completedAt: task.completedAt || null,
        createdAt: task.createdAt || null,
        dueDate: task.dueDate || null,
        recurring: task.recurring || false,
        recurrencePattern: task.recurrencePattern || null
    }));
}

function collectHabits() {
    return (appState.habits || []).map(habit => ({
        id: habit.id,
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        frequency: habit.frequency || 'daily',
        streak: habit.streak || 0,
        bestStreak: habit.bestStreak || 0,
        completedDates: habit.completedDates || [],
        createdAt: habit.createdAt || null,
        archived: habit.archived || false
    }));
}

function collectGoals() {
    return (appState.goals || []).map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        target: goal.target,
        current: goal.current || 0,
        unit: goal.unit || '',
        deadline: goal.deadline || null,
        milestones: goal.milestones || [],
        completed: goal.completed || false,
        createdAt: goal.createdAt || null
    }));
}

function collectJournal() {
    return (appState.journalEntries || []).map(entry => ({
        id: entry.id,
        content: entry.content,
        mood: entry.mood || null,
        tags: entry.tags || [],
        createdAt: entry.createdAt || entry.timestamp?.toDate?.()?.toISOString() || null,
        wordCount: entry.content?.split(/\s+/).length || 0
    }));
}

function collectMood() {
    return (appState.moodHistory || []).map(mood => ({
        id: mood.id,
        mood: mood.mood,
        note: mood.note || '',
        date: mood.date || mood.timestamp?.toDate?.()?.toISOString()?.split('T')[0] || null,
        time: mood.time || null,
        factors: mood.factors || []
    }));
}

function collectStats() {
    return {
        level: appState.userStats?.level || 1,
        xp: appState.userStats?.xp || 0,
        totalXP: appState.userStats?.totalXP || 0,
        streak: appState.userStats?.streak || 0,
        longestStreak: appState.userStats?.longestStreak || 0,
        tasksCompleted: appState.userStats?.tasksCompleted || 0,
        habitsCompleted: appState.userStats?.habitsCompleted || 0,
        goalsAchieved: appState.userStats?.goalsAchieved || 0,
        journalEntries: appState.journalEntries?.length || 0,
        achievements: typeof rewardsState !== 'undefined' 
            ? rewardsState.unlockedAchievements 
            : JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'),
        focusSessions: parseInt(localStorage.getItem('focusSessionCount') || '0'),
        totalFocusMinutes: parseInt(localStorage.getItem('totalFocusMinutes') || '0')
    };
}

function collectSettings() {
    return {
        theme: localStorage.getItem('theme') || 'dark',
        notifications: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
        categories: appState.categories || [],
        displayPreferences: JSON.parse(localStorage.getItem('displayPreferences') || '{}')
    };
}

/* ==========================================================================
   JSON Export
   ========================================================================== */

function exportToJSON(dataTypes = null) {
    const allData = collectAllData();
    
    let exportData;
    if (dataTypes && Array.isArray(dataTypes)) {
        exportData = {
            exportedAt: allData.exportedAt,
            appVersion: allData.appVersion
        };
        dataTypes.forEach(type => {
            if (allData[type]) {
                exportData[type] = allData[type];
            }
        });
    } else {
        exportData = allData;
    }

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `life-reset-backup-${getDateString()}.json`);

    if (typeof showToast === 'function') {
        showToast('Data exported successfully!');
    }

    return exportData;
}

/* ==========================================================================
   CSV Export
   ========================================================================== */

function exportToCSV(dataType) {
    const allData = collectAllData();
    const data = allData[dataType];

    if (!data || !Array.isArray(data) || data.length === 0) {
        if (typeof showToast === 'function') {
            showToast('No data to export');
        }
        return;
    }

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `life-reset-${dataType}-${getDateString()}.csv`);

    if (typeof showToast === 'function') {
        showToast(`${EXPORTABLE_DATA[dataType]?.name || dataType} exported!`);
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Header row
    csvRows.push(headers.map(header => escapeCSV(header)).join(','));

    // Data rows
    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            
            // Handle arrays and objects
            if (Array.isArray(value)) {
                value = value.join('; ');
            } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }

            return escapeCSV(value);
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    
    // Escape quotes and wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
}

/* ==========================================================================
   Import Data
   ========================================================================== */

async function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate structure
                if (!data.appVersion) {
                    throw new Error('Invalid backup file format');
                }

                const result = await processImport(data);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

async function processImport(data) {
    const results = {
        tasks: 0,
        habits: 0,
        goals: 0,
        journal: 0,
        mood: 0,
        success: true
    };

    try {
        // Import tasks
        if (data.tasks && Array.isArray(data.tasks)) {
            for (const task of data.tasks) {
                const exists = appState.tasks?.find(t => t.id === task.id);
                if (!exists) {
                    appState.tasks = appState.tasks || [];
                    appState.tasks.push(task);
                    results.tasks++;
                }
            }
        }

        // Import habits
        if (data.habits && Array.isArray(data.habits)) {
            for (const habit of data.habits) {
                const exists = appState.habits?.find(h => h.id === habit.id);
                if (!exists) {
                    appState.habits = appState.habits || [];
                    appState.habits.push(habit);
                    results.habits++;
                }
            }
        }

        // Import goals
        if (data.goals && Array.isArray(data.goals)) {
            for (const goal of data.goals) {
                const exists = appState.goals?.find(g => g.id === goal.id);
                if (!exists) {
                    appState.goals = appState.goals || [];
                    appState.goals.push(goal);
                    results.goals++;
                }
            }
        }

        // Import journal
        if (data.journal && Array.isArray(data.journal)) {
            for (const entry of data.journal) {
                const exists = appState.journalEntries?.find(j => j.id === entry.id);
                if (!exists) {
                    appState.journalEntries = appState.journalEntries || [];
                    appState.journalEntries.push(entry);
                    results.journal++;
                }
            }
        }

        // Import mood
        if (data.mood && Array.isArray(data.mood)) {
            for (const mood of data.mood) {
                const exists = appState.moodHistory?.find(m => m.id === mood.id);
                if (!exists) {
                    appState.moodHistory = appState.moodHistory || [];
                    appState.moodHistory.push(mood);
                    results.mood++;
                }
            }
        }

        // Save to local storage and sync
        if (typeof saveAllData === 'function') {
            await saveAllData();
        }

        if (typeof showToast === 'function') {
            const total = results.tasks + results.habits + results.goals + results.journal + results.mood;
            showToast(`Imported ${total} items successfully!`);
        }

    } catch (error) {
        console.error('[Export] Import error:', error);
        results.success = false;
        results.error = error.message;
    }

    return results;
}

/* ==========================================================================
   Cloud Backup
   ========================================================================== */

async function createCloudBackup() {
    if (!appState.isOnline || !appState.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please login and connect to internet');
        }
        return null;
    }

    try {
        const data = collectAllData();
        const backupId = `backup_${Date.now()}`;

        await firebase.firestore()
            .collection('users')
            .doc(appState.currentUser.uid)
            .collection('backups')
            .doc(backupId)
            .set({
                data: JSON.stringify(data),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                size: JSON.stringify(data).length,
                itemCount: {
                    tasks: data.tasks?.length || 0,
                    habits: data.habits?.length || 0,
                    goals: data.goals?.length || 0,
                    journal: data.journal?.length || 0,
                    mood: data.mood?.length || 0
                }
            });

        exportState.lastBackup = new Date().toISOString();
        await saveExportSettings();
        await loadExportSettings(); // Refresh backup list

        if (typeof showToast === 'function') {
            showToast('Cloud backup created!');
        }

        return backupId;
    } catch (error) {
        console.error('[Export] Cloud backup error:', error);
        if (typeof showToast === 'function') {
            showToast('Backup failed: ' + error.message);
        }
        return null;
    }
}

async function restoreCloudBackup(backupId) {
    if (!appState.isOnline || !appState.currentUser) {
        if (typeof showToast === 'function') {
            showToast('Please login and connect to internet');
        }
        return false;
    }

    try {
        const doc = await firebase.firestore()
            .collection('users')
            .doc(appState.currentUser.uid)
            .collection('backups')
            .doc(backupId)
            .get();

        if (!doc.exists) {
            throw new Error('Backup not found');
        }

        const backupData = JSON.parse(doc.data().data);
        const result = await processImport(backupData);

        if (result.success) {
            if (typeof showToast === 'function') {
                showToast('Backup restored successfully!');
            }
            
            // Refresh UI
            if (typeof renderDashboard === 'function') {
                renderDashboard();
            }
        }

        return result.success;
    } catch (error) {
        console.error('[Export] Restore error:', error);
        if (typeof showToast === 'function') {
            showToast('Restore failed: ' + error.message);
        }
        return false;
    }
}

async function deleteCloudBackup(backupId) {
    if (!appState.isOnline || !appState.currentUser) return false;

    try {
        await firebase.firestore()
            .collection('users')
            .doc(appState.currentUser.uid)
            .collection('backups')
            .doc(backupId)
            .delete();

        exportState.cloudBackups = exportState.cloudBackups.filter(b => b.id !== backupId);

        if (typeof showToast === 'function') {
            showToast('Backup deleted');
        }

        return true;
    } catch (error) {
        console.error('[Export] Delete backup error:', error);
        return false;
    }
}

/* ==========================================================================
   Auto Backup
   ========================================================================== */

function checkAutoBackup() {
    if (!exportState.autoBackupEnabled) return;

    const lastBackup = exportState.lastBackup ? new Date(exportState.lastBackup) : null;
    const now = new Date();

    if (!lastBackup) {
        createCloudBackup();
        return;
    }

    const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);

    switch (exportState.backupFrequency) {
        case 'daily':
            if (daysSinceBackup >= 1) createCloudBackup();
            break;
        case 'weekly':
            if (daysSinceBackup >= 7) createCloudBackup();
            break;
        case 'monthly':
            if (daysSinceBackup >= 30) createCloudBackup();
            break;
    }
}

function setAutoBackup(enabled, frequency = 'weekly') {
    exportState.autoBackupEnabled = enabled;
    exportState.backupFrequency = frequency;
    saveExportSettings();

    if (typeof showToast === 'function') {
        showToast(enabled ? `Auto-backup enabled (${frequency})` : 'Auto-backup disabled');
    }
}

/* ==========================================================================
   Utilities
   ========================================================================== */

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getDateString() {
    return new Date().toISOString().split('T')[0];
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderDataExport() {
    const container = document.getElementById('dataExportContainer');
    if (!container) return;

    const lastBackupStr = exportState.lastBackup 
        ? new Date(exportState.lastBackup).toLocaleString() 
        : 'Never';

    container.innerHTML = `
        <div class="export-section">
            <h2>📦 Data Export & Backup</h2>

            <div class="export-cards">
                <div class="export-card">
                    <h3>📥 Export Data</h3>
                    <p>Download your data for safekeeping</p>

                    <div class="export-options">
                        <div class="export-format">
                            <h4>Full Backup (JSON)</h4>
                            <p>Complete backup including all data</p>
                            <button class="btn-primary" onclick="exportToJSON()">
                                📄 Export JSON
                            </button>
                        </div>

                        <div class="export-format">
                            <h4>Individual Exports (CSV)</h4>
                            <p>Export specific data types</p>
                            <div class="csv-export-buttons">
                                ${Object.entries(EXPORTABLE_DATA).map(([key, info]) => 
                                    key !== 'stats' && key !== 'settings' ? `
                                        <button class="btn-secondary btn-sm" onclick="exportToCSV('${key}')">
                                            ${info.icon} ${info.name}
                                        </button>
                                    ` : ''
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="export-card">
                    <h3>📤 Import Data</h3>
                    <p>Restore from a previous backup</p>

                    <div class="import-zone" id="importZone">
                        <input type="file" id="importFileInput" accept=".json" 
                               onchange="handleFileImport(event)" style="display: none;">
                        <label for="importFileInput" class="import-label">
                            <span class="import-icon">📁</span>
                            <span>Click to select JSON file</span>
                            <span class="import-hint">or drag and drop</span>
                        </label>
                    </div>
                </div>

                <div class="export-card">
                    <h3>☁️ Cloud Backup</h3>
                    <p>Automatic backups to Firebase</p>

                    <div class="backup-status">
                        <span>Last backup: ${lastBackupStr}</span>
                    </div>

                    <div class="auto-backup-settings">
                        <label class="toggle-label">
                            <input type="checkbox" id="autoBackupToggle" 
                                   ${exportState.autoBackupEnabled ? 'checked' : ''}
                                   onchange="setAutoBackup(this.checked, document.getElementById('backupFrequency').value)">
                            <span class="toggle-slider"></span>
                            Enable auto-backup
                        </label>

                        <select id="backupFrequency" 
                                onchange="setAutoBackup(document.getElementById('autoBackupToggle').checked, this.value)">
                            <option value="daily" ${exportState.backupFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${exportState.backupFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${exportState.backupFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>

                    <button class="btn-primary" onclick="createCloudBackup()">
                        ☁️ Backup Now
                    </button>

                    ${exportState.cloudBackups.length > 0 ? `
                        <div class="cloud-backups">
                            <h4>Recent Backups</h4>
                            <div class="backup-list">
                                ${exportState.cloudBackups.map(backup => `
                                    <div class="backup-item">
                                        <div class="backup-info">
                                            <span class="backup-date">
                                                ${backup.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                                            </span>
                                            <span class="backup-size">${formatFileSize(backup.size || 0)}</span>
                                        </div>
                                        <div class="backup-actions">
                                            <button class="btn-sm btn-secondary" 
                                                    onclick="restoreCloudBackup('${backup.id}')">
                                                Restore
                                            </button>
                                            <button class="btn-sm btn-danger" 
                                                    onclick="deleteCloudBackup('${backup.id}'); renderDataExport();">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="data-overview">
                <h3>📊 Your Data Overview</h3>
                <div class="data-stats">
                    ${Object.entries(EXPORTABLE_DATA).map(([key, info]) => {
                        let count = 0;
                        switch(key) {
                            case 'tasks': count = appState.tasks?.length || 0; break;
                            case 'habits': count = appState.habits?.length || 0; break;
                            case 'goals': count = appState.goals?.length || 0; break;
                            case 'journal': count = appState.journalEntries?.length || 0; break;
                            case 'mood': count = appState.moodHistory?.length || 0; break;
                            default: count = '-';
                        }
                        return `
                            <div class="data-stat">
                                <span class="stat-icon">${info.icon}</span>
                                <span class="stat-name">${info.name}</span>
                                <span class="stat-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    // Setup drag and drop
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const dropZone = document.getElementById('importZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            await handleImport(file);
        } else {
            if (typeof showToast === 'function') {
                showToast('Please drop a JSON file');
            }
        }
    }, false);
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        await handleImport(file);
    }
}

async function handleImport(file) {
    try {
        const result = await importFromJSON(file);
        if (result.success) {
            renderDataExport();
        }
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Import failed: ' + error.message);
        }
    }
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initDataExport = initDataExport;
window.exportToJSON = exportToJSON;
window.exportToCSV = exportToCSV;
window.importFromJSON = importFromJSON;
window.createCloudBackup = createCloudBackup;
window.restoreCloudBackup = restoreCloudBackup;
window.deleteCloudBackup = deleteCloudBackup;
window.setAutoBackup = setAutoBackup;
window.renderDataExport = renderDataExport;
window.handleFileImport = handleFileImport;
window.EXPORTABLE_DATA = EXPORTABLE_DATA;
window.exportState = exportState;
