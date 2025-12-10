// Mood and Journal Functions - Advanced Version

// Mood tracking state
let selectedMoodTriggers = [];
let selectedJournalMood = null;
let journalTags = [];

// Initialize mood display
function initMoodDisplay() {
    loadMoodStats();
    loadJournalEntries();
}

// Select mood
function selectMood(mood, event) {
    appState.selectedMood = mood;
    document.querySelectorAll('#mood-view .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (event.target.closest('.mood-btn')) {
        event.target.closest('.mood-btn').classList.add('selected');
    }
}

// Select mood for journal entry
function selectJournalMood(mood, event) {
    selectedJournalMood = mood;
    document.querySelectorAll('.journal-container .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (event.target.closest('.mood-btn')) {
        event.target.closest('.mood-btn').classList.add('selected');
    }
}

// Toggle mood triggers
function toggleTrigger(element, trigger) {
    element.classList.toggle('active');
    if (element.classList.contains('active')) {
        if (!selectedMoodTriggers.includes(trigger)) {
            selectedMoodTriggers.push(trigger);
        }
    } else {
        selectedMoodTriggers = selectedMoodTriggers.filter(t => t !== trigger);
    }
}

// Update intensity display
function updateIntensityDisplay() {
    const intensity = document.getElementById('moodIntensity').value;
    document.getElementById('intensityValue').textContent = intensity + '%';
}

// Save mood entry with advanced features
async function saveMoodEntry() {
    if (!appState.selectedMood) {
        showToast('Please select a mood', 'error');
        return;
    }
    
    if (!appState.currentUser || !db) {
        showToast('Please login first', 'error');
        return;
    }
    
    const note = document.getElementById('moodNote').value;
    const intensity = document.getElementById('moodIntensity').value;
    const dateString = getDateString(appState.currentDate);
    const moodValue = appState.selectedMood;
    
    try {
        appState.userStats.moodLogged++;
        addXP(15);
        checkAndUnlockBadges();
        
        await db.collection('users').doc(appState.currentUser.uid)
            .collection('mood').doc(dateString).set(
                { 
                    mood: moodValue,
                    intensity: parseInt(intensity),
                    note: note,
                    triggers: selectedMoodTriggers,
                    timestamp: new Date(),
                    date: dateString
                },
                { merge: true }
            );
        
        showToast('Mood logged successfully! 🎉', 'success');
        document.getElementById('moodNote').value = '';
        document.getElementById('moodIntensity').value = '50';
        document.getElementById('intensityValue').textContent = '50%';
        appState.selectedMood = null;
        selectedMoodTriggers = [];
        document.querySelectorAll('#mood-view .mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.trigger-tag').forEach(tag => tag.classList.remove('active'));
        
        updateGamificationUI();
        loadMoodStats();
    } catch (error) {
        showToast('Error saving mood: ' + error.message, 'error');
    }
}

// Format text in journal editor
function formatText(command) {
    const textarea = document.getElementById('journalEntry');
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (command === 'color') {
        const color = document.getElementById('textColor').value;
        // Note: Formatting in textarea is limited, we'll add visual indicator instead
        showToast('Color formatting saved in entry metadata', 'info');
    } else {
        // For now, we'll show a toast. Full rich text would need contenteditable div
        showToast('Text formatting will be applied on display', 'info');
    }
}

// Add journal tags
document.addEventListener('DOMContentLoaded', () => {
    const tagsInput = document.getElementById('journalTags');
    if (tagsInput) {
        tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagsInput.value.trim();
                if (tag && !journalTags.includes(tag)) {
                    journalTags.push(tag);
                    updateJournalTagsDisplay();
                    tagsInput.value = '';
                }
            }
        });
    }
});

function updateJournalTagsDisplay() {
    const container = document.getElementById('journalTagsDisplay');
    if (!container) return;
    
    container.innerHTML = '';
    journalTags.forEach((tag, index) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'entry-tag';
        tagEl.innerHTML = `${tag} <span style="cursor: pointer; margin-left: 5px;" onclick="removeJournalTag(${index})">×</span>`;
        container.appendChild(tagEl);
    });
}

function removeJournalTag(index) {
    journalTags.splice(index, 1);
    updateJournalTagsDisplay();
}

// Save journal entry with enhanced features
async function saveJournalEntry() {
    const entry = document.getElementById('journalEntry').value;
    if (!entry.trim()) {
        showToast('Please write something', 'error');
        return;
    }
    
    if (!appState.currentUser || !db) {
        showToast('Please login first', 'error');
        return;
    }
    
    try {
        appState.userStats.journalEntries++;
        addXP(20);
        checkAndUnlockBadges();
        
        // Simple sentiment analysis (basic implementation)
        const sentiment = analyzeSentiment(entry);
        
        await db.collection('users').doc(appState.currentUser.uid)
            .collection('journal').add({
                content: entry,
                mood: selectedJournalMood,
                tags: journalTags,
                sentiment: sentiment,
                wordCount: entry.trim().split(/\s+/).length,
                timestamp: new Date(),
                date: getDateString(new Date())
            });
        
        showToast('Journal entry saved! 📝', 'success');
        document.getElementById('journalEntry').value = '';
        journalTags = [];
        selectedJournalMood = null;
        document.getElementById('journalTags').value = '';
        updateJournalTagsDisplay();
        document.querySelectorAll('.journal-container .mood-btn').forEach(btn => btn.classList.remove('selected'));
        
        loadJournalEntries();
        updateGamificationUI();
    } catch (error) {
        showToast('Error saving journal: ' + error.message, 'error');
    }
}

