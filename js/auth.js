/**
 * @fileoverview Authentication Module
 * @description Handles user authentication including email/password and OAuth
 * @version 1.0.0
 */



/* ==========================================================================
   Email/Password Authentication
   ========================================================================== */

/**
 * Authenticate user with email and password
 * @async
 */
async function login() {
    if (!auth) {
        showToast('Firebase is not available. Please check your connection or try again later.', 'error');
        return;
    }
    
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

// Forgot Password Functions
function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    // Pre-fill email if already entered
    const loginEmail = document.getElementById('loginEmail').value;
    if (loginEmail) {
        document.getElementById('resetEmail').value = loginEmail;
    }
}

async function resetPassword() {
    if (!auth) {
        showToast('Firebase is not available. Please check your connection.', 'error');
        return;
    }
    
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }

    try {
        showAuthLoading(true);
        await auth.sendPasswordResetEmail(email);
        showToast('Password reset email sent! Check your inbox.', 'success');
        // Go back to login after success
        setTimeout(() => {
            showLogin();
            document.getElementById('loginEmail').value = email;
        }, 2000);
    } catch (error) {
        let errorMsg = error.message;
        if (error.code === 'auth/user-not-found') {
            errorMsg = 'No account found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg = 'Please enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg = 'Too many attempts. Please try again later.';
        }
        showToast(errorMsg, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function signup() {
    if (!auth || !db) {
        showToast('Firebase is not available. Please check your connection or try again later.', 'error');
        return;
    }
    
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
        
        // Create user document in Firestore with retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                await db.collection('users').doc(result.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: new Date(),
                    darkMode: false,
                    stats: appState.userStats
                });
                break;
            } catch (firestoreError) {
                retries--;
                if (retries === 0) throw firestoreError;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        handleUserLoggedIn(result.user);
    } catch (error) {
        let errorMsg = error.message;
        if (error.code === 'permission-denied') {
            errorMsg = 'Permission denied. Please check your Firestore rules.';
        }
        showToast('Signup failed: ' + errorMsg, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function googleSignIn() {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    
    if (!auth || !db) {
        showToast('Connecting to server...', 'info');
        await new Promise(r => setTimeout(r, 1000));
        if (!auth || !db) {
            showToast('Unable to connect. Please check your internet connection.', 'error');
            return;
        }
    }
    
    try {
        showAuthLoading(true);
        
        // Check if native Google Auth is available (Android app with plugin)
        if (isAndroid && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth) {
            // Use native Google Sign-In
            try {
                const GoogleAuth = window.Capacitor.Plugins.GoogleAuth;
                console.log('[GoogleAuth] Starting native sign-in...');
                const googleUser = await GoogleAuth.signIn();
                console.log('[GoogleAuth] Got response:', JSON.stringify(googleUser));
                
                // The plugin can return idToken in different places depending on version
                const idToken = googleUser.authentication?.idToken || 
                               googleUser.idToken || 
                               googleUser.credential?.idToken;
                const accessToken = googleUser.authentication?.accessToken || 
                                   googleUser.accessToken;
                
                console.log('[GoogleAuth] idToken exists:', !!idToken);
                console.log('[GoogleAuth] accessToken exists:', !!accessToken);
                
                let credential;
                if (idToken) {
                    console.log('[GoogleAuth] Creating credential with idToken...');
                    credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
                } else if (accessToken) {
                    console.log('[GoogleAuth] Creating credential with accessToken only...');
                    credential = firebase.auth.GoogleAuthProvider.credential(null, accessToken);
                } else {
                    // If no tokens, try to use the email to sign in directly
                    console.error('[GoogleAuth] No tokens received. Full response:', googleUser);
                    showToast('Sign-in error: Authentication failed. Please try again.', 'error');
                    return;
                }
                
                const result = await auth.signInWithCredential(credential);
                console.log('[GoogleAuth] Firebase sign-in successful');
                await handleGoogleSignInResult(result);
                return;
            } catch (nativeError) {
                console.error('[GoogleAuth] Native error:', nativeError);
                console.error('[GoogleAuth] Error code:', nativeError.code);
                console.error('[GoogleAuth] Error message:', nativeError.message);
                console.error('[GoogleAuth] Full error object:', JSON.stringify(nativeError));
                
                // Handle specific error codes
                const errorCode = nativeError.code || nativeError.error || '';
                const errorMsg = nativeError.message || '';
                
                if (errorCode === 12501 || errorCode === '12501' || 
                    errorMsg.includes('canceled') || errorMsg.includes('cancelled') ||
                    errorMsg.includes('user canceled')) {
                    showToast('Sign-in cancelled', 'info');
                } else if (errorCode === 10 || errorCode === '10' || errorMsg.includes('DEVELOPER_ERROR')) {
                    // Error 10 = Developer error - SHA-1 or package mismatch
                    console.error('[GoogleAuth] DEVELOPER_ERROR - Check: 1) SHA-1 in Firebase matches APK, 2) Package name matches, 3) google-services.json is up to date');
                    showToast('Configuration error (code 10). SHA-1 or package mismatch.', 'error');
                } else {
                    showToast('Google Sign-In failed: ' + (errorMsg || errorCode || 'Unknown error'), 'error');
                }
                return;
            }
        }
        
        // Web browser - use popup
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await auth.signInWithPopup(provider);
        await handleGoogleSignInResult(result);
        
    } catch (error) {
        console.error('Google Sign-In error:', error);
        let errorMsg = 'Sign-in failed. ';
        
        if (error.code === 'auth/popup-blocked') {
            const provider = new firebase.auth.GoogleAuthProvider();
            localStorage.setItem('googleSignInPending', 'true');
            await auth.signInWithRedirect(provider);
            return;
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMsg = 'Sign-in cancelled.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            return;
        } else if (error.code === 'auth/network-request-failed') {
            errorMsg = 'Network error. Please check your connection.';
        } else {
            errorMsg += error.message;
        }
        
        showToast(errorMsg, 'error');
    } finally {
        showAuthLoading(false);
    }
}

// Handle Google Sign-In result (used by both popup and redirect)
async function handleGoogleSignInResult(result) {
    if (result && result.user) {
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
    }
}

// Check for redirect result on page load
async function checkGoogleRedirectResult() {
    if (localStorage.getItem('googleSignInPending') === 'true') {
        localStorage.removeItem('googleSignInPending');
        
        try {
            showAuthLoading(true);
            const result = await auth.getRedirectResult();
            if (result && result.user) {
                await handleGoogleSignInResult(result);
            }
        } catch (error) {
            console.error('Redirect result error:', error);
            if (error.code !== 'auth/null-result') {
                showToast('Sign-in failed: ' + error.message, 'error');
            }
        } finally {
            showAuthLoading(false);
        }
    }
}

// Run redirect check when auth is ready
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            checkGoogleRedirectResult();
        }
    });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkGoogleRedirectResult, 500);
    });
}

