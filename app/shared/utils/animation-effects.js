/**
 * @module AnimationEffects
 * @description Visual effects and micro-animations
 * @version 1.0.0
 */

window.AnimationEffects = (function() {
    'use strict';

    /**
     * Show floating XP indicator
     * @param {number} amount - XP amount gained
     * @param {HTMLElement} [anchor] - Element to anchor the indicator to
     */
    function showXPGain(amount, anchor) {
        const indicator = document.createElement('div');
        indicator.className = 'xp-float-indicator';
        indicator.textContent = `+${amount} XP`;

        if (anchor) {
            const rect = anchor.getBoundingClientRect();
            indicator.style.left = `${rect.left + rect.width / 2}px`;
            indicator.style.top = `${rect.top}px`;
        } else {
            // Default to center-top
            indicator.style.left = '50%';
            indicator.style.top = '100px';
            indicator.style.transform = 'translateX(-50%)';
        }

        document.body.appendChild(indicator);

        // Remove after animation
        setTimeout(() => indicator.remove(), 1000);
    }

    /**
     * Trigger XP bar pulse animation
     */
    function pulseXPBar() {
        const bar = document.querySelector('.xp-progress-bar, .xp-fill');
        if (bar) {
            bar.classList.add('gaining');
            setTimeout(() => bar.classList.remove('gaining'), 600);
        }
    }

    /**
     * Show level up celebration
     * @param {number} newLevel - The new level achieved
     */
    function showLevelUp(newLevel) {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `
            <div class="level-up-card">
                <div class="level-number">${newLevel}</div>
                <div class="level-text">🎉 Level Up!</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Show confetti
        createConfetti();

        // Close on click or after delay
        overlay.addEventListener('click', () => overlay.remove());
        setTimeout(() => overlay.remove(), 3000);
    }

    /**
     * Create confetti burst
     * @param {number} [count=30] - Number of confetti pieces
     */
    function createConfetti(count = 30) {
        const colors = ['#4361ee', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 500}ms`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }
    }

    /**
     * Animate task completion
     * @param {HTMLElement} taskElement - The task element being completed
     */
    function animateTaskComplete(taskElement) {
        taskElement.classList.add('completing');
        setTimeout(() => {
            taskElement.classList.remove('completing');
            taskElement.classList.add('completed');
        }, 250);
    }

    /**
     * Animate mood selection
     * @param {HTMLElement} moodElement - The mood option element
     */
    function animateMoodSelect(moodElement) {
        // Remove previous selections
        document.querySelectorAll('.mood-option.selected').forEach(el => {
            el.classList.remove('selected');
        });

        moodElement.classList.add('selecting');
        setTimeout(() => {
            moodElement.classList.remove('selecting');
            moodElement.classList.add('selected');
        }, 250);
    }

    /**
     * Animate progress ring
     * @param {SVGCircleElement} circle - The SVG circle element
     * @param {number} percent - Target percentage (0-100)
     */
    function animateProgressRing(circle, percent) {
        const circumference = 2 * Math.PI * (circle.r?.baseVal?.value || 40);
        const startOffset = circumference;
        const endOffset = circumference - (percent / 100) * circumference;

        circle.style.setProperty('--progress-start', startOffset);
        circle.style.setProperty('--progress-end', endOffset);
        circle.classList.add('animate');
    }

    /**
     * Show success ripple effect
     * @param {HTMLElement} element - Element to ripple from
     */
    function showRipple(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 500);
    }

    /**
     * Stagger animate children elements
     * @param {HTMLElement} parent - Parent container
     */
    function staggerChildren(parent) {
        parent.classList.add('stagger-children');
    }

    /**
     * Enhanced toast with animation
     * @param {string} message - Toast message
     * @param {string} [type='info'] - Toast type
     */
    function showAnimatedToast(message, type = 'info') {
        // Find or create toast container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    function getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Shake element for error feedback
     * @param {HTMLElement} element - Element to shake
     */
    function shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'shake 0.5s ease-out';
    }

    // Add shake keyframes if not present
    if (!document.getElementById('shake-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shake-keyframes';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-10px); }
                40% { transform: translateX(10px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================================
       Public API
       ============================================================================ */

    return {
        showXPGain,
        pulseXPBar,
        showLevelUp,
        createConfetti,
        animateTaskComplete,
        animateMoodSelect,
        animateProgressRing,
        showRipple,
        staggerChildren,
        showAnimatedToast,
        shakeElement
    };

})();

// Hook into existing addXP function if it exists
(function() {
    const originalAddXP = window.addXP;
    if (typeof originalAddXP === 'function') {
        window.addXP = function(amount, reason) {
            const oldLevel = appState.level;
            const result = originalAddXP.apply(this, arguments);
            
            // Show XP gain indicator
            AnimationEffects.showXPGain(amount);
            AnimationEffects.pulseXPBar();
            
            // Check for level up
            if (appState.level > oldLevel) {
                setTimeout(() => {
                    AnimationEffects.showLevelUp(appState.level);
                }, 300);
            }
            
            return result;
        };
    }
})();