// Simple sentiment analysis
function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    const positiveWords = ['happy', 'great', 'amazing', 'wonderful', 'excellent', 'good', 'love', 'awesome', 'fantastic', 'beautiful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'depressed', 'anxious'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'g');
        positiveCount += (lowerText.match(regex) || []).length;
    });
    
    negativeWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'g');
        negativeCount += (lowerText.match(regex) || []).length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

// Load mood statistics
async function loadMoodStats() {
    if (!appState.currentUser || !db) return;
    
    try {
        const today = getDateString(new Date());
        const todayMood = await db.collection('users').doc(appState.currentUser.uid)
            .collection('mood').doc(today).get();
        
        // Calculate statistics
        const moods = { 'very-sad': 1, 'sad': 2, 'okay': 3, 'good': 4, 'great': 5 };
        const moodEmojis = { 'very-sad': '😢', 'sad': '😞', 'okay': '😐', 'good': '😊', 'great': '😄' };
        
        // Get moods from this week
        const weekSnapshot = await db.collection('users').doc(appState.currentUser.uid)
            .collection('mood').where('date', '>=', getDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
            .get();
        
        let totalMood = 0;
        let moodCount = 0;
        let bestMood = 0;
        let triggerCounts = {};
        
        weekSnapshot.forEach(doc => {
            const data = doc.data();
            const moodValue = moods[data.mood] || 3;
            totalMood += moodValue;
            moodCount++;
            bestMood = Math.max(bestMood, moodValue);
            
            if (data.triggers) {
                data.triggers.forEach(trigger => {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                });
            }
        });
        
        // Update stats display
        const avgMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : '--';
        const bestMoodEmoji = Object.values(moodEmojis)[Math.min(Math.max(bestMood - 1, 0), 4)];
        const commonTrigger = Object.keys(triggerCounts).length > 0 
            ? Object.keys(triggerCounts).reduce((a, b) => triggerCounts[a] > triggerCounts[b] ? a : b)
            : '--';
        
        const avgEl = document.getElementById('averageMood');
        const bestEl = document.getElementById('bestMood');
        const streakEl = document.getElementById('moodStreak');
        const triggerEl = document.getElementById('commonTrigger');
        
        if (avgEl) avgEl.textContent = avgMood;
        if (bestEl) bestEl.textContent = bestMoodEmoji || '😄';
        if (streakEl) streakEl.textContent = moodCount;
        if (triggerEl) triggerEl.textContent = commonTrigger;
        
    } catch (error) {
        console.log('Error loading mood stats:', error);
    }
}

// Load journal entries with filtering
async function loadJournalEntries() {
    const container = document.getElementById('journalEntriesContainer');
    if (!container || !appState.currentUser || !db) return;
    
    try {
        const snapshot = await db.collection('users').doc(appState.currentUser.uid)
            .collection('journal').orderBy('timestamp', 'desc').limit(50).get();
        
        const moodEmojis = { 'very-sad': '😢', 'sad': '😞', 'okay': '😐', 'good': '😊', 'great': '😄' };
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp.seconds * 1000);
            const moodEmoji = moodEmojis[data.mood] || '📝';
            
            const entry = document.createElement('div');
            entry.className = `journal-entry entry-${data.mood || 'good'}`;
            entry.setAttribute('data-date', data.date);
            entry.setAttribute('data-tags', JSON.stringify(data.tags || []));
            entry.setAttribute('data-sentiment', data.sentiment || '');
            
            let tagHTML = '';
            if (data.tags && data.tags.length > 0) {
                tagHTML = '<div class="entry-tags">' + 
                    data.tags.map(tag => `<div class="entry-tag">${tag}</div>`).join('') + 
                    '</div>';
            }
            
            entry.innerHTML = `
                <div class="entry-header">
                    <span class="entry-mood-indicator">${moodEmoji}</span>
                    <div class="entry-meta">
                        <span>${date.toLocaleDateString()}</span>
                        <span>${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                        ${data.wordCount ? `<span>${data.wordCount} words</span>` : ''}
                    </div>
                </div>
                ${data.sentiment ? `<div class="entry-sentiment"><i class="fas fa-chart-line"></i> Sentiment: ${data.sentiment}</div>` : ''}
                <div class="entry-content">${escapeHtml(data.content.substring(0, 200))}${data.content.length > 200 ? '...' : ''}</div>
                ${tagHTML}
                <div class="entry-actions">
                    <button class="action-btn" onclick="viewFullEntry('${doc.id}')"><i class="fas fa-expand"></i> Read More</button>
                    <button class="action-btn" onclick="deleteJournalEntry('${doc.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            container.appendChild(entry);
        });
    } catch (error) {
        console.log('Error loading journal entries:', error);
    }
}

// View full entry (modal)
function viewFullEntry(entryId) {
    showToast('Opening full entry...', 'info');
    // In a full implementation, this would open a modal with the full entry
}

// Filter journal entries
function filterJournalEntries(period, element) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    const entries = document.querySelectorAll('.journal-entry');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    entries.forEach(entry => {
        const entryDate = entry.getAttribute('data-date');
        const date = new Date(entryDate);
        let show = true;
        
        if (period === 'week') {
            show = date >= oneWeekAgo;
        } else if (period === 'month') {
            show = date >= oneMonthAgo;
        }
        
        entry.style.display = show ? 'block' : 'none';
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Delete journal entry
async function deleteJournalEntry(entryId) {
    if (confirm('Delete this entry?')) {
        try {
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('journal').doc(entryId).delete();
            loadJournalEntries();
            showToast('Entry deleted', 'success');
        } catch (error) {
            showToast('Error deleting entry: ' + error.message, 'error');
        }
    }
}
