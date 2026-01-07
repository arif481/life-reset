/**
 * @fileoverview Sanitization Utility Functions
 * @description XSS prevention and input sanitization utilities
 * @version 2.0.0
 */

'use strict';

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} HTML-escaped string safe for DOM insertion
 */
export function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize an object's string properties
 * @param {Object} obj - Object with string properties
 * @param {string[]} fields - Fields to sanitize
 * @returns {Object} Object with sanitized fields
 */
export function sanitizeObject(obj, fields) {
    const result = { ...obj };
    fields.forEach(field => {
        if (typeof result[field] === 'string') {
            result[field] = sanitizeHTML(result[field]);
        }
    });
    return result;
}

/**
 * Validate and sanitize a task name
 * @param {string} name - Task name to validate
 * @param {number} maxLength - Maximum allowed length (default 200)
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export function validateTaskName(name, maxLength = 200) {
    if (!name || typeof name !== 'string') {
        return { valid: false, sanitized: '', error: 'Task name is required' };
    }
    
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return { valid: false, sanitized: '', error: 'Task name cannot be empty' };
    }
    
    if (trimmed.length > maxLength) {
        return { 
            valid: false, 
            sanitized: sanitizeHTML(trimmed.substring(0, maxLength)), 
            error: `Task name must be ${maxLength} characters or less` 
        };
    }
    
    return { valid: true, sanitized: sanitizeHTML(trimmed) };
}

/**
 * Validate a mood value
 * @param {string} mood - Mood value to validate
 * @returns {boolean} True if valid mood
 */
export function isValidMood(mood) {
    const validMoods = ['very-sad', 'sad', 'okay', 'good', 'great'];
    return validMoods.includes(mood);
}

/**
 * Validate intensity value (0-100)
 * @param {number} intensity - Intensity value
 * @returns {number} Clamped intensity value
 */
export function validateIntensity(intensity) {
    const num = parseInt(intensity, 10);
    if (isNaN(num)) return 50;
    return Math.max(0, Math.min(100, num));
}

// For backward compatibility with global functions
if (typeof window !== 'undefined') {
    window.sanitizeHTML = sanitizeHTML;
    window.sanitizeObject = sanitizeObject;
    window.validateTaskName = validateTaskName;
    window.isValidMood = isValidMood;
    window.validateIntensity = validateIntensity;
}
