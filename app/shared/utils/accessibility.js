/**
 * @fileoverview Accessibility Manager
 * @description Handles ARIA labels, focus management, keyboard navigation, and screen reader support
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Configuration
// ============================================================================

const A11Y_CONFIG = {
    // Focus trap during modals
    trapFocusOnModal: true,
    
    // Announce dynamic changes
    announceUpdates: true,
    
    // High contrast mode detection
    detectHighContrast: true,
    
    // Focus visible polyfill
    focusVisible: true,
    
    // Skip link target
    mainContentId: 'main-content',
    
    // Reduce motion preference
    respectReducedMotion: true
};

// ============================================================================
// Live Region for Announcements
// ============================================================================

let liveRegion = null;

/**
 * Create or get the live region for screen reader announcements
 * @returns {HTMLElement}
 */
function getLiveRegion() {
    if (liveRegion) return liveRegion;
    
    liveRegion = document.getElementById('a11y-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    return liveRegion;
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announce(message, priority = 'polite') {
    const region = getLiveRegion();
    region.setAttribute('aria-live', priority);
    
    // Clear and set to force announcement
    region.textContent = '';
    
    setTimeout(() => {
        region.textContent = message;
    }, 100);
}

/**
 * Announce assertive (interrupting) message
 * @param {string} message - Message to announce
 */
function announceAssertive(message) {
    announce(message, 'assertive');
}

// ============================================================================
// Focus Management
// ============================================================================

const focusHistory = [];

/**
 * Save current focus for later restoration
 */
function saveFocus() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
        focusHistory.push(activeElement);
    }
}

/**
 * Restore previously saved focus
 */
function restoreFocus() {
    const previousElement = focusHistory.pop();
    if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
    }
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container = document) {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
    ].join(', ');
    
    const elements = Array.from(container.querySelectorAll(focusableSelectors));
    
    return elements.filter(el => {
        return el.offsetParent !== null && 
               getComputedStyle(el).visibility !== 'hidden';
    });
}

/**
 * Move focus to first focusable element in container
 * @param {HTMLElement} container - Container element
 */
function focusFirst(container) {
    const focusable = getFocusableElements(container);
    if (focusable.length > 0) {
        focusable[0].focus();
    }
}

/**
 * Move focus to last focusable element in container
 * @param {HTMLElement} container - Container element
 */
function focusLast(container) {
    const focusable = getFocusableElements(container);
    if (focusable.length > 0) {
        focusable[focusable.length - 1].focus();
    }
}

// ============================================================================
// Focus Trap
// ============================================================================

const trapStack = [];

/**
 * Trap focus within a container (for modals)
 * @param {HTMLElement} container - Container to trap focus in
 */
function trapFocus(container) {
    saveFocus();
    
    const handleKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        
        const focusable = getFocusableElements(container);
        if (focusable.length === 0) return;
        
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        
        if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
        }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    trapStack.push({ container, handleKeyDown });
    
    // Focus first element
    focusFirst(container);
}

/**
 * Release focus trap
 * @param {HTMLElement} container - Container to release
 */
function releaseTrap(container) {
    const index = trapStack.findIndex(t => t.container === container);
    
    if (index !== -1) {
        const trap = trapStack[index];
        trap.container.removeEventListener('keydown', trap.handleKeyDown);
        trapStack.splice(index, 1);
    }
    
    restoreFocus();
}

// ============================================================================
// Skip Links
// ============================================================================

/**
 * Create skip to main content link
 */
function createSkipLink() {
    if (document.getElementById('skip-to-main')) return;
    
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main';
    skipLink.href = `#${A11Y_CONFIG.mainContentId}`;
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.getElementById(A11Y_CONFIG.mainContentId);
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
            main.removeAttribute('tabindex');
        }
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============================================================================
// ARIA Enhancements
// ============================================================================

/**
 * Set ARIA labels on common elements
 */
