/**
 * @fileoverview Goals Events & Initialization
 * @description Event handlers for goals feature
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize goals view
 */
function initGoalsView() {
    if (window.GoalsUI) {
        window.GoalsUI.render();
    } else if (typeof renderGoals === 'function') {
        // Fallback to legacy
        renderGoals();
    }
}

// ============================================================================
// Exports
// ============================================================================

if (typeof window !== 'undefined') {
    window.GoalsEvents = {
        init: initGoalsView
    };
}
