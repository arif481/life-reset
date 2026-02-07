/**
 * @fileoverview Social Features Module
 * @description Friends, leaderboards, accountability partners, sharing
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Social State
   ========================================================================== */

let socialState = {
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    accountabilityPartner: null,
    leaderboard: [],
    sharedChallenges: []
};

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initSocial() {
    console.log('[Social] Initializing...');
    await loadSocialData();
    console.log('[Social] Initialized with', socialState.friends.length, 'friends');
}

async function loadSocialData() {
    try {
        if (!appState.isOnline || !appState.currentUser) {
            const saved = localStorage.getItem('socialData');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(socialState, data);
            }
            return;
        }

        const userId = appState.currentUser.uid;
        const db = firebase.firestore();

        // Load friends
        const friendsDoc = await db.collection('users').doc(userId).collection('social').doc('friends').get();
        if (friendsDoc.exists) {
            socialState.friends = friendsDoc.data().list || [];
        }

        // Load pending requests
        const requestsSnap = await db.collection('friendRequests')
            .where('toUserId', '==', userId)
            .where('status', '==', 'pending')
            .get();
        
        socialState.pendingRequests = requestsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Load accountability partner
        const partnerDoc = await db.collection('users').doc(userId).collection('social').doc('partner').get();
        if (partnerDoc.exists) {
            socialState.accountabilityPartner = partnerDoc.data();
        }

        // Load leaderboard
        await refreshLeaderboard();

    } catch (error) {
        console.error('[Social] Error loading data:', error);
    }
}

