// UI Navigation and Layout Functions

function initApp() {
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
        if (!moodChart || !completionChart) {
            initCharts();
        }
    }

    // Set up task categories and achievements
    try {
        renderTaskCategories();
        renderAchievements();
        renderBadges();
    } catch (error) {
        console.warn('Error rendering initial UI:', error);
    }

    // Load user data if available
    if (appState.currentUser && db) {
        loadUserData();
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
    if (view === 'analytics') {
        loadAnalyticsData();
    }
    if (view === 'journal') {
        loadJournalEntries();
    }
    if (view === 'goals') {
        renderGoals();
        renderHabitChain();
    }
    
    closeUserMenu();
    
    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.style.display = 'none';
    }
}

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
    
    sidebar.classList.toggle('show');
    if (overlay) {
        overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
    }
}
