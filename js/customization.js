/**
 * @fileoverview Customization & Themes Module
 * @description Custom categories, themes, personalization options
 * @version 1.0.0
 */

'use strict';

/* ==========================================================================
   Theme Definitions
   ========================================================================== */

const BUILT_IN_THEMES = {
    default: {
        id: 'default',
        name: 'Default Dark',
        description: 'Classic dark theme',
        icon: '🌙',
        colors: {
            '--bg-primary': '#0f0f0f',
            '--bg-secondary': '#1a1a1a',
            '--bg-tertiary': '#2a2a2a',
            '--text-primary': '#ffffff',
            '--text-secondary': '#a0a0a0',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#8b5cf6',
            '--success': '#22c55e',
            '--warning': '#f59e0b',
            '--error': '#ef4444'
        }
    },
    light: {
        id: 'light',
        name: 'Light Mode',
        description: 'Clean light theme',
        icon: '☀️',
        colors: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f5f5f5',
            '--bg-tertiary': '#e5e5e5',
            '--text-primary': '#1a1a1a',
            '--text-secondary': '#666666',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#8b5cf6',
            '--success': '#16a34a',
            '--warning': '#d97706',
            '--error': '#dc2626'
        }
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight Blue',
        description: 'Deep blue night theme',
        icon: '🌃',
        colors: {
            '--bg-primary': '#0a0e1a',
            '--bg-secondary': '#111827',
            '--bg-tertiary': '#1f2937',
            '--text-primary': '#f9fafb',
            '--text-secondary': '#9ca3af',
            '--accent-primary': '#3b82f6',
            '--accent-secondary': '#60a5fa',
            '--success': '#22c55e',
            '--warning': '#f59e0b',
            '--error': '#ef4444'
        }
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        description: 'Natural green theme',
        icon: '🌲',
        colors: {
            '--bg-primary': '#0a1a0f',
            '--bg-secondary': '#0f2517',
            '--bg-tertiary': '#1a3a24',
            '--text-primary': '#f0fdf4',
            '--text-secondary': '#86efac',
            '--accent-primary': '#22c55e',
            '--accent-secondary': '#4ade80',
            '--success': '#4ade80',
            '--warning': '#fbbf24',
            '--error': '#f87171'
        }
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm orange and pink',
        icon: '🌅',
        colors: {
            '--bg-primary': '#1a0a0f',
            '--bg-secondary': '#2d1118',
            '--bg-tertiary': '#451a24',
            '--text-primary': '#fff1f2',
            '--text-secondary': '#fda4af',
            '--accent-primary': '#f97316',
            '--accent-secondary': '#fb923c',
            '--success': '#22c55e',
            '--warning': '#fbbf24',
            '--error': '#ef4444'
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        description: 'Calm blue waters',
        icon: '🌊',
        colors: {
            '--bg-primary': '#0a1520',
            '--bg-secondary': '#0f2030',
            '--bg-tertiary': '#152a40',
            '--text-primary': '#f0f9ff',
            '--text-secondary': '#7dd3fc',
            '--accent-primary': '#0ea5e9',
            '--accent-secondary': '#38bdf8',
            '--success': '#22c55e',
            '--warning': '#fbbf24',
            '--error': '#f87171'
        }
    },
    galaxy: {
        id: 'galaxy',
        name: 'Galaxy',
        description: 'Deep space purple',
        icon: '🌌',
        colors: {
            '--bg-primary': '#0f0520',
            '--bg-secondary': '#1a0a35',
            '--bg-tertiary': '#2d1555',
            '--text-primary': '#faf5ff',
            '--text-secondary': '#c4b5fd',
            '--accent-primary': '#8b5cf6',
            '--accent-secondary': '#a78bfa',
            '--success': '#22c55e',
            '--warning': '#fbbf24',
            '--error': '#f87171'
        }
    },
    rose: {
        id: 'rose',
        name: 'Rose',
        description: 'Soft pink theme',
        icon: '🌹',
        colors: {
            '--bg-primary': '#1a0a12',
            '--bg-secondary': '#2d1220',
            '--bg-tertiary': '#451a30',
            '--text-primary': '#fff1f2',
            '--text-secondary': '#fda4af',
            '--accent-primary': '#ec4899',
            '--accent-secondary': '#f472b6',
            '--success': '#22c55e',
            '--warning': '#fbbf24',
            '--error': '#ef4444'
        }
    }
};

