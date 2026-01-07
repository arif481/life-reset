/**
 * @fileoverview Debounce & Throttle Utility Functions
 * @description Performance optimization utilities for frequent operations
 * @version 2.0.0
 */

'use strict';

// Store for debounce timers
const debounceTimers = {};

/**
 * Debounce a function call with a specific key
 * Useful for batching rapid updates (e.g., task saves)
 * @param {string} key - Unique identifier for this debounce
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds (default 500)
 */
export function debouncedSave(key, fn, delay = 500) {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
    }
    debounceTimers[key] = setTimeout(() => {
        fn();
        delete debounceTimers[key];
    }, delay);
}

/**
 * Cancel a pending debounced operation
 * @param {string} key - Key of the operation to cancel
 */
export function cancelDebounce(key) {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
        delete debounceTimers[key];
    }
}

/**
 * Check if a debounce is pending
 * @param {string} key - Key to check
 * @returns {boolean} True if a debounce is pending
 */
export function isDebouncing(key) {
    return !!debounceTimers[key];
}

/**
 * Create a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
}

/**
 * Create a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}

/**
 * Clear all pending debounces
 * Useful when logging out or resetting state
 */
export function clearAllDebounces() {
    Object.keys(debounceTimers).forEach(key => {
        clearTimeout(debounceTimers[key]);
        delete debounceTimers[key];
    });
}

// For backward compatibility with global functions
if (typeof window !== 'undefined') {
    window.debouncedSave = debouncedSave;
    window.cancelDebounce = cancelDebounce;
    window.debounce = debounce;
    window.throttle = throttle;
    window.clearAllDebounces = clearAllDebounces;
}
