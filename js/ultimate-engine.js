/**
 * @module UltimateEngine
 * @description World-class interaction engine - Premium smooth experience
 * @version 5.0.0 - Ultimate Edition
 */

(function() {
    'use strict';

    // ==========================================================================
    // CORE ENGINE
    // ==========================================================================

    const UltimateEngine = {
        version: '5.0.0',
        initialized: false,
        config: {
            enableRipple: true,
            enablePageTransitions: true,
            enableSmoothScroll: true,
            enableHaptics: true,
            enableSounds: false,
            debugMode: false
        }
    };

    // ==========================================================================
    // SMOOTH PAGE TRANSITIONS
    // ==========================================================================

    class PageTransitionManager {
        constructor() {
            this.container = null;
            this.currentView = null;
            this.isTransitioning = false;
            this.transitionDuration = 350;
        }

        init() {
            this.container = document.querySelector('.main-content') || document.querySelector('#app-container');
            this.setupViewTransitionAPI();
            this.setupNavListeners();
            this.log('PageTransitionManager initialized');
        }

        setupViewTransitionAPI() {
            // Use native View Transitions API if available
            if (document.startViewTransition) {
                this.useNativeTransitions = true;
            }
        }

        setupNavListeners() {
            document.querySelectorAll('[data-view], .nav-item').forEach(el => {
                el.addEventListener('click', (e) => this.handleNavClick(e));
            });
        }

        async handleNavClick(e) {
            const target = e.currentTarget;
            const viewName = target.dataset.view || target.getAttribute('href')?.replace('#', '');
            
            if (!viewName || this.isTransitioning) return;

            e.preventDefault();
            await this.transitionTo(viewName, target);
        }

        async transitionTo(viewName, trigger = null) {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            // Update active nav state
            this.updateNavState(trigger);

            // Get target view
            const targetView = document.querySelector(`#${viewName}-view`) || 
                              document.querySelector(`[data-view-id="${viewName}"]`);
            
            if (!targetView) {
                this.isTransitioning = false;
                return;
            }

            // Perform transition
            if (this.useNativeTransitions && document.startViewTransition) {
                await this.nativeTransition(targetView);
            } else {
                await this.fallbackTransition(targetView);
            }

            // Dispatch event
            window.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: viewName } }));
            
            this.currentView = viewName;
            this.isTransitioning = false;
        }

        async nativeTransition(targetView) {
            const transition = document.startViewTransition(() => {
                this.hideAllViews();
                targetView.classList.add('active');
                targetView.style.display = '';
            });
            await transition.finished;
        }

        async fallbackTransition(targetView) {
            const currentActive = document.querySelector('.view.active');
            
            // Exit animation
            if (currentActive) {
                currentActive.classList.add('view-exit');
                await this.wait(this.transitionDuration / 2);
                currentActive.classList.remove('active', 'view-exit');
                currentActive.style.display = 'none';
            }

            // Enter animation
            targetView.style.display = '';
            targetView.classList.add('view-enter', 'active');
            
            // Force reflow
            targetView.offsetHeight;
            
            targetView.classList.add('view-enter-active');
            await this.wait(this.transitionDuration);
            targetView.classList.remove('view-enter', 'view-enter-active');
        }

        hideAllViews() {
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none';
            });
        }

        updateNavState(activeEl) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            if (activeEl) {
                activeEl.classList.add('active');
            }
        }

        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[PageTransition] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // MATERIAL RIPPLE EFFECT
    // ==========================================================================

    class RippleEffect {
        constructor() {
            this.pool = [];
            this.poolSize = 10;
        }

        init() {
            this.createPool();
            this.attachListeners();
            this.log('RippleEffect initialized');
        }

        createPool() {
            for (let i = 0; i < this.poolSize; i++) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                this.pool.push({ element: ripple, inUse: false });
            }
        }

        getRipple() {
            for (let item of this.pool) {
                if (!item.inUse) {
                    item.inUse = true;
                    return item;
                }
            }
            // Pool exhausted, create new
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const item = { element: ripple, inUse: true };
            this.pool.push(item);
            return item;
        }

        releaseRipple(item) {
            item.inUse = false;
            if (item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
        }

        attachListeners() {
            document.addEventListener('pointerdown', (e) => {
                const target = e.target.closest('.btn, .nav-item, .card-interactive, [data-ripple]');
                if (target && !target.disabled) {
                    this.createRipple(e, target);
                }
            }, { passive: true });
        }

        createRipple(event, element) {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            const poolItem = this.getRipple();
            const ripple = poolItem.element;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                opacity: 1;
                pointer-events: none;
                animation: ripple-expand 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            `;

            // Ensure position relative on parent
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            element.style.overflow = 'hidden';
            element.appendChild(ripple);

            setTimeout(() => this.releaseRipple(poolItem), 600);
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Ripple] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // PREMIUM TOAST NOTIFICATIONS
    // ==========================================================================

    class ToastSystem {
        constructor() {
            this.container = null;
            this.queue = [];
            this.maxToasts = 5;
            this.defaultDuration = 4000;
        }

        init() {
            this.createContainer();
            this.log('ToastSystem initialized');
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.setAttribute('role', 'alert');
            this.container.setAttribute('aria-live', 'polite');
            document.body.appendChild(this.container);
        }

        show(message, options = {}) {
            const config = {
                type: options.type || 'info',
                duration: options.duration || this.defaultDuration,
                title: options.title || null,
                action: options.action || null,
                icon: options.icon || this.getDefaultIcon(options.type)
            };

            const toast = this.createToast(message, config);
            this.addToast(toast, config.duration);
            
            return toast;
        }

        success(message, options = {}) {
            return this.show(message, { ...options, type: 'success' });
        }

        error(message, options = {}) {
            return this.show(message, { ...options, type: 'error' });
        }

        warning(message, options = {}) {
            return this.show(message, { ...options, type: 'warning' });
        }

        info(message, options = {}) {
            return this.show(message, { ...options, type: 'info' });
        }

        getDefaultIcon(type) {
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            return icons[type] || icons.info;
        }

        createToast(message, config) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${config.type}`;
            
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="fas ${config.icon}"></i>
                </div>
                <div class="toast-content">
                    ${config.title ? `<div class="toast-title">${config.title}</div>` : ''}
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="toast-progress"></div>
            `;

            // Close button handler
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.removeToast(toast);
            });

            // Action button if provided
            if (config.action) {
                const actionBtn = document.createElement('button');
                actionBtn.className = 'toast-action';
                actionBtn.textContent = config.action.label;
                actionBtn.addEventListener('click', config.action.callback);
                toast.querySelector('.toast-content').appendChild(actionBtn);
            }

            return toast;
        }

        addToast(toast, duration) {
            // Limit visible toasts
            while (this.container.children.length >= this.maxToasts) {
                this.removeToast(this.container.firstChild);
            }

            this.container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('toast-enter');
            });

            // Auto dismiss
            if (duration > 0) {
                const progress = toast.querySelector('.toast-progress');
                progress.style.animationDuration = `${duration}ms`;
                
                setTimeout(() => {
                    this.removeToast(toast);
                }, duration);
            }
        }

        removeToast(toast) {
            if (!toast || !toast.parentNode) return;

            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Toast] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // SMOOTH SCROLL HANDLER
    // ==========================================================================

    class SmoothScrollHandler {
        constructor() {
            this.scrollContainer = null;
        }

        init() {
            this.setupAnchorLinks();
            this.setupScrollReveal();
            this.log('SmoothScrollHandler initialized');
        }

        setupAnchorLinks() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href').slice(1);
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        setupScrollReveal() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            document.querySelectorAll('[data-reveal]').forEach(el => {
                observer.observe(el);
            });
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Scroll] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // FORM VALIDATION UI
    // ==========================================================================

    class FormValidator {
        constructor() {
            this.forms = [];
        }

        init() {
            this.attachValidation();
            this.log('FormValidator initialized');
        }

        attachValidation() {
            document.querySelectorAll('form').forEach(form => {
                form.setAttribute('novalidate', '');
                
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                    }
                });

                // Real-time validation
                form.querySelectorAll('input, textarea, select').forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => {
                        if (input.classList.contains('error')) {
                            this.validateField(input);
                        }
                    });
                });
            });
        }

        validateForm(form) {
            let isValid = true;
            form.querySelectorAll('input, textarea, select').forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            return isValid;
        }

        validateField(input) {
            const value = input.value.trim();
            const type = input.type;
            const required = input.hasAttribute('required');
            
            let isValid = true;
            let errorMessage = '';

            // Required check
            if (required && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            // Email validation
            else if (type === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email';
            }
            // Min length
            else if (input.minLength > 0 && value.length < input.minLength) {
                isValid = false;
                errorMessage = `Minimum ${input.minLength} characters required`;
            }
            // Max length
            else if (input.maxLength > 0 && value.length > input.maxLength) {
                isValid = false;
                errorMessage = `Maximum ${input.maxLength} characters allowed`;
            }
            // Pattern
            else if (input.pattern && value && !new RegExp(input.pattern).test(value)) {
                isValid = false;
                errorMessage = input.title || 'Invalid format';
            }

            this.updateFieldUI(input, isValid, errorMessage);
            return isValid;
        }

        updateFieldUI(input, isValid, errorMessage) {
            const formGroup = input.closest('.form-group');
            const existingError = formGroup?.querySelector('.form-error');

            if (isValid) {
                input.classList.remove('error');
                input.classList.add('valid');
                if (existingError) existingError.remove();
            } else {
                input.classList.remove('valid');
                input.classList.add('error');
                
                if (formGroup) {
                    if (existingError) {
                        existingError.textContent = errorMessage;
                    } else {
                        const errorEl = document.createElement('div');
                        errorEl.className = 'form-error';
                        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
                        formGroup.appendChild(errorEl);
                    }
                }
            }
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[FormValidator] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // MODAL MANAGER
    // ==========================================================================

    class ModalManager {
        constructor() {
            this.activeModals = [];
            this.bodyScrollLocked = false;
        }

        init() {
            this.attachListeners();
            this.log('ModalManager initialized');
        }

        attachListeners() {
            // Open modal triggers
            document.querySelectorAll('[data-modal]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modalId = trigger.dataset.modal;
                    this.open(modalId);
                });
            });

            // Close on backdrop click
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                        this.close(modal.id);
                    }
                });
            });

            // Close button
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) this.close(modal.id);
                });
            });

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModals.length > 0) {
                    this.close(this.activeModals[this.activeModals.length - 1]);
                }
            });
        }

        open(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            // Lock body scroll
            if (!this.bodyScrollLocked) {
                document.body.style.overflow = 'hidden';
                this.bodyScrollLocked = true;
            }

            // Show modal
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first focusable element
            const focusable = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();

            this.activeModals.push(modalId);

            // Dispatch event
            modal.dispatchEvent(new CustomEvent('modal:open'));
        }

        close(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');

            // Remove from active modals
            this.activeModals = this.activeModals.filter(id => id !== modalId);

            // Unlock body scroll if no modals open
            if (this.activeModals.length === 0) {
                document.body.style.overflow = '';
                this.bodyScrollLocked = false;
            }

            // Dispatch event
            modal.dispatchEvent(new CustomEvent('modal:close'));
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Modal] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // HAPTIC FEEDBACK (for mobile)
    // ==========================================================================

    class HapticFeedback {
        constructor() {
            this.supported = 'vibrate' in navigator;
        }

        init() {
            if (!this.supported) {
                this.log('Haptics not supported');
                return;
            }
            this.attachListeners();
            this.log('HapticFeedback initialized');
        }

        attachListeners() {
            document.querySelectorAll('.btn, .nav-item, [data-haptic]').forEach(el => {
                el.addEventListener('touchstart', () => this.light(), { passive: true });
            });
        }

        light() {
            if (this.supported && UltimateEngine.config.enableHaptics) {
                navigator.vibrate(10);
            }
        }

        medium() {
            if (this.supported && UltimateEngine.config.enableHaptics) {
                navigator.vibrate([10, 20, 10]);
            }
        }

        heavy() {
            if (this.supported && UltimateEngine.config.enableHaptics) {
                navigator.vibrate([20, 40, 20]);
            }
        }

        success() {
            if (this.supported && UltimateEngine.config.enableHaptics) {
                navigator.vibrate([10, 30, 10, 30, 10]);
            }
        }

        error() {
            if (this.supported && UltimateEngine.config.enableHaptics) {
                navigator.vibrate([50, 50, 50]);
            }
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Haptic] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // LOADING STATES
    // ==========================================================================

    class LoadingManager {
        constructor() {
            this.loadingOverlay = null;
        }

        init() {
            this.createOverlay();
            this.log('LoadingManager initialized');
        }

        createOverlay() {
            this.loadingOverlay = document.createElement('div');
            this.loadingOverlay.className = 'loading-overlay';
            this.loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `;
            document.body.appendChild(this.loadingOverlay);
        }

        showOverlay() {
            this.loadingOverlay.classList.add('active');
        }

        hideOverlay() {
            this.loadingOverlay.classList.remove('active');
        }

        showButton(button) {
            if (!button) return;
            button.classList.add('loading');
            button.disabled = true;
        }

        hideButton(button) {
            if (!button) return;
            button.classList.remove('loading');
            button.disabled = false;
        }

        skeleton(element, show = true) {
            if (!element) return;
            if (show) {
                element.classList.add('skeleton');
            } else {
                element.classList.remove('skeleton');
            }
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Loading] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // KEYBOARD SHORTCUTS
    // ==========================================================================

    class KeyboardShortcuts {
        constructor() {
            this.shortcuts = new Map();
        }

        init() {
            this.registerDefaults();
            this.attachListener();
            this.log('KeyboardShortcuts initialized');
        }

        registerDefaults() {
            // Cmd/Ctrl + K for command palette
            this.register('k', { meta: true }, () => {
                window.dispatchEvent(new CustomEvent('toggleCommandPalette'));
            });

            // Escape to close modals/overlays
            this.register('Escape', {}, () => {
                window.dispatchEvent(new CustomEvent('closeAllOverlays'));
            });
        }

        register(key, modifiers = {}, callback) {
            const id = this.getShortcutId(key, modifiers);
            this.shortcuts.set(id, callback);
        }

        unregister(key, modifiers = {}) {
            const id = this.getShortcutId(key, modifiers);
            this.shortcuts.delete(id);
        }

        getShortcutId(key, modifiers) {
            const parts = [];
            if (modifiers.meta || modifiers.ctrl) parts.push('mod');
            if (modifiers.shift) parts.push('shift');
            if (modifiers.alt) parts.push('alt');
            parts.push(key.toLowerCase());
            return parts.join('+');
        }

        attachListener() {
            document.addEventListener('keydown', (e) => {
                // Don't trigger in input fields
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                    if (e.key !== 'Escape') return;
                }

                const modifiers = {
                    meta: e.metaKey || e.ctrlKey,
                    shift: e.shiftKey,
                    alt: e.altKey
                };

                const id = this.getShortcutId(e.key, modifiers);
                const callback = this.shortcuts.get(id);
                
                if (callback) {
                    e.preventDefault();
                    callback(e);
                }
            });
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[Keyboard] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // COMMAND PALETTE
    // ==========================================================================

    class CommandPalette {
        constructor() {
            this.container = null;
            this.input = null;
            this.results = null;
            this.isOpen = false;
            this.commands = [];
            this.selectedIndex = 0;
        }

        init() {
            this.createUI();
            this.registerCommands();
            this.attachListeners();
            this.log('CommandPalette initialized');
        }

        createUI() {
            this.container = document.createElement('div');
            this.container.className = 'command-palette';
            this.container.innerHTML = `
                <div class="command-palette-backdrop"></div>
                <div class="command-palette-modal">
                    <div class="command-palette-header">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               class="command-palette-input" 
                               placeholder="Type a command or search..."
                               autocomplete="off"
                               spellcheck="false">
                    </div>
                    <div class="command-palette-results"></div>
                    <div class="command-palette-footer">
                        <span><kbd>↑↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Select</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                </div>
            `;
            document.body.appendChild(this.container);

            this.input = this.container.querySelector('.command-palette-input');
            this.results = this.container.querySelector('.command-palette-results');
        }

        registerCommands() {
            // Navigation commands
            this.addCommand({ id: 'nav-dashboard', title: 'Go to Dashboard', icon: 'fa-chart-pie', category: 'Navigation', action: () => this.navigateTo('dashboard') });
            this.addCommand({ id: 'nav-tracker', title: 'Go to Tracker', icon: 'fa-tasks', category: 'Navigation', action: () => this.navigateTo('tracker') });
            this.addCommand({ id: 'nav-journal', title: 'Go to Journal', icon: 'fa-book', category: 'Navigation', action: () => this.navigateTo('journal') });
            this.addCommand({ id: 'nav-analytics', title: 'Go to Analytics', icon: 'fa-chart-bar', category: 'Navigation', action: () => this.navigateTo('analytics') });
            this.addCommand({ id: 'nav-goals', title: 'Go to Goals', icon: 'fa-bullseye', category: 'Navigation', action: () => this.navigateTo('goals') });
            this.addCommand({ id: 'nav-habits', title: 'Go to Habits', icon: 'fa-check-square', category: 'Navigation', action: () => this.navigateTo('habits') });
            this.addCommand({ id: 'nav-settings', title: 'Go to Settings', icon: 'fa-cog', category: 'Navigation', action: () => this.navigateTo('settings') });
            
            // Actions
            this.addCommand({ id: 'action-new-task', title: 'Create New Task', icon: 'fa-plus', category: 'Actions', action: () => this.createTask() });
            this.addCommand({ id: 'action-new-journal', title: 'Write Journal Entry', icon: 'fa-pen', category: 'Actions', action: () => this.createJournalEntry() });
            this.addCommand({ id: 'action-focus', title: 'Start Focus Timer', icon: 'fa-clock', category: 'Actions', action: () => this.startFocusTimer() });
        }

        addCommand(command) {
            this.commands.push(command);
        }

        attachListeners() {
            // Toggle event
            window.addEventListener('toggleCommandPalette', () => this.toggle());
            
            // Backdrop click
            this.container.querySelector('.command-palette-backdrop').addEventListener('click', () => this.close());
            
            // Input
            this.input.addEventListener('input', () => this.search(this.input.value));
            
            // Keyboard navigation
            this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.container.classList.add('active');
            this.input.value = '';
            this.selectedIndex = 0;
            this.search('');
            
            requestAnimationFrame(() => {
                this.input.focus();
            });
        }

        close() {
            this.isOpen = false;
            this.container.classList.remove('active');
        }

        search(query) {
            const filtered = this.commands.filter(cmd => 
                cmd.title.toLowerCase().includes(query.toLowerCase()) ||
                cmd.category.toLowerCase().includes(query.toLowerCase())
            );

            this.renderResults(filtered);
            this.selectedIndex = 0;
            this.updateSelection();
        }

        renderResults(commands) {
            if (commands.length === 0) {
                this.results.innerHTML = '<div class="command-empty">No results found</div>';
                return;
            }

            // Group by category
            const grouped = {};
            commands.forEach(cmd => {
                if (!grouped[cmd.category]) grouped[cmd.category] = [];
                grouped[cmd.category].push(cmd);
            });

            let html = '';
            Object.entries(grouped).forEach(([category, cmds]) => {
                html += `<div class="command-category">${category}</div>`;
                cmds.forEach((cmd, i) => {
                    html += `
                        <div class="command-item" data-id="${cmd.id}">
                            <i class="fas ${cmd.icon}"></i>
                            <span>${cmd.title}</span>
                        </div>
                    `;
                });
            });

            this.results.innerHTML = html;

            // Click handlers
            this.results.querySelectorAll('.command-item').forEach(item => {
                item.addEventListener('click', () => {
                    const cmd = this.commands.find(c => c.id === item.dataset.id);
                    if (cmd) this.execute(cmd);
                });
            });
        }

        handleKeydown(e) {
            const items = this.results.querySelectorAll('.command-item');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                    this.updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                    this.updateSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    const selected = items[this.selectedIndex];
                    if (selected) {
                        const cmd = this.commands.find(c => c.id === selected.dataset.id);
                        if (cmd) this.execute(cmd);
                    }
                    break;
                case 'Escape':
                    this.close();
                    break;
            }
        }

        updateSelection() {
            const items = this.results.querySelectorAll('.command-item');
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === this.selectedIndex);
            });

            // Scroll into view
            const selected = items[this.selectedIndex];
            if (selected) {
                selected.scrollIntoView({ block: 'nearest' });
            }
        }

        execute(command) {
            this.close();
            command.action();
        }

        navigateTo(view) {
            // Trigger navigation
            const navItem = document.querySelector(`[data-view="${view}"]`) || 
                           document.querySelector(`.nav-item[href="#${view}"]`);
            if (navItem) navItem.click();
        }

        createTask() {
            const addTaskBtn = document.querySelector('#add-task-btn, .add-task-btn, [data-action="add-task"]');
            if (addTaskBtn) addTaskBtn.click();
        }

        createJournalEntry() {
            this.navigateTo('journal');
            setTimeout(() => {
                const newEntryBtn = document.querySelector('.new-journal-entry, [data-action="new-entry"]');
                if (newEntryBtn) newEntryBtn.click();
            }, 300);
        }

        startFocusTimer() {
            this.navigateTo('focus-timer');
        }

        log(msg) {
            if (UltimateEngine.config.debugMode) {
                console.log(`[CommandPalette] ${msg}`);
            }
        }
    }

    // ==========================================================================
    // ANIMATION UTILITIES
    // ==========================================================================

    class AnimationUtils {
        static fadeIn(element, duration = 300) {
            return new Promise(resolve => {
                element.style.opacity = '0';
                element.style.display = '';
                element.style.transition = `opacity ${duration}ms var(--ease-out)`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    setTimeout(resolve, duration);
                });
            });
        }

        static fadeOut(element, duration = 300) {
            return new Promise(resolve => {
                element.style.transition = `opacity ${duration}ms var(--ease-out)`;
                element.style.opacity = '0';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, duration);
            });
        }

        static slideIn(element, direction = 'up', duration = 300) {
            return new Promise(resolve => {
                const transforms = {
                    up: 'translateY(20px)',
                    down: 'translateY(-20px)',
                    left: 'translateX(20px)',
                    right: 'translateX(-20px)'
                };

                element.style.opacity = '0';
                element.style.transform = transforms[direction];
                element.style.display = '';
                element.style.transition = `all ${duration}ms var(--ease-spring)`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translate(0)';
                    setTimeout(resolve, duration);
                });
            });
        }

        static staggerIn(elements, delay = 50) {
            elements.forEach((el, i) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(10px)';
                el.style.transition = `all 300ms var(--ease-spring) ${i * delay}ms`;
                
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            });
        }
    }

    // ==========================================================================
    // CSS INJECTION FOR RIPPLE & OTHER DYNAMIC STYLES
    // ==========================================================================

    function injectDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ripple effect */
            @keyframes ripple-expand {
                to {
                    transform: scale(1);
                    opacity: 0;
                }
            }

            /* View transitions */
            .view {
                display: none;
            }
            .view.active {
                display: block;
            }
            .view-enter {
                opacity: 0;
                transform: translateY(10px);
            }
            .view-enter-active {
                opacity: 1;
                transform: translateY(0);
                transition: all 350ms var(--ease-expo-out);
            }
            .view-exit {
                opacity: 0;
                transform: translateY(-10px);
                transition: all 175ms var(--ease-in);
            }

            /* Toast styles */
            .toast-container {
                position: fixed;
                bottom: var(--space-6);
                right: var(--space-6);
                z-index: var(--z-toast);
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
                pointer-events: none;
            }
            
            .toast {
                display: flex;
                align-items: flex-start;
                gap: var(--space-3);
                padding: var(--space-4);
                background: var(--surface-3);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                min-width: 320px;
                max-width: 420px;
                pointer-events: auto;
                opacity: 0;
                transform: translateX(100%);
                transition: all 300ms var(--ease-spring);
                overflow: hidden;
            }
            
            .toast-enter {
                opacity: 1;
                transform: translateX(0);
            }
            
            .toast-exit {
                opacity: 0;
                transform: translateX(100%);
            }
            
            .toast-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .toast-success .toast-icon { color: var(--success-text); }
            .toast-error .toast-icon { color: var(--error-text); }
            .toast-warning .toast-icon { color: var(--warning-text); }
            .toast-info .toast-icon { color: var(--info-text); }
            
            .toast-content {
                flex: 1;
                min-width: 0;
            }
            
            .toast-title {
                font-weight: 600;
                font-size: var(--text-sm);
                margin-bottom: var(--space-1);
            }
            
            .toast-message {
                font-size: var(--text-sm);
                color: var(--text-secondary);
            }
            
            .toast-close {
                background: none;
                border: none;
                color: var(--text-tertiary);
                cursor: pointer;
                padding: var(--space-1);
                border-radius: var(--radius-sm);
                transition: all 150ms;
            }
            
            .toast-close:hover {
                background: var(--surface-elevated);
                color: var(--text-primary);
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transform-origin: left;
                animation: toast-progress linear forwards;
            }
            
            @keyframes toast-progress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }

            /* Command palette styles */
            .command-palette {
                position: fixed;
                inset: 0;
                z-index: var(--z-modal);
                display: none;
            }
            
            .command-palette.active {
                display: block;
            }
            
            .command-palette-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                animation: fadeIn 200ms var(--ease-out);
            }
            
            .command-palette-modal {
                position: absolute;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 560px;
                background: var(--surface-2);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-2xl);
                animation: modalEnter 200ms var(--ease-spring);
                overflow: hidden;
            }
            
            .command-palette-header {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-4) var(--space-5);
                border-bottom: 1px solid var(--border-subtle);
            }
            
            .command-palette-header i {
                color: var(--text-tertiary);
            }
            
            .command-palette-input {
                flex: 1;
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: var(--text-lg);
                outline: none;
            }
            
            .command-palette-input::placeholder {
                color: var(--text-tertiary);
            }
            
            .command-palette-results {
                max-height: 400px;
                overflow-y: auto;
                padding: var(--space-2);
            }
            
            .command-category {
                padding: var(--space-2) var(--space-3);
                font-size: var(--text-xs);
                font-weight: 600;
                color: var(--text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .command-item {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all 150ms;
            }
            
            .command-item:hover,
            .command-item.selected {
                background: var(--surface-elevated);
            }
            
            .command-item.selected {
                background: rgba(99, 102, 241, 0.1);
            }
            
            .command-item i {
                width: 20px;
                color: var(--text-tertiary);
            }
            
            .command-empty {
                padding: var(--space-6);
                text-align: center;
                color: var(--text-tertiary);
            }
            
            .command-palette-footer {
                display: flex;
                gap: var(--space-6);
                padding: var(--space-3) var(--space-5);
                border-top: 1px solid var(--border-subtle);
                font-size: var(--text-xs);
                color: var(--text-tertiary);
            }
            
            .command-palette-footer kbd {
                background: var(--surface-4);
                padding: var(--space-0-5) var(--space-1-5);
                border-radius: var(--radius-xs);
                font-family: inherit;
                margin-right: var(--space-1);
            }

            /* Loading overlay */
            .loading-overlay {
                position: fixed;
                inset: 0;
                z-index: var(--z-max);
                background: var(--surface-overlay);
                display: none;
                align-items: center;
                justify-content: center;
            }
            
            .loading-overlay.active {
                display: flex;
            }
            
            .loading-spinner .spinner {
                width: 48px;
                height: 48px;
                border: 3px solid var(--border-default);
                border-top-color: var(--primary-500);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            /* Scroll reveal */
            [data-reveal] {
                opacity: 0;
                transform: translateY(20px);
                transition: all 600ms var(--ease-expo-out);
            }
            
            [data-reveal].revealed {
                opacity: 1;
                transform: translateY(0);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .toast-container {
                    left: var(--space-4);
                    right: var(--space-4);
                    bottom: var(--space-4);
                }
                
                .toast {
                    min-width: auto;
                    max-width: none;
                }
                
                .command-palette-modal {
                    top: 10%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================================================
    // INITIALIZE ENGINE
    // ==========================================================================

    const pageTransitions = new PageTransitionManager();
    const ripple = new RippleEffect();
    const toast = new ToastSystem();
    const scroll = new SmoothScrollHandler();
    const formValidator = new FormValidator();
    const modal = new ModalManager();
    const haptic = new HapticFeedback();
    const loading = new LoadingManager();
    const keyboard = new KeyboardShortcuts();
    const commandPalette = new CommandPalette();

    function init() {
        if (UltimateEngine.initialized) return;

        injectDynamicStyles();

        // Initialize all modules
        if (UltimateEngine.config.enablePageTransitions) pageTransitions.init();
        if (UltimateEngine.config.enableRipple) ripple.init();
        toast.init();
        if (UltimateEngine.config.enableSmoothScroll) scroll.init();
        formValidator.init();
        modal.init();
        if (UltimateEngine.config.enableHaptics) haptic.init();
        loading.init();
        keyboard.init();
        commandPalette.init();

        UltimateEngine.initialized = true;
        console.log(`%c✨ UltimateEngine v${UltimateEngine.version} initialized`, 
            'color: #667eea; font-weight: bold; font-size: 14px;');
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==========================================================================
    // EXPOSE API
    // ==========================================================================

    window.UltimateEngine = {
        ...UltimateEngine,
        toast,
        modal,
        loading,
        haptic,
        keyboard,
        commandPalette,
        animate: AnimationUtils,
        init
    };

})();