/* ==========================================================================
   Default Categories
   ========================================================================== */

const DEFAULT_CATEGORIES = [
    { id: 'work', name: 'Work', icon: '💼', color: '#3b82f6' },
    { id: 'health', name: 'Health', icon: '💪', color: '#22c55e' },
    { id: 'personal', name: 'Personal', icon: '🏠', color: '#8b5cf6' },
    { id: 'finance', name: 'Finance', icon: '💰', color: '#f59e0b' },
    { id: 'social', name: 'Social', icon: '👥', color: '#ec4899' },
    { id: 'learning', name: 'Learning', icon: '📚', color: '#06b6d4' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: '#f97316' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: '#10b981' }
];

/* ==========================================================================
   Icon Library
   ========================================================================== */

const ICON_LIBRARY = {
    activities: ['🏃', '🏋️', '🚴', '🏊', '⚽', '🎾', '🧘', '🚶'],
    work: ['💼', '💻', '📊', '📈', '📝', '🗂️', '📋', '🖥️'],
    health: ['💪', '🥗', '💊', '🏥', '❤️', '🧠', '😴', '🌡️'],
    hobbies: ['🎮', '🎸', '📷', '🎨', '📚', '🎬', '🎧', '✈️'],
    home: ['🏠', '🧹', '🍳', '🛒', '🔧', '🌱', '🐕', '🛋️'],
    social: ['👥', '👨‍👩‍👧', '💬', '🤝', '🎉', '☕', '🍕', '❤️'],
    finance: ['💰', '💵', '📉', '🏦', '💳', '📊', '🧾', '💎'],
    education: ['📚', '✏️', '🎓', '📐', '🔬', '🌐', '💡', '🧪'],
    misc: ['⭐', '🎯', '🔥', '⚡', '🌟', '🚀', '💫', '✨']
};

/* ==========================================================================
   State
   ========================================================================== */

let customizationState = {
    currentTheme: 'default',
    customThemes: [],
    categories: [...DEFAULT_CATEGORIES],
    displayPreferences: {
        showGreeting: true,
        showQuote: true,
        showStreak: true,
        compactMode: false,
        showAnimations: true,
        dashboardLayout: 'default',
        dateFormat: 'short',
        timeFormat: '12h',
        startOfWeek: 0 // 0 = Sunday, 1 = Monday
    },
    profileCustomization: {
        displayName: '',
        avatar: null,
        profileBadge: null,
        bio: ''
    }
};

/* ==========================================================================
   Initialization
   ========================================================================== */

async function initCustomization() {
    console.log('[Customization] Initializing...');
    await loadCustomizationData();
    applyCurrentTheme();
    console.log('[Customization] Initialized with theme:', customizationState.currentTheme);
}

async function loadCustomizationData() {
    try {
        // Load from localStorage first
        const saved = localStorage.getItem('customizationData');
        if (saved) {
            const parsed = JSON.parse(saved);
            customizationState.currentTheme = parsed.currentTheme || 'default';
            customizationState.customThemes = parsed.customThemes || [];
            customizationState.categories = parsed.categories || [...DEFAULT_CATEGORIES];
            customizationState.displayPreferences = { 
                ...customizationState.displayPreferences, 
                ...parsed.displayPreferences 
            };
            customizationState.profileCustomization = {
                ...customizationState.profileCustomization,
                ...parsed.profileCustomization
            };
        }

        // Sync with Firebase if online
        if (appState.isOnline && appState.currentUser) {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('customization')
                .get();

            if (doc.exists) {
                const data = doc.data();
                customizationState.currentTheme = data.currentTheme || customizationState.currentTheme;
                customizationState.customThemes = data.customThemes || customizationState.customThemes;
                customizationState.categories = data.categories || customizationState.categories;
                customizationState.displayPreferences = {
                    ...customizationState.displayPreferences,
                    ...data.displayPreferences
                };
                customizationState.profileCustomization = {
                    ...customizationState.profileCustomization,
                    ...data.profileCustomization
                };
            }
        }
    } catch (error) {
        console.error('[Customization] Load error:', error);
    }
}

