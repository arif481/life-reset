/**
 * @fileoverview Dashboard Events & Initialization
 * @description Event handlers and initialization for dashboard
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Dashboard Initialization
// ============================================================================

/**
 * Initialize the dashboard
 * Called when navigating to dashboard view
 */
function initDashboardV2() {
    // Use new modular dashboard if available
    if (window.DashboardUI && window.DashboardData) {
        window.DashboardUI.render();
    } else {
        // Fallback to legacy dashboard
        if (typeof initDashboard === 'function') {
            initDashboard();
        }
    }
}

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
    initDashboardV2();
    if (typeof showToast === 'function') {
        showToast('Dashboard refreshed', 'info');
    }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle pull-to-refresh on mobile
 */
function setupDashboardPullToRefresh() {
    const container = document.getElementById('dashboard-view');
    if (!container) return;
    
    let startY = 0;
    let isPulling = false;
    
    container.addEventListener('touchstart', (e) => {
        if (container.scrollTop === 0) {
            startY = e.touches[0].pageY;
            isPulling = true;
        }
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 80) {
            container.classList.add('refreshing');
        }
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
        if (container.classList.contains('refreshing')) {
            refreshDashboard();
            setTimeout(() => {
                container.classList.remove('refreshing');
            }, 500);
        }
        isPulling = false;
    });
}

/**
 * Handle visibility change to refresh stale data
 */
function setupVisibilityRefresh() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const currentView = appState.currentView;
            if (currentView === 'dashboard') {
                // Check if data is stale (> 5 minutes)
                const lastRefresh = window._dashboardLastRefresh || 0;
                if (Date.now() - lastRefresh > 5 * 60 * 1000) {
                    initDashboardV2();
                    window._dashboardLastRefresh = Date.now();
                }
            }
        }
    });
}

// ============================================================================
// Initialize on Load
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    setupDashboardPullToRefresh();
    setupVisibilityRefresh();
    window._dashboardLastRefresh = Date.now();
});

// ============================================================================
// Exports
// ============================================================================

if (typeof window !== 'undefined') {
    window.DashboardEvents = {
        init: initDashboardV2,
        refresh: refreshDashboard
    };
    
    // Override legacy initDashboard to use new version
    window._legacyInitDashboard = window.initDashboard;
    window.initDashboard = function() {
        initDashboardV2();
    };
}