function enhanceARIA() {
    // Enhance navigation
    document.querySelectorAll('nav, [role="navigation"]').forEach(nav => {
        if (!nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Main navigation');
        }
    });
    
    // Enhance buttons without text
    document.querySelectorAll('button').forEach(btn => {
        if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
            const icon = btn.querySelector('i[class*="fa-"], .icon');
            if (icon) {
                const iconClass = icon.className;
                let label = 'Button';
                
                if (iconClass.includes('close') || iconClass.includes('times')) label = 'Close';
                else if (iconClass.includes('menu') || iconClass.includes('bars')) label = 'Menu';
                else if (iconClass.includes('search')) label = 'Search';
                else if (iconClass.includes('plus')) label = 'Add';
                else if (iconClass.includes('minus')) label = 'Remove';
                else if (iconClass.includes('edit') || iconClass.includes('pencil')) label = 'Edit';
                else if (iconClass.includes('trash') || iconClass.includes('delete')) label = 'Delete';
                else if (iconClass.includes('save')) label = 'Save';
                else if (iconClass.includes('settings') || iconClass.includes('cog')) label = 'Settings';
                
                btn.setAttribute('aria-label', label);
            }
        }
    });
    
    // Enhance form fields
    document.querySelectorAll('input, select, textarea').forEach(field => {
        const id = field.id;
        if (id && !field.getAttribute('aria-label')) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (!label) {
                // Create aria-label from placeholder or name
                const labelText = field.placeholder || field.name || '';
                if (labelText) {
                    field.setAttribute('aria-label', labelText);
                }
            }
        }
    });
    
    // Enhance progress indicators
    document.querySelectorAll('[class*="progress"]').forEach(progress => {
        if (!progress.getAttribute('role')) {
            progress.setAttribute('role', 'progressbar');
            const value = progress.dataset.value || progress.style.width;
            if (value) {
                progress.setAttribute('aria-valuenow', parseInt(value));
                progress.setAttribute('aria-valuemin', '0');
                progress.setAttribute('aria-valuemax', '100');
            }
        }
    });
    
    // Mark decorative images
    document.querySelectorAll('img').forEach(img => {
        if (!img.alt && !img.getAttribute('role')) {
            if (img.classList.contains('decorative') || img.classList.contains('icon')) {
                img.setAttribute('alt', '');
                img.setAttribute('role', 'presentation');
            }
        }
    });
}

/**
 * Set ARIA expanded state
 * @param {HTMLElement} trigger - Trigger element
 * @param {boolean} expanded - Expanded state
 */
function setExpanded(trigger, expanded) {
    trigger.setAttribute('aria-expanded', String(expanded));
    
    const targetId = trigger.getAttribute('aria-controls');
    if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.setAttribute('aria-hidden', String(!expanded));
        }
    }
}

/**
 * Set ARIA selected state for tabs/options
 * @param {HTMLElement} element - Element to update
 * @param {boolean} selected - Selected state
 */
function setSelected(element, selected) {
    element.setAttribute('aria-selected', String(selected));
    element.setAttribute('tabindex', selected ? '0' : '-1');
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * Setup roving tabindex for a group
 * @param {HTMLElement} container - Container element
 * @param {string} itemSelector - Selector for items
 * @param {string} orientation - 'horizontal' or 'vertical'
 */
function setupRovingTabindex(container, itemSelector, orientation = 'horizontal') {
    const items = container.querySelectorAll(itemSelector);
    if (items.length === 0) return;
    
    // Set initial state
    items.forEach((item, index) => {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    
    container.addEventListener('keydown', (e) => {
        const currentIndex = Array.from(items).findIndex(
            item => item === document.activeElement
        );
        
        if (currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        const isHorizontal = orientation === 'horizontal';
        
        switch (e.key) {
            case isHorizontal ? 'ArrowRight' : 'ArrowDown':
                nextIndex = (currentIndex + 1) % items.length;
                break;
            case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
                nextIndex = (currentIndex - 1 + items.length) % items.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = items.length - 1;
                break;
            default:
                return;
        }
        
        e.preventDefault();
        items[currentIndex].setAttribute('tabindex', '-1');
        items[nextIndex].setAttribute('tabindex', '0');
        items[nextIndex].focus();
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Skip if in input field
        const tagName = document.activeElement.tagName.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tagName)) return;
        
        // Global shortcuts (with modifier)
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '/':
                    e.preventDefault();
                    // Toggle help modal
                    showKeyboardHelp();
                    break;
            }
        }
        
        // Navigation shortcuts (no modifier, single key)
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key) {
                case 'Escape':
                    // Close any open modal/dialog
                    const modal = document.querySelector('.modal.active, .modal[open], [role="dialog"][open]');
                    if (modal) {
                        const closeBtn = modal.querySelector('.close-btn, [data-close]');
                        if (closeBtn) closeBtn.click();
                    }
                    break;
                    
                case '?':
                    if (e.shiftKey) {
                        showKeyboardHelp();
                    }
                    break;
            }
        }
    });
}

/**
 * Show keyboard shortcuts help modal
 */