async function guestSignIn() {
    if (!auth) {
        showToast('Firebase is not available. Please check your connection or try again later.', 'error');
        return;
    }
    
    try {
        showAuthLoading(true);
        const result = await auth.signInAnonymously();
        
        // Create guest user document with retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                await db.collection('users').doc(result.user.uid).set({
                    name: 'Guest',
                    isGuest: true,
                    createdAt: new Date(),
                    darkMode: false,
                    stats: appState.userStats
                });
                break;
            } catch (firestoreError) {
                retries--;
                if (retries === 0) throw firestoreError;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        handleUserLoggedIn(result.user);
    } catch (error) {
        let errorMsg = error.message;
        if (error.code === 'permission-denied') {
            errorMsg = 'Permission denied. Please check your Firestore rules.';
        }
        showToast('Guest sign-in failed: ' + errorMsg, 'error');
    } finally {
        showAuthLoading(false);
    }
}

async function handleUserLoggedIn(user) {
    appState.currentUser = user;
    
    // Show loading state
    showToast('Loading your data...', 'info');
    
    try {
        // Load data with timeout protection
        const loadWithTimeout = (fn, timeout = 5000) => {
            if (typeof fn !== 'function') return Promise.resolve();
            return Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
            ]).catch(e => console.warn('Load timeout/error:', e));
        };
        
        // Load data in the correct order (tasks list must exist before applying completion state)
        await loadWithTimeout(() => loadAllUserData(), 8000);
        await loadWithTimeout(() => loadCustomTasks(), 5000);
        await loadWithTimeout(() => loadTasksForDate(), 5000);

        // Remaining independent loads (don't block UI)
        Promise.all([
            loadWithTimeout(() => typeof loadJournalEntriesState === 'function' && loadJournalEntriesState(50)),
            loadWithTimeout(() => typeof loadMoodHistoryState === 'function' && loadMoodHistoryState(120)),
            loadWithTimeout(() => typeof loadTasksHistory === 'function' && loadTasksHistory(30)),
            loadWithTimeout(() => typeof loadXPDailyHistory === 'function' && loadXPDailyHistory(30))
        ]).catch(e => console.warn('Background load error:', e));
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
    
    // ALWAYS show the app UI, even if data loading fails
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appContainer').classList.add('show');
    
    // Update user info in settings (guard missing elements)
    if (user.displayName) {
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = user.displayName;
    }
    if (user.email) {
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = user.email;
    }
    
    // Initialize app UI
    initApp();
    
    // Setup real-time listeners (non-blocking)
    try {
        if (typeof setupRealtimeListeners === 'function') setupRealtimeListeners();
        if (typeof setupTasksRealtimeListener === 'function') setupTasksRealtimeListener();
        if (typeof setupCustomTasksRealtimeListener === 'function') setupCustomTasksRealtimeListener();
        if (typeof scheduleMidnightTrackerRefresh === 'function') scheduleMidnightTrackerRefresh();
    } catch (e) {
        console.warn('Realtime listener setup error:', e);
    }
    
    showToast('Welcome back! 🎉', 'success');
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Clean up all intervals and listeners before logout
            if (typeof cleanupRealtimeListeners === 'function') {
                cleanupRealtimeListeners();
            }
            
            // Clear midnight refresh timer
            if (window.midnightRefreshTimer) {
                clearTimeout(window.midnightRefreshTimer);
                window.midnightRefreshTimer = null;
            }
            
            // Stop backup interval
            if (typeof stopBackupInterval === 'function') {
                stopBackupInterval();
            }
            
            if (auth) {
                await auth.signOut();
            }
            appState.currentUser = null;
            document.getElementById('appContainer').classList.remove('show');
            document.getElementById('authScreen').style.display = 'flex';
            showToast('Logged out successfully', 'success');
            
            // Reset form
            const loginEmail = document.getElementById('loginEmail');
            const loginPassword = document.getElementById('loginPassword');
            if (loginEmail) loginEmail.value = '';
            if (loginPassword) loginPassword.value = '';
        } catch (error) {
            showToast('Logout failed: ' + error.message, 'error');
        }
    }
}

