// Mood and Journal Functions

function selectMood(mood, event) {
    appState.selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
        // Check if this button matches the selected mood using data attribute or onclick
        const btnMood = btn.getAttribute('data-mood') || 
                       (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${mood}'`));
        if (btnMood) {
            btn.classList.add('selected');
        }
    });
}

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
    const dateString = getDateString(appState.currentDate);
    const moodValue = appState.selectedMood;
    
    try {
        appState.userStats.moodLogged++;
        addXP(15);
        checkAndUnlockBadges();
        
        await db.collection('users').doc(appState.currentUser.uid)
            .collection('mood').doc(dateString).set(
                { mood: moodValue, note: note, timestamp: new Date() },
                { merge: true }
            );
        
        showToast('Mood logged successfully!', 'success');
        document.getElementById('moodNote').value = '';
        appState.selectedMood = null;
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    } catch (error) {
        showToast('Error saving mood: ' + error.message, 'error');
    }
}

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
        
        await db.collection('users').doc(appState.currentUser.uid)
            .collection('journal').add({
                content: entry,
                timestamp: new Date(),
                date: getDateString(new Date())
            });
        
        showToast('Journal entry saved!', 'success');
        document.getElementById('journalEntry').value = '';
        loadJournalEntries();
        updateGamificationUI();
    } catch (error) {
        showToast('Error saving journal: ' + error.message, 'error');
    }
}

async function loadJournalEntries() {
    const container = document.getElementById('journalHistory');
    if (!container || !appState.currentUser || !db) return;
    
    try {
        const snapshot = await db.collection('users').doc(appState.currentUser.uid)
            .collection('journal').orderBy('timestamp', 'desc').limit(20).get();
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp.seconds * 1000);
            const entry = document.createElement('div');
            entry.className = 'journal-entry';
            entry.innerHTML = `
                <div class="entry-header">
                    <span>${date.toLocaleDateString()}</span>
                    <span>${date.toLocaleTimeString()}</span>
                </div>
                <div class="entry-content">${data.content}</div>
                <div class="entry-actions">
                    <button class="action-btn" onclick="deleteJournalEntry('${doc.id}')">Delete</button>
                </div>
            `;
            container.appendChild(entry);
        });
    } catch (error) {
        console.log('Error loading journal entries:', error);
    }
}

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
