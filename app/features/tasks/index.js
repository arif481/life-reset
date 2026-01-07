/**
 * @fileoverview Tasks Feature Index
 * @description Barrel file that exports all tasks feature modules
 * @version 2.0.0
 */

'use strict';

// Import and re-export all tasks modules
export { TasksData } from './tasks.data.js';
export { TasksLogic } from './tasks.logic.js';
export { TasksUI } from './tasks.ui.js';
export { TasksEvents } from './tasks.events.js';

// Combined Tasks namespace for convenience
const Tasks = {
    get Data() { return window.TasksData; },
    get Logic() { return window.TasksLogic; },
    get UI() { return window.TasksUI; },
    get Events() { return window.TasksEvents; }
};

// Register globally
if (typeof window !== 'undefined') {
    window.Tasks = Tasks;
}