/**
 * Wrapper for logout - used by settings panel
 */
function handleLogout() {
    logout();
}

function showAuthLoading(show) {
    document.getElementById('authLoading').classList.toggle('show', show);
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.style.display = 'none';
}

// Initialize auth state listener
function initAuthListener() {
    if (!auth || !db) {
        // Retry in 200ms if Firebase isn't ready
        let retries = 3;
        const retryInterval = setInterval(() => {
            if (auth && db) {
                clearInterval(retryInterval);
                setupAuthListener();
            } else {
                retries--;
                if (retries === 0) {
                    clearInterval(retryInterval);
                    console.log('Firebase not available');
                    showToast('Firebase not available. Please refresh and check your connection/config.', 'error');
                }
            }
        }, 200);
        return;
    }
    
    setupAuthListener();
}

function setupAuthListener() {
    // Show loading while checking auth state
    const authScreen = document.getElementById('authScreen');
    const authLoading = document.getElementById('authLoading');
    
    // Brief loading state while checking persisted auth
    if (authLoading) authLoading.classList.add('show');
    
    auth.onAuthStateChanged((user) => {
        // Hide loading once we get auth state
        if (authLoading) authLoading.classList.remove('show');
        
        if (user) {
            console.log('[Auth] User found:', user.uid);
            handleUserLoggedIn(user);
        } else {
            console.log('[Auth] No user found, showing login');
            document.getElementById('appContainer').classList.remove('show');
            document.getElementById('authScreen').style.display = 'flex';
        }
    }, (error) => {
        console.error('Auth state listener error:', error);
        if (authLoading) authLoading.classList.remove('show');
        // Allow offline usage even if auth check fails
        document.getElementById('appContainer').classList.remove('show');
        document.getElementById('authScreen').style.display = 'flex';
    });
}