async function saveSocialData() {
    try {
        localStorage.setItem('socialData', JSON.stringify(socialState));

        if (appState.isOnline && appState.currentUser) {
            const userId = appState.currentUser.uid;
            const db = firebase.firestore();

            await db.collection('users').doc(userId).collection('social').doc('friends').set({
                list: socialState.friends,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        console.error('[Social] Error saving data:', error);
    }
}

/* ==========================================================================
   Friend Management
   ========================================================================== */

async function searchUsers(query) {
    if (!query || query.length < 3) return [];
    
    try {
        const db = firebase.firestore();
        const results = [];

        // Search by display name
        const nameSnap = await db.collection('users')
            .where('displayName', '>=', query)
            .where('displayName', '<=', query + '\uf8ff')
            .limit(10)
            .get();

        nameSnap.docs.forEach(doc => {
            if (doc.id !== appState.currentUser?.uid) {
                results.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        // Search by email
        const emailSnap = await db.collection('users')
            .where('email', '==', query.toLowerCase())
            .limit(5)
            .get();

        emailSnap.docs.forEach(doc => {
            if (doc.id !== appState.currentUser?.uid && !results.find(r => r.id === doc.id)) {
                results.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        return results;
    } catch (error) {
        console.error('[Social] Search error:', error);
        return [];
    }
}

async function sendFriendRequest(targetUserId) {
    if (!appState.currentUser) return { success: false, error: 'Not logged in' };

    try {
        const db = firebase.firestore();
        const userId = appState.currentUser.uid;

        // Check if already friends
        if (socialState.friends.some(f => f.id === targetUserId)) {
            return { success: false, error: 'Already friends' };
        }

        // Check if request already sent
        const existingReq = await db.collection('friendRequests')
            .where('fromUserId', '==', userId)
            .where('toUserId', '==', targetUserId)
            .where('status', '==', 'pending')
            .get();

        if (!existingReq.empty) {
            return { success: false, error: 'Request already sent' };
        }

        // Get current user's profile
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        // Create request
        await db.collection('friendRequests').add({
            fromUserId: userId,
            fromUserName: userData.displayName || 'Anonymous',
            fromUserPhoto: userData.photoURL || null,
            toUserId: targetUserId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        socialState.sentRequests.push({ toUserId: targetUserId });
        
        return { success: true };
    } catch (error) {
        console.error('[Social] Friend request error:', error);
        return { success: false, error: error.message };
    }
}

async function acceptFriendRequest(requestId) {
    if (!appState.currentUser) return { success: false };

    try {
        const db = firebase.firestore();
        const userId = appState.currentUser.uid;

        // Get request
        const requestDoc = await db.collection('friendRequests').doc(requestId).get();
        if (!requestDoc.exists) return { success: false, error: 'Request not found' };

        const request = requestDoc.data();

        // Update request status
        await db.collection('friendRequests').doc(requestId).update({
            status: 'accepted',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Add to both users' friend lists
        const friendData = {
            id: request.fromUserId,
            name: request.fromUserName,
            photo: request.fromUserPhoto,
            addedAt: new Date().toISOString()
        };

        socialState.friends.push(friendData);
        await saveSocialData();

        // Add to sender's friend list
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        await db.collection('users').doc(request.fromUserId).collection('social').doc('friends').set({
            list: firebase.firestore.FieldValue.arrayUnion({
                id: userId,
                name: userData.displayName || 'Anonymous',
                photo: userData.photoURL || null,
                addedAt: new Date().toISOString()
            })
        }, { merge: true });

        // Remove from pending
        socialState.pendingRequests = socialState.pendingRequests.filter(r => r.id !== requestId);

        return { success: true };
    } catch (error) {
        console.error('[Social] Accept request error:', error);
        return { success: false, error: error.message };
    }
}

async function declineFriendRequest(requestId) {
    try {
        const db = firebase.firestore();
        await db.collection('friendRequests').doc(requestId).update({
            status: 'declined',
            declinedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        socialState.pendingRequests = socialState.pendingRequests.filter(r => r.id !== requestId);
        return { success: true };
    } catch (error) {
        console.error('[Social] Decline request error:', error);
        return { success: false };
    }
}

async function removeFriend(friendId) {
    try {
        socialState.friends = socialState.friends.filter(f => f.id !== friendId);
        await saveSocialData();

        // Also remove from their list
        if (appState.isOnline && appState.currentUser) {
            const db = firebase.firestore();
            const friendDoc = await db.collection('users').doc(friendId).collection('social').doc('friends').get();
            
            if (friendDoc.exists) {
                const friendList = friendDoc.data().list || [];
                const updatedList = friendList.filter(f => f.id !== appState.currentUser.uid);
                await db.collection('users').doc(friendId).collection('social').doc('friends').update({
                    list: updatedList
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('[Social] Remove friend error:', error);
        return { success: false };
    }
}

/* ==========================================================================
   Leaderboard
   ========================================================================== */

async function refreshLeaderboard() {
    try {
        const db = firebase.firestore();
        
        // Get top users by XP this week
        const weekStart = getWeekStart(new Date());
        
        const leaderboardSnap = await db.collection('leaderboard')
            .where('week', '==', getDateString(weekStart))
            .orderBy('xp', 'desc')
            .limit(50)
            .get();

        if (!leaderboardSnap.empty) {
            socialState.leaderboard = leaderboardSnap.docs.map((doc, index) => ({
                rank: index + 1,
                id: doc.id,
                ...doc.data()
            }));
        } else {
            // Fallback: Get from user stats
            const usersSnap = await db.collection('users')
                .orderBy('stats.totalXP', 'desc')
                .limit(50)
                .get();

            socialState.leaderboard = usersSnap.docs.map((doc, index) => ({
                rank: index + 1,
                id: doc.id,
                name: doc.data().displayName || 'Anonymous',
                photo: doc.data().photoURL,
                xp: doc.data().stats?.totalXP || 0,
                level: doc.data().stats?.level || 1,
                streak: doc.data().stats?.streak || 0
            }));
        }

        return socialState.leaderboard;
    } catch (error) {
        console.error('[Social] Leaderboard error:', error);
        return [];
    }
}

async function updateLeaderboardEntry() {
    if (!appState.currentUser) return;

    try {
        const db = firebase.firestore();
        const userId = appState.currentUser.uid;
        const weekStart = getWeekStart(new Date());

        await db.collection('leaderboard').doc(userId).set({
            name: appState.currentUser.displayName || 'Anonymous',
            photo: appState.currentUser.photoURL,
            xp: appState.userStats?.totalXP || 0,
            level: appState.userStats?.level || 1,
            streak: appState.userStats?.streak || 0,
            week: getDateString(weekStart),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('[Social] Update leaderboard error:', error);
    }
}

function getMyLeaderboardRank() {
    if (!appState.currentUser) return null;
    const entry = socialState.leaderboard.find(e => e.id === appState.currentUser.uid);
    return entry?.rank || null;
}

/* ==========================================================================
   Accountability Partner
   ========================================================================== */

async function setAccountabilityPartner(friendId) {
    const friend = socialState.friends.find(f => f.id === friendId);
    if (!friend) return { success: false, error: 'Not a friend' };

    try {
        socialState.accountabilityPartner = {
            id: friend.id,
            name: friend.name,
            photo: friend.photo,
            since: new Date().toISOString()
        };

        if (appState.isOnline && appState.currentUser) {
            const db = firebase.firestore();
            await db.collection('users').doc(appState.currentUser.uid)
                .collection('social').doc('partner').set(socialState.accountabilityPartner);
        }

        return { success: true };
    } catch (error) {
        console.error('[Social] Set partner error:', error);
        return { success: false };
    }
}

async function sendPartnerUpdate(message) {
    if (!socialState.accountabilityPartner) return;

    try {
        const db = firebase.firestore();
        await db.collection('partnerUpdates').add({
            fromUserId: appState.currentUser.uid,
            fromUserName: appState.currentUser.displayName,
            toUserId: socialState.accountabilityPartner.id,
            message,
            type: 'progress',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('[Social] Partner update error:', error);
    }
}

async function shareProgressWithPartner() {
    if (!socialState.accountabilityPartner) return;

    const stats = appState.userStats || {};
    const message = `📊 Progress Update:\n` +
        `🔥 Streak: ${stats.streak || 0} days\n` +
        `⭐ Level: ${stats.level || 1}\n` +
        `✅ Tasks Today: ${stats.todayCompleted || 0}`;

    await sendPartnerUpdate(message);
    
    if (typeof showToast === 'function') {
        showToast('Progress shared with your accountability partner! 🤝');
    }
}

/* ==========================================================================
   Shared Challenges
   ========================================================================== */

async function createSharedChallenge(challengeData, friendIds) {
    if (!appState.currentUser) return { success: false };

    try {
        const db = firebase.firestore();
        const userId = appState.currentUser.uid;

        const challenge = {
            ...challengeData,
            creatorId: userId,
            creatorName: appState.currentUser.displayName,
            participants: [userId, ...friendIds],
            participantProgress: {
                [userId]: 0
            },
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        friendIds.forEach(id => {
            challenge.participantProgress[id] = 0;
        });

        const docRef = await db.collection('sharedChallenges').add(challenge);
        
        // Notify participants
        for (const friendId of friendIds) {
            await db.collection('notifications').add({
                userId: friendId,
                type: 'challenge_invite',
                fromUserId: userId,
                fromUserName: appState.currentUser.displayName,
                challengeId: docRef.id,
                challengeTitle: challengeData.title,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('[Social] Create shared challenge error:', error);
        return { success: false };
    }
}

async function updateSharedChallengeProgress(challengeId, progress) {
    if (!appState.currentUser) return;

    try {
        const db = firebase.firestore();
        const userId = appState.currentUser.uid;

        await db.collection('sharedChallenges').doc(challengeId).update({
            [`participantProgress.${userId}`]: progress
        });
    } catch (error) {
        console.error('[Social] Update shared challenge error:', error);
    }
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderSocialUI() {
    const container = document.getElementById('socialContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="social-section">
            <div class="social-header">
                <h2>👥 Social</h2>
                <button class="btn-primary btn-sm" onclick="showAddFriendModal()">
                    <i class="fas fa-user-plus"></i> Add Friend
                </button>
            </div>

            ${socialState.pendingRequests.length > 0 ? `
                <div class="friend-requests">
                    <h3>📬 Friend Requests (${socialState.pendingRequests.length})</h3>
                    ${socialState.pendingRequests.map(req => `
                        <div class="request-card">
                            <img src="${req.fromUserPhoto || 'icons/default-avatar.png'}" alt="${req.fromUserName}" class="avatar">
                            <span class="name">${req.fromUserName}</span>
                            <div class="request-actions">
                                <button class="btn-success btn-sm" onclick="acceptFriendRequest('${req.id}')">Accept</button>
                                <button class="btn-secondary btn-sm" onclick="declineFriendRequest('${req.id}')">Decline</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="friends-list">
                <h3>🤝 Friends (${socialState.friends.length})</h3>
                ${socialState.friends.length > 0 ? `
                    <div class="friends-grid">
                        ${socialState.friends.map(friend => `
                            <div class="friend-card">
                                <img src="${friend.photo || 'icons/default-avatar.png'}" alt="${friend.name}" class="avatar">
                                <span class="name">${friend.name}</span>
                                <div class="friend-actions">
                                    <button class="btn-icon" onclick="setAccountabilityPartner('${friend.id}')" title="Set as Partner">🤝</button>
                                    <button class="btn-icon" onclick="showFriendProfile('${friend.id}')" title="View Profile">👤</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="empty-state">No friends yet. Add some to compete and stay accountable!</p>'}
            </div>

            ${socialState.accountabilityPartner ? `
                <div class="accountability-section">
                    <h3>🎯 Accountability Partner</h3>
                    <div class="partner-card">
                        <img src="${socialState.accountabilityPartner.photo || 'icons/default-avatar.png'}" alt="${socialState.accountabilityPartner.name}" class="avatar-lg">
                        <div class="partner-info">
                            <span class="name">${socialState.accountabilityPartner.name}</span>
                            <span class="since">Partner since ${new Date(socialState.accountabilityPartner.since).toLocaleDateString()}</span>
                        </div>
                        <button class="btn-primary btn-sm" onclick="shareProgressWithPartner()">
                            📤 Share Progress
                        </button>
                    </div>
                </div>
            ` : ''}

            <div class="leaderboard-section">
                <h3>🏆 Weekly Leaderboard</h3>
                <div class="leaderboard">
                    ${socialState.leaderboard.slice(0, 10).map((entry, index) => `
                        <div class="leaderboard-entry ${entry.id === appState.currentUser?.uid ? 'is-me' : ''}">
                            <span class="rank">${getRankEmoji(index + 1)}</span>
                            <img src="${entry.photo || 'icons/default-avatar.png'}" alt="${entry.name}" class="avatar-sm">
                            <span class="name">${entry.name}</span>
                            <span class="level">Lv.${entry.level}</span>
                            <span class="xp">${formatNumber(entry.xp)} XP</span>
                            <span class="streak">🔥${entry.streak}</span>
                        </div>
                    `).join('') || '<p class="empty-state">Leaderboard loading...</p>'}
                </div>
                <button class="btn-secondary btn-sm full-width" onclick="refreshLeaderboard().then(renderSocialUI)">
                    🔄 Refresh
                </button>
            </div>
        </div>
    `;
}

function showAddFriendModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addFriendModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👤 Add Friend</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Search by name or email</label>
                    <input type="text" id="friendSearchInput" placeholder="Enter name or email..." 
                           oninput="handleFriendSearch(this.value)">
                </div>
                <div id="friendSearchResults" class="search-results"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

async function handleFriendSearch(query) {
    const resultsContainer = document.getElementById('friendSearchResults');
    if (!resultsContainer) return;

    if (query.length < 3) {
        resultsContainer.innerHTML = '<p class="hint">Type at least 3 characters to search</p>';
        return;
    }

    resultsContainer.innerHTML = '<p class="loading">Searching...</p>';

    const results = await searchUsers(query);

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-state">No users found</p>';
        return;
    }

    resultsContainer.innerHTML = results.map(user => `
        <div class="search-result-item">
            <img src="${user.photoURL || 'icons/default-avatar.png'}" alt="${user.displayName}" class="avatar">
            <span class="name">${user.displayName || 'Anonymous'}</span>
            <button class="btn-primary btn-sm" onclick="sendFriendRequest('${user.id}').then(r => {
                if(r.success) { showToast('Request sent!'); this.disabled=true; this.textContent='Sent'; }
                else { showToast(r.error || 'Failed'); }
            })">Add</button>
        </div>
    `).join('');
}

function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initSocial = initSocial;
window.loadSocialData = loadSocialData;
window.searchUsers = searchUsers;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.removeFriend = removeFriend;
window.refreshLeaderboard = refreshLeaderboard;
window.updateLeaderboardEntry = updateLeaderboardEntry;
window.getMyLeaderboardRank = getMyLeaderboardRank;
window.setAccountabilityPartner = setAccountabilityPartner;
window.shareProgressWithPartner = shareProgressWithPartner;
window.createSharedChallenge = createSharedChallenge;
window.renderSocialUI = renderSocialUI;
window.showAddFriendModal = showAddFriendModal;
window.handleFriendSearch = handleFriendSearch;
window.socialState = socialState;
