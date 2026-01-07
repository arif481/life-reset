/**
 * @fileoverview Toast Notification Component
 * @description Reusable toast notification system
 * @version 2.0.0
 */

'use strict';

// Toast queue for managing multiple toasts
let toastQueue = [];
let isShowingToast = false;

/**
 * Display a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} type - Notification type: 'info' | 'success' | 'warning' | 'error'
 * @param {number} duration - Duration in milliseconds (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Guard against missing DOM elements
    if (!toast || !toastMessage) {
        console.warn('[Toast] Elements not found:', message);
        return;
    }
    
    // Set message
    toastMessage.textContent = message;
    
    // Set type class
    toast.className = `toast ${type} show`;
    
    // Set icon based on type
    if (toastIcon) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        toastIcon.className = `fas ${icons[type] || icons.info}`;
    }
    
    // Auto-hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Show a success toast
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Show an error toast
 * @param {string} message - Error message
 */
export function showError(message) {
    showToast(message, 'error');
}

/**
 * Show a warning toast
 * @param {string} message - Warning message
 */
export function showWarning(message) {
    showToast(message, 'warning');
}

/**
 * Show an info toast
 * @param {string} message - Info message
 */
export function showInfo(message) {
    showToast(message, 'info');
}

/**
 * Hide the currently shown toast
 */
export function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Export Toast object
export const Toast = {
    show: showToast,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    hide: hideToast
};

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.Toast = Toast;
}
