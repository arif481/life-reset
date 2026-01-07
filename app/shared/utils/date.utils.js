/**
 * @fileoverview Date Utility Functions
 * @description Centralized date formatting and manipulation utilities
 * @version 2.0.0
 */

'use strict';

/**
 * Format a date object to a human-readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Monday, January 1, 2024")
 */
export function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Convert a date to ISO date string format (YYYY-MM-DD)
 * @param {Date} date - The date to convert
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getDateString(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Get today's date string
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayString() {
    return getDateString(new Date());
}

/**
 * Get a date N days ago
 * @param {number} daysAgo - Number of days in the past
 * @returns {Date} The date N days ago
 */
export function getDateDaysAgo(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
}

/**
 * Check if a date string is today
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
    return dateString === getTodayString();
}

/**
 * Get an array of date strings for the last N days
 * @param {number} days - Number of days to include
 * @returns {string[]} Array of date strings
 */
export function getLastNDays(days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
        dates.push(getDateString(getDateDaysAgo(i)));
    }
    return dates.reverse(); // Oldest first
}

/**
 * Get short day name (Mon, Tue, etc.)
 * @param {Date} date - The date
 * @returns {string} Short day name
 */
export function getShortDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get short month and day (Jan 5, Feb 12, etc.)
 * @param {Date} date - The date
 * @returns {string} Short date format
 */
export function getShortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// For backward compatibility with global functions
// These will be removed once all files are migrated to ES modules
if (typeof window !== 'undefined') {
    window.formatDate = formatDate;
    window.getDateString = getDateString;
    window.getTodayString = getTodayString;
    window.getDateDaysAgo = getDateDaysAgo;
    window.isToday = isToday;
    window.getLastNDays = getLastNDays;
}