function showKeyboardHelp() {
    let helpModal = document.getElementById('keyboard-help-modal');
    
    if (!helpModal) {
        helpModal = document.createElement('div');
        helpModal.id = 'keyboard-help-modal';
        helpModal.className = 'modal';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
                    <button class="close-btn" aria-label="Close" data-close>&times;</button>
                </div>
                <div class="modal-body">
                    <table class="shortcuts-table">
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
                            <tr><td><kbd>Esc</kbd></td><td>Close modal/dialog</td></tr>
                            <tr><td><kbd>Tab</kbd></td><td>Navigate forward</td></tr>
                            <tr><td><kbd>Shift+Tab</kbd></td><td>Navigate backward</td></tr>
                            <tr><td><kbd>Enter</kbd></td><td>Activate button/link</td></tr>
                            <tr><td><kbd>Space</kbd></td><td>Toggle checkbox/button</td></tr>
                            <tr><td><kbd>Arrow keys</kbd></td><td>Navigate within components</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
        
        // Close button handler
        helpModal.querySelector('[data-close]').addEventListener('click', () => {
            helpModal.classList.remove('active');
            helpModal.removeAttribute('open');
            releaseTrap(helpModal);
        });
    }
    
    helpModal.classList.add('active');
    helpModal.setAttribute('open', '');
    trapFocus(helpModal);
}

// ============================================================================
// Reduced Motion
// ============================================================================

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply reduced motion styles
 */
function applyReducedMotion() {
    if (prefersReducedMotion()) {
        document.documentElement.classList.add('reduce-motion');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        document.documentElement.classList.toggle('reduce-motion', e.matches);
    });
}

// ============================================================================
// High Contrast
// ============================================================================

/**
 * Check if user prefers high contrast
 * @returns {boolean}
 */
function prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: more)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches;
}

/**
 * Apply high contrast mode
 */
function applyHighContrast() {
    if (prefersHighContrast()) {
        document.documentElement.classList.add('high-contrast');
    }
    
    window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
        document.documentElement.classList.toggle('high-contrast', e.matches);
    });
}

// ============================================================================
// Inject Accessibility CSS
// ============================================================================

function injectAccessibilityCSS() {
    if (document.getElementById('a11y-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'a11y-styles';
    style.textContent = `
        /* Screen reader only */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Skip link */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color, #667eea);
            color: white;
            padding: 8px 16px;
            z-index: 10000;
            transition: top 0.2s;
            text-decoration: none;
            font-weight: 500;
        }
        
        .skip-link:focus {
            top: 0;
        }
        
        /* Focus visible styles */
        :focus-visible {
            outline: 3px solid var(--primary-color, #667eea);
            outline-offset: 2px;
        }
        
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
            outline: 3px solid var(--primary-color, #667eea);
            outline-offset: 2px;
        }
        
        /* Remove focus outline for mouse users */
        :focus:not(:focus-visible) {
            outline: none;
        }
        
        /* Reduced motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        /* High contrast enhancements */
        .high-contrast {
            --text-color: #000;
            --bg-color: #fff;
            --border-color: #000;
        }
        
        .high-contrast button,
        .high-contrast a,
        .high-contrast input,
        .high-contrast select {
            border: 2px solid currentColor !important;
        }
        
        /* Keyboard shortcuts table */
        .shortcuts-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .shortcuts-table th,
        .shortcuts-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color, #e1e5eb);
        }
        
        .shortcuts-table kbd {
            background: var(--surface-color, #f5f7fa);
            border: 1px solid var(--border-color, #e1e5eb);
            border-radius: 4px;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 0.9em;
        }
        
        /* Ensure adequate touch targets */
        @media (pointer: coarse) {
            button,
            a,
            input[type="checkbox"],
            input[type="radio"] {
                min-height: 44px;
                min-width: 44px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize accessibility features
 */
function init() {
    injectAccessibilityCSS();
    createSkipLink();
    getLiveRegion();
    enhanceARIA();
    setupKeyboardShortcuts();
    applyReducedMotion();
    
    if (A11Y_CONFIG.detectHighContrast) {
        applyHighContrast();
    }
    
    console.log('[Accessibility] Initialized');
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================================
// Exports
// ============================================================================

const AccessibilityManager = {
    // Announcements
    announce,
    announceAssertive,
    
    // Focus management
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    getFocusableElements,
    
    // Focus trap
    trapFocus,
    releaseTrap,
    
    // ARIA
    enhanceARIA,
    setExpanded,
    setSelected,
    
    // Keyboard
    setupRovingTabindex,
    setupKeyboardShortcuts,
    showKeyboardHelp,
    
    // Preferences
    prefersReducedMotion,
    prefersHighContrast,
    
    // Init
    init,
    config: A11Y_CONFIG
};

if (typeof window !== 'undefined') {
    window.AccessibilityManager = AccessibilityManager;
    window.a11yAnnounce = announce;
    window.trapFocus = trapFocus;
    window.releaseTrap = releaseTrap;
}
