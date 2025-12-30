/**
 * @fileoverview UI Navigation & Layout Module
 * @description Handles view navigation, theme management, and UI interactions
 * @version 1.0.0
 */



/* ==========================================================================
   Application Initialization
   ========================================================================== */

/**
 * Initialize the application UI and state
 */
function initApp() {
    // Apply saved theme early
    if (typeof applyTheme === 'function') {
        applyTheme(localStorage.getItem('theme') || 'default');
    }

    // Set up dark mode
    if (appState.isDarkMode) {
        document.body.classList.add('dark-mode');
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) darkModeToggle.textContent = '☀️';
    }

    // Update date display
    updateDateDisplay();

    // Initialize charts if available
    if (typeof Chart !== 'undefined') {
        if (!moodTrendChart && !completionRateChart) {
            // Charts will be initialized when analytics view is opened
            console.log('Chart.js loaded and ready');
        }
    }

    // Set up task categories and achievements
    try {
        renderTaskCategories();
        renderBadges();
    } catch (error) {
        console.warn('Error rendering initial UI:', error);
    }

    // Load user data if available
    if (appState.currentUser && db) {
        loadAllUserData();
    }

    // Initialize dashboard
    try {
        initDashboard();
    } catch (error) {
        console.warn('Dashboard initialization warning:', error);
    }

    // Update gamification UI
    updateGamificationUI();
}

function navigateTo(view) {
    appState.currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`.nav-item[onclick="navigateTo('${view}')"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'tracker': 'Daily Tracker',
        'mood': 'Mood & Journal',
        'journal': 'Journal',
        'analytics': 'Analytics',
        'resources': 'Crisis Resources',
        'goals': 'Goals & Habits',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
    
    // Show/hide views
    document.querySelectorAll('[id$="-view"]').forEach(v => v.style.display = 'none');
    document.getElementById(view + '-view').style.display = 'block';
    
    // Load specific data for the view
    if (view === 'dashboard') {
        initDashboard();
    }
    if (view === 'analytics') {
        // Initialize advanced analytics
        setTimeout(() => {
            initAnalytics();
        }, 100);
    }
    if (view === 'mood') {
        loadMoodStats();
    }
    if (view === 'journal') {
        loadJournalEntries();
    }
    if (view === 'goals') {
        renderGoals();
        renderHabitChain();
    }
    if (view === 'settings') {
        // Initialize advanced settings
        if (typeof initSettings === 'function') {
            initSettings();
        }
    }
    
    closeUserMenu();
    
    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.style.display = 'none';
    }
}

// Accessibility: close sidebar on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.style.display = 'none';
        }
    }
});

// Close sidebar on swipe-left (basic)
let touchStartX = null;
document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
    }
});
document.addEventListener('touchmove', (e) => {
    if (touchStartX !== null && e.touches && e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartX;
        if (deltaX < -50) { // swipe left
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                if (overlay) overlay.style.display = 'none';
            }
            touchStartX = null;
        }
    }
});
document.addEventListener('touchend', () => { touchStartX = null; });
document.addEventListener('touchcancel', () => { touchStartX = null; });

// Ensure sidebar resets when resizing to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.style.display = 'none';
    }
});

function toggleDarkMode() {
    appState.isDarkMode = !appState.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', appState.isDarkMode);
    
    if (document.getElementById('darkModeToggle')) {
        document.getElementById('darkModeToggle').textContent = appState.isDarkMode ? '☀️' : '🌙';
    }
    
    // Save to Firebase
    if (appState.currentUser && db) {
        db.collection('users').doc(appState.currentUser.uid).update(
            { darkMode: appState.isDarkMode }
        ).catch(err => console.log('Dark mode save error:', err));
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
    if (backdrop) {
        backdrop.classList.toggle('show');
    }
}

function toggleDarkModeSetting() {
    toggleDarkMode();
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    showToast('Theme changed to ' + theme, 'success');
}

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('show');
}

function closeUserMenu() {
    document.getElementById('userDropdown').classList.remove('show');
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        closeUserMenu();
    }
});

// Date functions for tracker
function changeDate(days) {
    appState.currentDate.setDate(appState.currentDate.getDate() + days);
    updateDateDisplay();
    loadTasksForDate();
}

function updateDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = appState.currentDate.toLocaleDateString('en-US', options);
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    
    sidebar.classList.toggle('mobile-open');
    if (overlay) {
        overlay.style.display = sidebar.classList.contains('mobile-open') ? 'block' : 'none';
    }
}
