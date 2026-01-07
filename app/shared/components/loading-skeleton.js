/**
 * @fileoverview Loading Skeleton Components
 * @description Provides skeleton loading placeholders for better UX
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Skeleton Templates
// ============================================================================

const SkeletonTemplates = {
    /**
     * Task card skeleton
     */
    taskCard: `
        <div class="skeleton-card" role="status" aria-label="Loading task">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
        </div>
    `,

    /**
     * Task category skeleton
     */
    taskCategory: `
        <div class="skeleton-category" role="status" aria-label="Loading tasks">
            <div class="skeleton skeleton-header"></div>
            <div class="skeleton-list">
                <div class="skeleton skeleton-item"></div>
                <div class="skeleton skeleton-item"></div>
                <div class="skeleton skeleton-item"></div>
            </div>
        </div>
    `,

    /**
     * Stat card skeleton
     */
    statCard: `
        <div class="skeleton-stat" role="status" aria-label="Loading statistic">
            <div class="skeleton skeleton-icon"></div>
            <div class="skeleton skeleton-number"></div>
            <div class="skeleton skeleton-label"></div>
        </div>
    `,

    /**
     * Chart skeleton
     */
    chart: `
        <div class="skeleton-chart" role="status" aria-label="Loading chart">
            <div class="skeleton skeleton-chart-area"></div>
            <div class="skeleton-chart-labels">
                <div class="skeleton skeleton-label-item"></div>
                <div class="skeleton skeleton-label-item"></div>
                <div class="skeleton skeleton-label-item"></div>
            </div>
        </div>
    `,

    /**
     * Journal entry skeleton
     */
    journalEntry: `
        <div class="skeleton-journal" role="status" aria-label="Loading journal entry">
            <div class="skeleton-header-row">
                <div class="skeleton skeleton-avatar"></div>
                <div class="skeleton skeleton-meta"></div>
            </div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
        </div>
    `,

    /**
     * Badge skeleton
     */
    badge: `
        <div class="skeleton-badge" role="status" aria-label="Loading badge">
            <div class="skeleton skeleton-badge-icon"></div>
            <div class="skeleton skeleton-badge-name"></div>
        </div>
    `,

    /**
     * Profile skeleton
     */
    profile: `
        <div class="skeleton-profile" role="status" aria-label="Loading profile">
            <div class="skeleton skeleton-avatar-large"></div>
            <div class="skeleton skeleton-name"></div>
            <div class="skeleton skeleton-email"></div>
        </div>
    `,

    /**
     * List item skeleton
     */
    listItem: `
        <div class="skeleton-list-item" role="status" aria-label="Loading item">
            <div class="skeleton skeleton-checkbox"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
    `
};

// ============================================================================
// Skeleton Generator
// ============================================================================

/**
 * Generate skeleton HTML for a container
 * @param {string} type - Skeleton type
 * @param {number} count - Number of skeletons to generate
 * @returns {string} HTML string
 */
function generateSkeleton(type, count = 1) {
    const template = SkeletonTemplates[type];
    if (!template) {
        console.warn(`[Skeleton] Unknown type: ${type}`);
        return '';
    }
    return Array(count).fill(template).join('');
}

/**
 * Show skeleton in a container
 * @param {string|HTMLElement} container - Container ID or element
 * @param {string} type - Skeleton type
 * @param {number} count - Number of skeletons
 */
function showSkeleton(container, type, count = 3) {
    const el = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
    
    if (!el) return;
    
    el.innerHTML = `
        <div class="skeleton-wrapper" aria-busy="true" aria-live="polite">
            ${generateSkeleton(type, count)}
        </div>
    `;
}

/**
 * Show multiple skeletons for dashboard
 * @param {Object} config - Configuration { containerId: { type, count } }
 */
function showDashboardSkeletons(config = {}) {
    const defaults = {
        'dashboardStats': { type: 'statCard', count: 4 },
        'taskCategories': { type: 'taskCategory', count: 4 },
        'moodChart': { type: 'chart', count: 1 }
    };
    
    const merged = { ...defaults, ...config };
    
    Object.entries(merged).forEach(([id, { type, count }]) => {
        showSkeleton(id, type, count);
    });
}

/**
 * Remove skeleton and show content
 * @param {string|HTMLElement} container - Container ID or element
 */
function hideSkeleton(container) {
    const el = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
    
    if (!el) return;
    
    const wrapper = el.querySelector('.skeleton-wrapper');
    if (wrapper) {
        wrapper.remove();
    }
    
    el.setAttribute('aria-busy', 'false');
}

// ============================================================================
// Error States
// ============================================================================

/**
 * Show error state in a container
 * @param {string|HTMLElement} container - Container ID or element
 * @param {string} message - Error message
 * @param {Function} retryCallback - Optional retry callback
 */