async function saveCustomizationData() {
    try {
        localStorage.setItem('customizationData', JSON.stringify(customizationState));

        if (appState.isOnline && appState.currentUser) {
            await firebase.firestore()
                .collection('users')
                .doc(appState.currentUser.uid)
                .collection('settings')
                .doc('customization')
                .set({
                    currentTheme: customizationState.currentTheme,
                    customThemes: customizationState.customThemes,
                    categories: customizationState.categories,
                    displayPreferences: customizationState.displayPreferences,
                    profileCustomization: customizationState.profileCustomization,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        }
    } catch (error) {
        console.error('[Customization] Save error:', error);
    }
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function applyCurrentTheme() {
    const themeId = customizationState.currentTheme;
    let theme = BUILT_IN_THEMES[themeId];

    // Check custom themes if not found in built-in
    if (!theme) {
        theme = customizationState.customThemes.find(t => t.id === themeId);
    }

    if (theme) {
        applyThemeColors(theme.colors);
        document.body.setAttribute('data-theme', themeId);
    }
}

function applyThemeColors(colors) {
    Object.entries(colors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
}

function setTheme(themeId) {
    customizationState.currentTheme = themeId;
    applyCurrentTheme();
    saveCustomizationData();

    if (typeof showToast === 'function') {
        const theme = BUILT_IN_THEMES[themeId] || 
            customizationState.customThemes.find(t => t.id === themeId);
        showToast(`Theme changed to ${theme?.name || themeId}`);
    }

    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { themeId } }));
}

function createCustomTheme(name, colors) {
    const id = `custom_${Date.now()}`;
    const theme = {
        id,
        name,
        description: 'Custom theme',
        icon: '🎨',
        colors: { ...BUILT_IN_THEMES.default.colors, ...colors },
        createdAt: new Date().toISOString()
    };

    customizationState.customThemes.push(theme);
    saveCustomizationData();

    return theme;
}

function deleteCustomTheme(themeId) {
    customizationState.customThemes = customizationState.customThemes.filter(t => t.id !== themeId);
    
    if (customizationState.currentTheme === themeId) {
        setTheme('default');
    }

    saveCustomizationData();
}

/* ==========================================================================
   Category Management
   ========================================================================== */

function addCategory(name, icon, color) {
    const id = `cat_${Date.now()}`;
    const category = { id, name, icon, color };

    customizationState.categories.push(category);
    saveCustomizationData();

    if (typeof showToast === 'function') {
        showToast(`Category "${name}" added`);
    }

    return category;
}

function updateCategory(categoryId, updates) {
    const index = customizationState.categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
        customizationState.categories[index] = {
            ...customizationState.categories[index],
            ...updates
        };
        saveCustomizationData();
        return true;
    }
    return false;
}

function deleteCategory(categoryId) {
    // Don't allow deleting default categories
    if (DEFAULT_CATEGORIES.find(c => c.id === categoryId)) {
        if (typeof showToast === 'function') {
            showToast('Cannot delete default category');
        }
        return false;
    }

    customizationState.categories = customizationState.categories.filter(c => c.id !== categoryId);
    saveCustomizationData();
    return true;
}

function getCategories() {
    return customizationState.categories;
}

function getCategoryById(categoryId) {
    return customizationState.categories.find(c => c.id === categoryId);
}

/* ==========================================================================
   Display Preferences
   ========================================================================== */

function updateDisplayPreference(key, value) {
    customizationState.displayPreferences[key] = value;
    saveCustomizationData();
    applyDisplayPreferences();
}

function applyDisplayPreferences() {
    const prefs = customizationState.displayPreferences;

    // Compact mode
    document.body.classList.toggle('compact-mode', prefs.compactMode);

    // Animations
    document.body.classList.toggle('no-animations', !prefs.showAnimations);

    // Apply other preferences
    document.dispatchEvent(new CustomEvent('displayPreferencesChanged', { 
        detail: prefs 
    }));
}

/* ==========================================================================
   Profile Customization
   ========================================================================== */

function updateProfile(updates) {
    customizationState.profileCustomization = {
        ...customizationState.profileCustomization,
        ...updates
    };
    saveCustomizationData();
}

function getProfileInfo() {
    return {
        ...customizationState.profileCustomization,
        email: appState.currentUser?.email,
        uid: appState.currentUser?.uid
    };
}

/* ==========================================================================
   UI Rendering
   ========================================================================== */

