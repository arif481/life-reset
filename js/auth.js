// Authentication Functions
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        showAuthLoading(true);
        const result = await auth.signInWithEmailAndPassword(email, password);
        handleUserLoggedIn(result.user);
    } catch (error) {
        showToast('Login failed: ' + error.message, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupPasswordConfirm').value;

    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill all fields', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showAuthLoading(true);
        const result = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with name
        await result.user.updateProfile({ displayName: name });
        
        // Create user document in Firestore
        await db.collection('users').doc(result.user.uid).set({
            name: name,
            email: email,
            createdAt: new Date(),
            darkMode: false,
            stats: appState.userStats
        });
        
        handleUserLoggedIn(result.user);
    } catch (error) {
        showToast('Signup failed: ' + error.message, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        showAuthLoading(true);
        const result = await auth.signInWithPopup(provider);
        
        // Create user document if first time
        const userRef = db.collection('users').doc(result.user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                name: result.user.displayName,
                email: result.user.email,
                createdAt: new Date(),
                darkMode: false,
                stats: appState.userStats
            });
        }
        
        handleUserLoggedIn(result.user);
    } catch (error) {
        showToast('Google sign-in failed: ' + error.message, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function guestSignIn() {
    try {
        showAuthLoading(true);
        const result = await auth.signInAnonymously();
        
        // Create guest user document
        await db.collection('users').doc(result.user.uid).set({
            name: 'Guest User',
            email: 'guest@lifereset.local',
            isGuest: true,
            createdAt: new Date(),
            darkMode: false,
            stats: appState.userStats
        });
        
        handleUserLoggedIn(result.user);
    } catch (error) {
        showToast('Guest sign-in failed: ' + error.message, 'error');
    } finally {
        showAuthLoading(false);
    }
}

function handleUserLoggedIn(user) {
    appState.currentUser = user;
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appContainer').classList.add('show');
    
    // Update user info in settings
    if (user.displayName) {
        document.getElementById('userName').textContent = user.displayName;
    }
    if (user.email) {
        document.getElementById('userEmail').textContent = user.email;
    }
    
    // Load custom tasks and user data
    loadCustomTasks();
    loadUserData();
    initApp();
    showToast('Welcome back!', 'success');
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await auth.signOut();
            appState.currentUser = null;
            document.getElementById('appContainer').classList.remove('show');
            document.getElementById('authScreen').style.display = 'flex';
            showToast('Logged out successfully', 'success');
            
            // Reset form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } catch (error) {
            showToast('Logout failed: ' + error.message, 'error');
        }
    }
}

function showAuthLoading(show) {
    document.getElementById('authLoading').classList.toggle('show', show);
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

// Initialize auth state listener
function initAuthListener() {
    if (!auth) {
        setTimeout(initAuthListener, 100); // Wait for Firebase to initialize
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            handleUserLoggedIn(user);
        } else {
            document.getElementById('appContainer').classList.remove('show');
            document.getElementById('authScreen').style.display = 'flex';
        }
    });
}