function showErrorState(container, message = 'Something went wrong', retryCallback = null) {
    const el = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
    
    if (!el) return;
    
    const retryButton = retryCallback 
        ? `<button class="btn btn-primary retry-btn" onclick="this.closest('.error-state').dataset.retry && window[this.closest('.error-state').dataset.retry]()">
               <i class="fas fa-redo"></i> Try Again
           </button>`
        : '';
    
    const retryFnName = retryCallback ? `retry_${Date.now()}` : '';
    if (retryCallback) {
        window[retryFnName] = retryCallback;
    }
    
    el.innerHTML = `
        <div class="error-state" role="alert" data-retry="${retryFnName}">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Oops!</h3>
            <p>${message}</p>
            ${retryButton}
        </div>
    `;
}

/**
 * Show empty state in a container
 * @param {string|HTMLElement} container - Container ID or element
 * @param {string} message - Empty state message
 * @param {string} icon - Font Awesome icon class
 * @param {string} actionText - Optional action button text
 * @param {Function} actionCallback - Optional action callback
 */
function showEmptyState(container, message, icon = 'fa-inbox', actionText = null, actionCallback = null) {
    const el = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
    
    if (!el) return;
    
    const actionButton = actionText && actionCallback 
        ? `<button class="btn btn-primary" id="emptyStateAction">
               ${actionText}
           </button>`
        : '';
    
    el.innerHTML = `
        <div class="empty-state" role="status">
            <div class="empty-icon">
                <i class="fas ${icon}"></i>
            </div>
            <p>${message}</p>
            ${actionButton}
        </div>
    `;
    
    if (actionCallback) {
        const btn = el.querySelector('#emptyStateAction');
        if (btn) {
            btn.addEventListener('click', actionCallback);
        }
    }
}

// ============================================================================
// CSS Injection
// ============================================================================

const skeletonStyles = `
/* Skeleton Loading Animations */
@keyframes skeletonShimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.skeleton-wrapper {
    width: 100%;
}

.skeleton {
    background: linear-gradient(
        90deg,
        var(--border-color) 25%,
        var(--card-bg) 50%,
        var(--border-color) 75%
    );
    background-size: 200% 100%;
    animation: skeletonShimmer 1.5s infinite ease-in-out;
    border-radius: 4px;
}

/* Dark mode adjustments */
.dark-mode .skeleton {
    background: linear-gradient(
        90deg,
        #3a3a4e 25%,
        #4a4a5e 50%,
        #3a3a4e 75%
    );
    background-size: 200% 100%;
}

/* Skeleton Card */
.skeleton-card {
    padding: 16px;
    margin-bottom: 12px;
}

.skeleton-title {
    height: 20px;
    width: 60%;
    margin-bottom: 12px;
}

.skeleton-text {
    height: 14px;
    width: 100%;
    margin-bottom: 8px;
}

.skeleton-text.short {
    width: 40%;
}

/* Skeleton Category */
.skeleton-category {
    margin-bottom: 20px;
}

.skeleton-header {
    height: 24px;
    width: 40%;
    margin-bottom: 12px;
}

.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-item {
    height: 48px;
    border-radius: 8px;
}

/* Skeleton Stat */
.skeleton-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 8px;
}

.skeleton-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.skeleton-number {
    width: 60px;
    height: 28px;
}

.skeleton-label {
    width: 80px;
    height: 14px;
}

/* Skeleton Chart */
.skeleton-chart {
    padding: 16px;
}

.skeleton-chart-area {
    height: 200px;
    margin-bottom: 16px;
    border-radius: 8px;
}

.skeleton-chart-labels {
    display: flex;
    justify-content: space-between;
}

.skeleton-label-item {
    width: 50px;
    height: 12px;
}

/* Skeleton Journal */
.skeleton-journal {
    padding: 16px;
    margin-bottom: 12px;
}

.skeleton-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
}

.skeleton-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
}

.skeleton-meta {
    height: 16px;
    width: 120px;
}

/* Skeleton Badge */
.skeleton-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    gap: 8px;
}

.skeleton-badge-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
}

.skeleton-badge-name {
    width: 60px;
    height: 12px;
}

/* Skeleton Profile */
.skeleton-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    gap: 12px;
}

.skeleton-name {
    width: 150px;
    height: 24px;
}

.skeleton-email {
    width: 200px;
    height: 16px;
}

/* Skeleton List Item */
.skeleton-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
}

.skeleton-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    flex-shrink: 0;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
}

.error-icon {
    font-size: 48px;
    color: var(--danger);
    margin-bottom: 16px;
    opacity: 0.7;
}

.error-state h3 {
    margin-bottom: 8px;
    color: var(--text-primary);
}

.error-state p {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
}

.empty-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
    .skeleton {
        animation: none;
        background: var(--border-color);
    }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'skeleton-styles';
    styleEl.textContent = skeletonStyles;
    document.head.appendChild(styleEl);
}

// ============================================================================
// Exports
// ============================================================================

const LoadingSkeleton = {
    templates: SkeletonTemplates,
    generate: generateSkeleton,
    show: showSkeleton,
    showDashboard: showDashboardSkeletons,
    hide: hideSkeleton,
    showError: showErrorState,
    showEmpty: showEmptyState
};

if (typeof window !== 'undefined') {
    window.LoadingSkeleton = LoadingSkeleton;
    window.showSkeleton = showSkeleton;
    window.hideSkeleton = hideSkeleton;
    window.showErrorState = showErrorState;
    window.showEmptyState = showEmptyState;
}