function renderCustomizationSettings() {
    const container = document.getElementById('customizationContainer');
    if (!container) return;

    const prefs = customizationState.displayPreferences;

    container.innerHTML = `
        <div class="customization-section">
            <h2>🎨 Customization</h2>

            <div class="customization-tabs">
                <button class="tab-btn active" onclick="showCustomizationTab('themes')">Themes</button>
                <button class="tab-btn" onclick="showCustomizationTab('categories')">Categories</button>
                <button class="tab-btn" onclick="showCustomizationTab('display')">Display</button>
                <button class="tab-btn" onclick="showCustomizationTab('profile')">Profile</button>
            </div>

            <!-- Themes Tab -->
            <div id="themesTab" class="tab-content active">
                <h3>🌙 Choose Theme</h3>
                <div class="themes-grid">
                    ${Object.values(BUILT_IN_THEMES).map(theme => `
                        <div class="theme-card ${customizationState.currentTheme === theme.id ? 'active' : ''}"
                             onclick="setTheme('${theme.id}'); renderCustomizationSettings();">
                            <div class="theme-preview" style="
                                background: linear-gradient(135deg, ${theme.colors['--bg-primary']}, ${theme.colors['--bg-secondary']});
                                border: 2px solid ${theme.colors['--accent-primary']};
                            ">
                                <span class="theme-icon">${theme.icon}</span>
                            </div>
                            <span class="theme-name">${theme.name}</span>
                        </div>
                    `).join('')}
                </div>

                ${customizationState.customThemes.length > 0 ? `
                    <h3>🎨 Custom Themes</h3>
                    <div class="themes-grid">
                        ${customizationState.customThemes.map(theme => `
                            <div class="theme-card ${customizationState.currentTheme === theme.id ? 'active' : ''}">
                                <div class="theme-preview" style="
                                    background: linear-gradient(135deg, ${theme.colors['--bg-primary']}, ${theme.colors['--bg-secondary']});
                                    border: 2px solid ${theme.colors['--accent-primary']};
                                " onclick="setTheme('${theme.id}'); renderCustomizationSettings();">
                                    <span class="theme-icon">${theme.icon}</span>
                                </div>
                                <span class="theme-name">${theme.name}</span>
                                <button class="btn-sm btn-danger" onclick="deleteCustomTheme('${theme.id}'); renderCustomizationSettings();">
                                    🗑️
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <button class="btn-secondary" onclick="showCreateThemeModal()">
                    ➕ Create Custom Theme
                </button>
            </div>

            <!-- Categories Tab -->
            <div id="categoriesTab" class="tab-content" style="display: none;">
                <h3>📁 Manage Categories</h3>
                <div class="categories-list">
                    ${customizationState.categories.map(cat => `
                        <div class="category-item">
                            <span class="category-icon" style="color: ${cat.color}">${cat.icon}</span>
                            <span class="category-name">${cat.name}</span>
                            <div class="category-actions">
                                <button class="btn-sm btn-secondary" onclick="showEditCategoryModal('${cat.id}')">
                                    ✏️
                                </button>
                                ${!DEFAULT_CATEGORIES.find(c => c.id === cat.id) ? `
                                    <button class="btn-sm btn-danger" onclick="deleteCategory('${cat.id}'); renderCustomizationSettings();">
                                        🗑️
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="btn-primary" onclick="showAddCategoryModal()">
                    ➕ Add Category
                </button>
            </div>

            <!-- Display Tab -->
            <div id="displayTab" class="tab-content" style="display: none;">
                <h3>🖥️ Display Preferences</h3>

                <div class="preference-group">
                    <label class="toggle-label">
                        <span>Show Greeting</span>
                        <input type="checkbox" ${prefs.showGreeting ? 'checked' : ''}
                               onchange="updateDisplayPreference('showGreeting', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>

                    <label class="toggle-label">
                        <span>Show Daily Quote</span>
                        <input type="checkbox" ${prefs.showQuote ? 'checked' : ''}
                               onchange="updateDisplayPreference('showQuote', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>

                    <label class="toggle-label">
                        <span>Show Streak Banner</span>
                        <input type="checkbox" ${prefs.showStreak ? 'checked' : ''}
                               onchange="updateDisplayPreference('showStreak', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>

                    <label class="toggle-label">
                        <span>Compact Mode</span>
                        <input type="checkbox" ${prefs.compactMode ? 'checked' : ''}
                               onchange="updateDisplayPreference('compactMode', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>

                    <label class="toggle-label">
                        <span>Enable Animations</span>
                        <input type="checkbox" ${prefs.showAnimations ? 'checked' : ''}
                               onchange="updateDisplayPreference('showAnimations', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="preference-group">
                    <h4>Date & Time</h4>

                    <label class="select-label">
                        <span>Date Format</span>
                        <select onchange="updateDisplayPreference('dateFormat', this.value)">
                            <option value="short" ${prefs.dateFormat === 'short' ? 'selected' : ''}>Short (1/15/24)</option>
                            <option value="medium" ${prefs.dateFormat === 'medium' ? 'selected' : ''}>Medium (Jan 15, 2024)</option>
                            <option value="long" ${prefs.dateFormat === 'long' ? 'selected' : ''}>Long (January 15, 2024)</option>
                        </select>
                    </label>

                    <label class="select-label">
                        <span>Time Format</span>
                        <select onchange="updateDisplayPreference('timeFormat', this.value)">
                            <option value="12h" ${prefs.timeFormat === '12h' ? 'selected' : ''}>12-hour (3:00 PM)</option>
                            <option value="24h" ${prefs.timeFormat === '24h' ? 'selected' : ''}>24-hour (15:00)</option>
                        </select>
                    </label>

                    <label class="select-label">
                        <span>Start of Week</span>
                        <select onchange="updateDisplayPreference('startOfWeek', parseInt(this.value))">
                            <option value="0" ${prefs.startOfWeek === 0 ? 'selected' : ''}>Sunday</option>
                            <option value="1" ${prefs.startOfWeek === 1 ? 'selected' : ''}>Monday</option>
                        </select>
                    </label>
                </div>
            </div>

            <!-- Profile Tab -->
            <div id="profileTab" class="tab-content" style="display: none;">
                <h3>👤 Profile</h3>

                <div class="profile-form">
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" id="displayNameInput" 
                               value="${customizationState.profileCustomization.displayName || ''}"
                               placeholder="Enter your display name"
                               onchange="updateProfile({ displayName: this.value })">
                    </div>

                    <div class="form-group">
                        <label>Bio</label>
                        <textarea id="bioInput" 
                                  placeholder="Tell us about yourself..."
                                  onchange="updateProfile({ bio: this.value })"
                        >${customizationState.profileCustomization.bio || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label>Profile Badge</label>
                        <div class="badge-selector">
                            ${['⭐', '🔥', '💎', '🏆', '👑', '🚀', '💫', '🌟'].map(badge => `
                                <button class="badge-option ${customizationState.profileCustomization.profileBadge === badge ? 'selected' : ''}"
                                        onclick="updateProfile({ profileBadge: '${badge}' }); renderCustomizationSettings();">
                                    ${badge}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showCustomizationTab(tabName) {
    document.querySelectorAll('.customization-section .tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.customization-section .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}Tab`).style.display = 'block';
    event.target.classList.add('active');
}

/* ==========================================================================
   Modals
   ========================================================================== */

function showCreateThemeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createThemeModal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>🎨 Create Custom Theme</h2>

            <div class="form-group">
                <label>Theme Name</label>
                <input type="text" id="themeNameInput" placeholder="My Custom Theme">
            </div>

            <div class="color-pickers">
                <div class="color-group">
                    <label>Background Primary</label>
                    <input type="color" id="bgPrimaryColor" value="#0f0f0f">
                </div>
                <div class="color-group">
                    <label>Background Secondary</label>
                    <input type="color" id="bgSecondaryColor" value="#1a1a1a">
                </div>
                <div class="color-group">
                    <label>Accent Primary</label>
                    <input type="color" id="accentPrimaryColor" value="#6366f1">
                </div>
                <div class="color-group">
                    <label>Accent Secondary</label>
                    <input type="color" id="accentSecondaryColor" value="#8b5cf6">
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="createThemeFromModal()">Create Theme</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function createThemeFromModal() {
    const name = document.getElementById('themeNameInput').value || 'Custom Theme';
    const colors = {
        '--bg-primary': document.getElementById('bgPrimaryColor').value,
        '--bg-secondary': document.getElementById('bgSecondaryColor').value,
        '--accent-primary': document.getElementById('accentPrimaryColor').value,
        '--accent-secondary': document.getElementById('accentSecondaryColor').value
    };

    createCustomTheme(name, colors);
    document.getElementById('createThemeModal').remove();
    renderCustomizationSettings();

    if (typeof showToast === 'function') {
        showToast(`Theme "${name}" created!`);
    }
}

function showAddCategoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addCategoryModal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>➕ Add Category</h2>

            <div class="form-group">
                <label>Category Name</label>
                <input type="text" id="categoryNameInput" placeholder="New Category">
            </div>

            <div class="form-group">
                <label>Icon</label>
                <div class="icon-picker">
                    ${Object.values(ICON_LIBRARY).flat().map(icon => `
                        <button type="button" class="icon-option" onclick="selectIcon(this, '${icon}')">${icon}</button>
                    `).join('')}
                </div>
                <input type="hidden" id="categoryIconInput" value="📁">
            </div>

            <div class="form-group">
                <label>Color</label>
                <input type="color" id="categoryColorInput" value="#6366f1">
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="createCategoryFromModal()">Add Category</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function selectIcon(button, icon) {
    document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    document.getElementById('categoryIconInput').value = icon;
}

function createCategoryFromModal() {
    const name = document.getElementById('categoryNameInput').value;
    const icon = document.getElementById('categoryIconInput').value;
    const color = document.getElementById('categoryColorInput').value;

    if (!name) {
        if (typeof showToast === 'function') {
            showToast('Please enter a category name');
        }
        return;
    }

    addCategory(name, icon, color);
    document.getElementById('addCategoryModal').remove();
    renderCustomizationSettings();
}

function showEditCategoryModal(categoryId) {
    const category = getCategoryById(categoryId);
    if (!category) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editCategoryModal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            <h2>✏️ Edit Category</h2>

            <div class="form-group">
                <label>Category Name</label>
                <input type="text" id="editCategoryNameInput" value="${category.name}">
            </div>

            <div class="form-group">
                <label>Icon</label>
                <div class="icon-picker">
                    ${Object.values(ICON_LIBRARY).flat().map(icon => `
                        <button type="button" class="icon-option ${category.icon === icon ? 'selected' : ''}" 
                                onclick="selectIcon(this, '${icon}')">${icon}</button>
                    `).join('')}
                </div>
                <input type="hidden" id="editCategoryIconInput" value="${category.icon}">
            </div>

            <div class="form-group">
                <label>Color</label>
                <input type="color" id="editCategoryColorInput" value="${category.color}">
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-primary" onclick="updateCategoryFromModal('${categoryId}')">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function updateCategoryFromModal(categoryId) {
    const name = document.getElementById('editCategoryNameInput').value;
    const icon = document.getElementById('editCategoryIconInput').value;
    const color = document.getElementById('editCategoryColorInput').value;

    updateCategory(categoryId, { name, icon, color });
    document.getElementById('editCategoryModal').remove();
    renderCustomizationSettings();

    if (typeof showToast === 'function') {
        showToast('Category updated!');
    }
}

/* ==========================================================================
   Utility Functions
   ========================================================================== */

function formatDate(date, format = null) {
    const dateFormat = format || customizationState.displayPreferences.dateFormat;
    const options = {
        short: { month: 'numeric', day: 'numeric', year: '2-digit' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' }
    };

    return new Date(date).toLocaleDateString('en-US', options[dateFormat] || options.short);
}

function formatTime(date, format = null) {
    const timeFormat = format || customizationState.displayPreferences.timeFormat;
    const options = timeFormat === '24h' 
        ? { hour: '2-digit', minute: '2-digit', hour12: false }
        : { hour: 'numeric', minute: '2-digit', hour12: true };

    return new Date(date).toLocaleTimeString('en-US', options);
}

/* ==========================================================================
   Exports
   ========================================================================== */

window.initCustomization = initCustomization;
window.setTheme = setTheme;
window.createCustomTheme = createCustomTheme;
window.deleteCustomTheme = deleteCustomTheme;
window.addCategory = addCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.getCategories = getCategories;
window.getCategoryById = getCategoryById;
window.updateDisplayPreference = updateDisplayPreference;
window.updateProfile = updateProfile;
window.getProfileInfo = getProfileInfo;
window.renderCustomizationSettings = renderCustomizationSettings;
window.showCustomizationTab = showCustomizationTab;
window.showCreateThemeModal = showCreateThemeModal;
window.createThemeFromModal = createThemeFromModal;
window.showAddCategoryModal = showAddCategoryModal;
window.selectIcon = selectIcon;
window.createCategoryFromModal = createCategoryFromModal;
window.showEditCategoryModal = showEditCategoryModal;
window.updateCategoryFromModal = updateCategoryFromModal;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.BUILT_IN_THEMES = BUILT_IN_THEMES;
window.ICON_LIBRARY = ICON_LIBRARY;
window.customizationState = customizationState;
