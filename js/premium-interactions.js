/**
 * @file premium-interactions.js
 * @description Industry-standard micro-interactions, animations, and premium UX features
 * @version 4.0.0 - Enterprise Grade
 */

(function() {
    'use strict';

    // ==========================================================================
    // COMMAND PALETTE (Cmd+K / Ctrl+K)
    // ==========================================================================
    
    class CommandPalette {
        constructor() {
            this.isOpen = false;
            this.selectedIndex = 0;
            this.filteredCommands = [];
            this.commands = this.buildCommands();
            this.recentCommands = this.loadRecentCommands();
            this.init();
        }

        buildCommands() {
            return [
                // Navigation
                { id: 'nav-dashboard', label: 'Go to Dashboard', icon: 'fa-home', category: 'Navigation', action: () => navigateTo('dashboard') },
                { id: 'nav-habits', label: 'Go to Habits', icon: 'fa-repeat', category: 'Navigation', action: () => navigateTo('habits') },
                { id: 'nav-tasks', label: 'Go to Tasks', icon: 'fa-tasks', category: 'Navigation', action: () => navigateTo('tasks') },
                { id: 'nav-goals', label: 'Go to Goals', icon: 'fa-bullseye', category: 'Navigation', action: () => navigateTo('goals') },
                { id: 'nav-journal', label: 'Go to Journal', icon: 'fa-book', category: 'Navigation', action: () => navigateTo('journal') },
                { id: 'nav-analytics', label: 'Go to Analytics', icon: 'fa-chart-line', category: 'Navigation', action: () => navigateTo('analytics') },
                { id: 'nav-settings', label: 'Go to Settings', icon: 'fa-cog', category: 'Navigation', action: () => navigateTo('settings') },
                { id: 'nav-challenges', label: 'Go to Challenges', icon: 'fa-trophy', category: 'Navigation', action: () => navigateTo('challenges') },
                { id: 'nav-focus', label: 'Go to Focus Timer', icon: 'fa-clock', category: 'Navigation', action: () => navigateTo('focus-timer') },
                
                // Quick Actions
                { id: 'action-add-task', label: 'Add New Task', icon: 'fa-plus', category: 'Actions', action: () => this.triggerModal('task'), keywords: ['create', 'new'] },
                { id: 'action-add-habit', label: 'Add New Habit', icon: 'fa-plus-circle', category: 'Actions', action: () => this.triggerModal('habit'), keywords: ['create', 'new'] },
                { id: 'action-journal-entry', label: 'Write Journal Entry', icon: 'fa-pen', category: 'Actions', action: () => navigateTo('journal'), keywords: ['write', 'note'] },
                { id: 'action-start-focus', label: 'Start Focus Session', icon: 'fa-play', category: 'Actions', action: () => this.startFocus(), keywords: ['timer', 'pomodoro'] },
                
                // Settings
                { id: 'toggle-dark', label: 'Toggle Dark Mode', icon: 'fa-moon', category: 'Settings', action: () => this.toggleDarkMode() },
                { id: 'export-data', label: 'Export Data', icon: 'fa-download', category: 'Settings', action: () => this.exportData() },
                
                // Help
                { id: 'help-shortcuts', label: 'Keyboard Shortcuts', icon: 'fa-keyboard', category: 'Help', action: () => this.showShortcuts() },
                { id: 'help-feedback', label: 'Send Feedback', icon: 'fa-comment', category: 'Help', action: () => this.sendFeedback() },
            ];
        }

        init() {
            this.createDOM();
            this.bindEvents();
        }

        createDOM() {
            const palette = document.createElement('div');
            palette.id = 'commandPalette';
            palette.className = 'command-palette';
            palette.innerHTML = `
                <div class="command-palette-backdrop"></div>
                <div class="command-palette-container">
                    <div class="command-palette-header">
                        <i class="fas fa-search"></i>
                        <input type="text" class="command-palette-input" placeholder="Type a command or search..." autocomplete="off" />
                        <kbd class="command-palette-esc">ESC</kbd>
                    </div>
                    <div class="command-palette-results">
                        <div class="command-palette-category">
                            <span class="command-palette-category-label">Recent</span>
                        </div>
                        <div class="command-palette-items"></div>
                    </div>
                    <div class="command-palette-footer">
                        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                        <span><kbd>↵</kbd> to select</span>
                        <span><kbd>esc</kbd> to close</span>
                    </div>
                </div>
            `;
            document.body.appendChild(palette);

            this.element = palette;
            this.input = palette.querySelector('.command-palette-input');
            this.resultsContainer = palette.querySelector('.command-palette-items');
            this.backdrop = palette.querySelector('.command-palette-backdrop');
        }

        bindEvents() {
            // Global keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggle();
                }
                
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Input handling
            this.input.addEventListener('input', () => this.handleInput());
            this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
            
            // Backdrop click
            this.backdrop.addEventListener('click', () => this.close());
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.element.classList.add('open');
            this.input.value = '';
            this.selectedIndex = 0;
            this.showRecentCommands();
            
            requestAnimationFrame(() => {
                this.input.focus();
            });
        }

        close() {
            this.isOpen = false;
            this.element.classList.remove('open');
            this.input.blur();
        }

        handleInput() {
            const query = this.input.value.toLowerCase().trim();
            
            if (!query) {
                this.showRecentCommands();
                return;
            }

            this.filteredCommands = this.commands.filter(cmd => {
                const searchText = `${cmd.label} ${cmd.category} ${(cmd.keywords || []).join(' ')}`.toLowerCase();
                return searchText.includes(query);
            });

            this.selectedIndex = 0;
            this.renderResults();
        }

        handleKeydown(e) {
            const total = this.filteredCommands.length || this.recentCommands.length;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = (this.selectedIndex + 1) % total;
                    this.updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = (this.selectedIndex - 1 + total) % total;
                    this.updateSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.executeSelected();
                    break;
            }
        }

        showRecentCommands() {
            if (this.recentCommands.length > 0) {
                this.filteredCommands = this.recentCommands.map(id => 
                    this.commands.find(cmd => cmd.id === id)
                ).filter(Boolean).slice(0, 5);
            } else {
                this.filteredCommands = this.commands.slice(0, 5);
            }
            this.renderResults(true);
        }

        renderResults(isRecent = false) {
            const grouped = this.groupByCategory(this.filteredCommands);
            
            let html = '';
            let itemIndex = 0;
            
            for (const [category, commands] of Object.entries(grouped)) {
                html += `<div class="command-palette-category">
                    <span class="command-palette-category-label">${isRecent && itemIndex === 0 ? 'Recent' : category}</span>
                </div>`;
                
                for (const cmd of commands) {
                    html += `
                        <div class="command-palette-item ${itemIndex === this.selectedIndex ? 'selected' : ''}" 
                             data-index="${itemIndex}"
                             data-id="${cmd.id}">
                            <i class="fas ${cmd.icon}"></i>
                            <span class="command-palette-item-label">${cmd.label}</span>
                            <span class="command-palette-item-category">${cmd.category}</span>
                        </div>
                    `;
                    itemIndex++;
                }
            }

            this.resultsContainer.innerHTML = html || '<div class="command-palette-empty">No commands found</div>';
            
            // Add click handlers
            this.resultsContainer.querySelectorAll('.command-palette-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.selectedIndex = parseInt(item.dataset.index);
                    this.executeSelected();
                });
                
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = parseInt(item.dataset.index);
                    this.updateSelection();
                });
            });
        }

        groupByCategory(commands) {
            return commands.reduce((acc, cmd) => {
                if (!acc[cmd.category]) acc[cmd.category] = [];
                acc[cmd.category].push(cmd);
                return acc;
            }, {});
        }

        updateSelection() {
            this.resultsContainer.querySelectorAll('.command-palette-item').forEach((item, i) => {
                item.classList.toggle('selected', i === this.selectedIndex);
            });
            
            // Scroll into view
            const selected = this.resultsContainer.querySelector('.command-palette-item.selected');
            if (selected) {
                selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        executeSelected() {
            const cmd = this.filteredCommands[this.selectedIndex];
            if (cmd) {
                this.saveRecentCommand(cmd.id);
                this.close();
                cmd.action();
            }
        }

        loadRecentCommands() {
            try {
                return JSON.parse(localStorage.getItem('recentCommands') || '[]');
            } catch {
                return [];
            }
        }

        saveRecentCommand(id) {
            this.recentCommands = [id, ...this.recentCommands.filter(c => c !== id)].slice(0, 10);
            localStorage.setItem('recentCommands', JSON.stringify(this.recentCommands));
        }

        triggerModal(type) {
            const btn = document.querySelector(`[onclick*="add${type.charAt(0).toUpperCase() + type.slice(1)}"]`);
            if (btn) btn.click();
        }

        startFocus() {
            navigateTo('focus-timer');
            setTimeout(() => {
                const startBtn = document.querySelector('.start-timer-btn, [onclick*="startTimer"]');
                if (startBtn) startBtn.click();
            }, 300);
        }

        toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        }

        exportData() {
            navigateTo('settings');
        }

        showShortcuts() {
            PremiumToast.info('Keyboard Shortcuts', 'Cmd+K: Command Palette • Cmd+/: Help • Cmd+S: Save', { duration: 5000 });
        }

        sendFeedback() {
            PremiumToast.info('Feedback', 'Thank you for your interest! Feedback feature coming soon.');
        }
    }

    // ==========================================================================
    // PREMIUM TOAST NOTIFICATIONS
    // ==========================================================================
    
    class PremiumToastSystem {
        constructor() {
            this.container = null;
            this.toasts = [];
            this.init();
        }

        init() {
            this.container = document.createElement('div');
            this.container.id = 'premiumToastContainer';
            this.container.className = 'premium-toast-container';
            document.body.appendChild(this.container);
        }

        show(options) {
            const {
                type = 'info',
                title,
                message,
                duration = 4000,
                action = null,
                actionLabel = null
            } = options;

            const toast = document.createElement('div');
            toast.className = `premium-toast premium-toast-${type}`;
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            toast.innerHTML = `
                <div class="premium-toast-icon">
                    <i class="fas ${icons[type]}"></i>
                </div>
                <div class="premium-toast-content">
                    ${title ? `<div class="premium-toast-title">${title}</div>` : ''}
                    ${message ? `<div class="premium-toast-message">${message}</div>` : ''}
                </div>
                ${action ? `<button class="premium-toast-action">${actionLabel}</button>` : ''}
                <button class="premium-toast-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="premium-toast-progress"></div>
            `;

            this.container.appendChild(toast);
            
            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Progress bar animation
            const progress = toast.querySelector('.premium-toast-progress');
            progress.style.animationDuration = `${duration}ms`;
            progress.classList.add('animate');

            // Close button
            toast.querySelector('.premium-toast-close').addEventListener('click', () => {
                this.dismiss(toast);
            });

            // Action button
            if (action) {
                toast.querySelector('.premium-toast-action').addEventListener('click', () => {
                    action();
                    this.dismiss(toast);
                });
            }

            // Auto dismiss
            if (duration > 0) {
                setTimeout(() => this.dismiss(toast), duration);
            }

            return toast;
        }

        dismiss(toast) {
            toast.classList.add('dismissing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }

        success(title, message, options = {}) {
            return this.show({ type: 'success', title, message, ...options });
        }

        error(title, message, options = {}) {
            return this.show({ type: 'error', title, message, ...options });
        }

        warning(title, message, options = {}) {
            return this.show({ type: 'warning', title, message, ...options });
        }

        info(title, message, options = {}) {
            return this.show({ type: 'info', title, message, ...options });
        }
    }

    // ==========================================================================
    // MAGNETIC BUTTON EFFECT
    // ==========================================================================
    
    class MagneticEffect {
        constructor(element, options = {}) {
            this.element = element;
            this.strength = options.strength || 0.3;
            this.init();
        }

        init() {
            this.element.addEventListener('mousemove', this.handleMove.bind(this));
            this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
        }

        handleMove(e) {
            const rect = this.element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.element.style.transform = `translate(${x * this.strength}px, ${y * this.strength}px)`;
        }

        handleLeave() {
            this.element.style.transform = 'translate(0, 0)';
        }
    }

    // ==========================================================================
    // 3D TILT CARD EFFECT  
    // ==========================================================================
    
    class TiltEffect {
        constructor(element, options = {}) {
            this.element = element;
            this.maxTilt = options.maxTilt || 10;
            this.perspective = options.perspective || 1000;
            this.scale = options.scale || 1.02;
            this.speed = options.speed || 300;
            this.glare = options.glare || false;
            this.init();
        }

        init() {
            this.element.style.transformStyle = 'preserve-3d';
            this.element.style.transition = `transform ${this.speed}ms ease-out`;

            if (this.glare) {
                this.createGlare();
            }

            this.element.addEventListener('mousemove', this.handleMove.bind(this));
            this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
            this.element.addEventListener('mouseenter', this.handleEnter.bind(this));
        }

        createGlare() {
            const glare = document.createElement('div');
            glare.className = 'tilt-glare';
            glare.innerHTML = '<div class="tilt-glare-inner"></div>';
            this.element.appendChild(glare);
            this.glareElement = glare.querySelector('.tilt-glare-inner');
        }

        handleMove(e) {
            const rect = this.element.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const rotateY = (x - 0.5) * this.maxTilt * 2;
            const rotateX = (0.5 - y) * this.maxTilt * 2;
            
            this.element.style.transform = 
                `perspective(${this.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.scale})`;

            if (this.glareElement) {
                const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
                this.glareElement.style.transform = `rotate(${angle}deg)`;
                this.glareElement.style.opacity = Math.max(x, y, 1 - x, 1 - y) * 0.3;
            }
        }

        handleEnter() {
            this.element.style.transition = 'none';
        }

        handleLeave() {
            this.element.style.transition = `transform ${this.speed}ms ease-out`;
            this.element.style.transform = 
                `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;

            if (this.glareElement) {
                this.glareElement.style.opacity = 0;
            }
        }
    }

    // ==========================================================================
    // SPOTLIGHT CARD EFFECT
    // ==========================================================================
    
    class SpotlightEffect {
        constructor(element) {
            this.element = element;
            this.init();
        }

        init() {
            this.spotlight = document.createElement('div');
            this.spotlight.className = 'spotlight-effect';
            this.element.appendChild(this.spotlight);
            
            this.element.addEventListener('mousemove', this.handleMove.bind(this));
            this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
        }

        handleMove(e) {
            const rect = this.element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.spotlight.style.opacity = '1';
            this.spotlight.style.left = `${x}px`;
            this.spotlight.style.top = `${y}px`;
        }

        handleLeave() {
            this.spotlight.style.opacity = '0';
        }
    }

    // ==========================================================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ==========================================================================
    
    class ScrollReveal {
        constructor(options = {}) {
            this.threshold = options.threshold || 0.1;
            this.rootMargin = options.rootMargin || '0px 0px -50px 0px';
            this.init();
        }

        init() {
            // Check for native scroll-driven animations support
            if (CSS.supports('animation-timeline: view()')) {
                // Use native scroll-driven animations (defined in CSS)
                return;
            }

            // Fallback to Intersection Observer
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { threshold: this.threshold, rootMargin: this.rootMargin }
            );

            this.observe();
        }

        observe() {
            document.querySelectorAll('.scroll-reveal').forEach(el => {
                this.observer.observe(el);
            });
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }

        refresh() {
            document.querySelectorAll('.scroll-reveal:not(.visible)').forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    // ==========================================================================
    // STAGGERED ANIMATIONS
    // ==========================================================================
    
    class StaggeredAnimation {
        static animate(selector, animationClass = 'animate-fade-in-up', delay = 50) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, i) => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.classList.add(animationClass);
                    el.style.opacity = '';
                }, i * delay);
            });
        }

        static reset(selector) {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.remove('animate-fade-in-up', 'animate-scale-in', 'visible');
                el.style.opacity = '';
            });
        }
    }

    // ==========================================================================
    // SKELETON LOADING MANAGER
    // ==========================================================================
    
    class SkeletonLoader {
        static show(container, template = 'default') {
            const templates = {
                default: `
                    <div class="skeleton-grid">
                        <div class="skeleton-row">
                            <div class="skeleton skeleton-avatar"></div>
                            <div style="flex:1">
                                <div class="skeleton skeleton-title" style="margin-bottom:8px"></div>
                                <div class="skeleton skeleton-text" style="width:80%"></div>
                            </div>
                        </div>
                    </div>
                `,
                card: `
                    <div class="skeleton skeleton-card"></div>
                `,
                list: `
                    <div class="skeleton-grid">
                        ${Array(5).fill(`
                            <div class="skeleton-row">
                                <div class="skeleton skeleton-avatar"></div>
                                <div style="flex:1">
                                    <div class="skeleton skeleton-text" style="width:60%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `,
                stats: `
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px">
                        ${Array(4).fill(`
                            <div class="skeleton skeleton-card" style="height:100px"></div>
                        `).join('')}
                    </div>
                `
            };

            container.dataset.originalContent = container.innerHTML;
            container.innerHTML = templates[template] || templates.default;
            container.classList.add('skeleton-loading');
        }

        static hide(container) {
            if (container.dataset.originalContent) {
                container.innerHTML = container.dataset.originalContent;
                delete container.dataset.originalContent;
            }
            container.classList.remove('skeleton-loading');
        }
    }

    // ==========================================================================
    // CONFETTI CELEBRATION
    // ==========================================================================
    
    class Confetti {
        static fire(options = {}) {
            const defaults = {
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b']
            };

            const config = { ...defaults, ...options };
            const container = document.createElement('div');
            container.className = 'confetti-container';
            document.body.appendChild(container);

            for (let i = 0; i < config.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'confetti-particle';
                particle.style.backgroundColor = config.colors[Math.floor(Math.random() * config.colors.length)];
                particle.style.left = `${50 + (Math.random() - 0.5) * config.spread}%`;
                particle.style.animationDelay = `${Math.random() * 0.5}s`;
                particle.style.animationDuration = `${2 + Math.random() * 2}s`;
                container.appendChild(particle);
            }

            setTimeout(() => container.remove(), 4000);
        }
    }

    // ==========================================================================
    // HAPTIC FEEDBACK (for mobile)
    // ==========================================================================
    
    class HapticFeedback {
        static light() {
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        }

        static medium() {
            if ('vibrate' in navigator) {
                navigator.vibrate(20);
            }
        }

        static heavy() {
            if ('vibrate' in navigator) {
                navigator.vibrate([30, 10, 30]);
            }
        }

        static success() {
            if ('vibrate' in navigator) {
                navigator.vibrate([10, 50, 10]);
            }
        }

        static error() {
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 30, 50, 30, 50]);
            }
        }
    }

    // ==========================================================================
    // KEYBOARD SHORTCUTS MANAGER
    // ==========================================================================
    
    class KeyboardShortcuts {
        constructor() {
            this.shortcuts = new Map();
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        register(combo, callback, description = '') {
            this.shortcuts.set(combo.toLowerCase(), { callback, description });
        }

        handleKeydown(e) {
            // Don't trigger when typing in inputs
            if (e.target.matches('input, textarea, select, [contenteditable]')) {
                return;
            }

            const combo = this.getCombo(e);
            const shortcut = this.shortcuts.get(combo);
            
            if (shortcut) {
                e.preventDefault();
                shortcut.callback();
            }
        }

        getCombo(e) {
            const parts = [];
            if (e.metaKey || e.ctrlKey) parts.push('cmd');
            if (e.altKey) parts.push('alt');
            if (e.shiftKey) parts.push('shift');
            if (e.key && e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Shift') {
                parts.push(e.key.toLowerCase());
            }
            return parts.join('+');
        }
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    
    // Global instances
    window.PremiumToast = new PremiumToastSystem();
    window.commandPalette = new CommandPalette();
    window.scrollReveal = new ScrollReveal();
    window.keyboardShortcuts = new KeyboardShortcuts();
    window.Confetti = Confetti;
    window.HapticFeedback = HapticFeedback;
    window.SkeletonLoader = SkeletonLoader;
    window.StaggeredAnimation = StaggeredAnimation;
    window.MagneticEffect = MagneticEffect;
    window.TiltEffect = TiltEffect;
    window.SpotlightEffect = SpotlightEffect;

    // Splash screen handler
    function hideSplashScreen() {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.remove();
            }, 500);
        }
    }

    // Hide splash after app loads
    window.addEventListener('load', () => {
        setTimeout(hideSplashScreen, 2500);
    });

    // Or hide when auth screen or app is ready
    const authObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.style.display !== 'none') {
                setTimeout(hideSplashScreen, 300);
                authObserver.disconnect();
            }
        });
    });

    const authScreen = document.getElementById('authScreen');
    const appContainer = document.querySelector('.app-container');
    
    if (authScreen) {
        authObserver.observe(authScreen, { attributes: true, attributeFilter: ['style'] });
    }
    if (appContainer) {
        authObserver.observe(appContainer, { attributes: true, attributeFilter: ['class'] });
    }

    // Auto-initialize effects on elements with data attributes
    document.addEventListener('DOMContentLoaded', () => {
        // Magnetic buttons
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            new MagneticEffect(el, { strength: parseFloat(el.dataset.magnetic) || 0.3 });
        });

        // Tilt cards
        document.querySelectorAll('[data-tilt]').forEach(el => {
            new TiltEffect(el, {
                maxTilt: parseFloat(el.dataset.tiltMax) || 10,
                glare: el.dataset.tiltGlare === 'true'
            });
        });

        // Spotlight cards
        document.querySelectorAll('[data-spotlight]').forEach(el => {
            new SpotlightEffect(el);
        });

        // Register default keyboard shortcuts
        window.keyboardShortcuts.register('cmd+/', () => {
            window.PremiumToast.info('Help', 'Press Cmd+K to open the command palette');
        }, 'Show help');

        window.keyboardShortcuts.register('g+d', () => navigateTo('dashboard'), 'Go to Dashboard');
        window.keyboardShortcuts.register('g+h', () => navigateTo('habits'), 'Go to Habits');
        window.keyboardShortcuts.register('g+t', () => navigateTo('tasks'), 'Go to Tasks');
        window.keyboardShortcuts.register('g+j', () => navigateTo('journal'), 'Go to Journal');
        window.keyboardShortcuts.register('g+a', () => navigateTo('analytics'), 'Go to Analytics');
        window.keyboardShortcuts.register('g+s', () => navigateTo('settings'), 'Go to Settings');
    });

    // Reinitialize scroll reveal after navigation
    if (typeof window.navigateTo === 'function') {
        const originalNavigateTo = window.navigateTo;
        window.navigateTo = function(...args) {
            originalNavigateTo.apply(this, args);
            setTimeout(() => {
                window.scrollReveal.refresh();
                StaggeredAnimation.animate('.card, .overview-card', 'animate-fade-in-up', 50);
            }, 100);
        };
    }

})();
