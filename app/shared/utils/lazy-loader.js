/**
 * @fileoverview Lazy Loading Manager
 * @description Dynamically load heavy modules like Chart.js only when needed
 * @version 2.0.0
 */

'use strict';

// ============================================================================
// Module Registry
// ============================================================================

const LAZY_MODULES = {
    chartjs: {
        src: 'https://cdn.jsdelivr.net/npm/chart.js',
        globalName: 'Chart',
        loaded: false
    },
    // Future modules can be added here
    // pdfjs: { src: '...', globalName: 'pdfjsLib', loaded: false },
    // marked: { src: '...', globalName: 'marked', loaded: false },
};

// Loading state tracking
const loadingPromises = new Map();

// ============================================================================
// Core Loader
// ============================================================================

/**
 * Load a script dynamically
 * @param {string} src - Script URL
 * @returns {Promise<void>}
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = () => {
            console.log(`[LazyLoad] Loaded: ${src}`);
            resolve();
        };
        
        script.onerror = () => {
            console.error(`[LazyLoad] Failed: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Load a CSS file dynamically
 * @param {string} href - CSS URL
 * @returns {Promise<void>}
 */
function loadCSS(href) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`link[href="${href}"]`);
        if (existing) {
            resolve();
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        
        link.onload = () => {
            console.log(`[LazyLoad] Loaded CSS: ${href}`);
            resolve();
        };
        
        link.onerror = () => {
            console.error(`[LazyLoad] Failed CSS: ${href}`);
            reject(new Error(`Failed to load CSS: ${href}`));
        };
        
        document.head.appendChild(link);
    });
}

/**
 * Load a registered module
 * @param {string} moduleName - Module name from LAZY_MODULES
 * @returns {Promise<any>} The loaded module's global object
 */
async function loadModule(moduleName) {
    const moduleConfig = LAZY_MODULES[moduleName];
    
    if (!moduleConfig) {
        throw new Error(`Unknown module: ${moduleName}`);
    }
    
    // Already loaded
    if (moduleConfig.loaded && window[moduleConfig.globalName]) {
        return window[moduleConfig.globalName];
    }
    
    // Already loading - return existing promise
    if (loadingPromises.has(moduleName)) {
        return loadingPromises.get(moduleName);
    }
    
    // Start loading
    const loadPromise = (async () => {
        await loadScript(moduleConfig.src);
        moduleConfig.loaded = true;
        
        // Wait a tick for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return window[moduleConfig.globalName];
    })();
    
    loadingPromises.set(moduleName, loadPromise);
    
    try {
        const result = await loadPromise;
        return result;
    } finally {
        loadingPromises.delete(moduleName);
    }
}

// ============================================================================
// Chart.js Specific
// ============================================================================

/**
 * Check if Chart.js is loaded
 * @returns {boolean}
 */
function isChartJsLoaded() {
    return typeof window.Chart !== 'undefined';
}

/**
 * Load Chart.js on demand
 * @returns {Promise<typeof Chart>}
 */
async function loadChartJs() {
    if (isChartJsLoaded()) {
        return window.Chart;
    }
    
    return loadModule('chartjs');
}

/**
 * Create a chart with lazy loading
 * @param {string|HTMLCanvasElement} canvas - Canvas element or ID
 * @param {Object} config - Chart.js configuration
 * @returns {Promise<Chart>}
 */
async function createChart(canvas, config) {
    const Chart = await loadChartJs();
    
    const canvasEl = typeof canvas === 'string' 
        ? document.getElementById(canvas) 
        : canvas;
    
    if (!canvasEl) {
        throw new Error('Canvas element not found');
    }
    
    // Destroy existing chart on same canvas
    const existingChart = Chart.getChart(canvasEl);
    if (existingChart) {
        existingChart.destroy();
    }
    
    return new Chart(canvasEl, config);
}

/**
 * Create chart with loading state
 * @param {string} containerId - Container element ID
 * @param {string} canvasId - Canvas element ID
 * @param {Object} config - Chart.js configuration
 * @returns {Promise<Chart>}
 */
async function createChartWithLoading(containerId, canvasId, config) {
    const container = document.getElementById(containerId);
    
    if (container && window.LoadingSkeleton) {
        window.LoadingSkeleton.show(container, 'chart', 1);
    }
    
    try {
        const chart = await createChart(canvasId, config);
        
        if (container && window.LoadingSkeleton) {
            window.LoadingSkeleton.hide(container);
        }
        
        return chart;
    } catch (error) {
        if (container && window.showErrorState) {
            window.showErrorState(container, 'Failed to load chart', () => {
                createChartWithLoading(containerId, canvasId, config);
            });
        }
        throw error;
    }
}

// ============================================================================
// Intersection Observer for Lazy Loading
// ============================================================================

const observedElements = new Map();
let intersectionObserver = null;

/**
 * Initialize intersection observer for lazy loading
 */
function initIntersectionObserver() {
    if (intersectionObserver) return;
    
    intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const callback = observedElements.get(entry.target);
                    if (callback) {
                        callback();
                        intersectionObserver.unobserve(entry.target);
                        observedElements.delete(entry.target);
                    }
                }
            });
        },
        {
            rootMargin: '50px',
            threshold: 0.1
        }
    );
}

/**
 * Load content when element becomes visible
 * @param {HTMLElement|string} element - Element or ID
 * @param {Function} loadCallback - Function to call when visible
 */
function loadOnVisible(element, loadCallback) {
    const el = typeof element === 'string' 
        ? document.getElementById(element) 
        : element;
    
    if (!el) {
        console.warn('[LazyLoad] Element not found');
        return;
    }
    
    initIntersectionObserver();
    
    // Check if already visible
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
        loadCallback();
        return;
    }
    
    observedElements.set(el, loadCallback);
    intersectionObserver.observe(el);
}

// ============================================================================
// Preloading
// ============================================================================

/**
 * Preload a module in the background
 * @param {string} moduleName - Module name
 */
function preloadModule(moduleName) {
    // Use requestIdleCallback for non-critical preloading
    const load = () => {
        loadModule(moduleName).catch(err => {
            console.warn(`[LazyLoad] Preload failed: ${moduleName}`, err);
        });
    };
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(load, { timeout: 5000 });
    } else {
        setTimeout(load, 2000);
    }
}

/**
 * Preload multiple modules
 * @param {string[]} moduleNames - Array of module names
 */
function preloadModules(moduleNames) {
    moduleNames.forEach(preloadModule);
}

// ============================================================================
// Analytics Page Optimization
// ============================================================================

/**
 * Initialize analytics charts with lazy loading
 * Called when user navigates to analytics view
 */
async function initAnalyticsLazy() {
    // Show skeletons first
    if (window.LoadingSkeleton) {
        ['moodChartContainer', 'completionChartContainer', 'categoryChartContainer'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                window.LoadingSkeleton.show(container, 'chart', 1);
            }
        });
    }
    
    // Load Chart.js
    try {
        await loadChartJs();
        console.log('[LazyLoad] Chart.js ready for analytics');
        
        // Now initialize the actual charts (call existing functions)
        if (typeof initAnalytics === 'function') {
            initAnalytics();
        } else if (window.AnalyticsEvents && typeof window.AnalyticsEvents.loadAnalytics === 'function') {
            window.AnalyticsEvents.loadAnalytics();
        }
    } catch (error) {
        console.error('[LazyLoad] Failed to load analytics:', error);
        
        // Show error states
        ['moodChartContainer', 'completionChartContainer', 'categoryChartContainer'].forEach(id => {
            const container = document.getElementById(id);
            if (container && window.showErrorState) {
                window.showErrorState(container, 'Failed to load charts');
            }
        });
    }
}

// ============================================================================
// Exports
// ============================================================================

const LazyLoader = {
    // Core
    loadScript,
    loadCSS,
    loadModule,
    
    // Chart.js
    isChartJsLoaded,
    loadChartJs,
    createChart,
    createChartWithLoading,
    
    // Intersection observer
    loadOnVisible,
    
    // Preloading
    preload: preloadModule,
    preloadMultiple: preloadModules,
    
    // Analytics
    initAnalyticsLazy,
    
    // Registry
    modules: LAZY_MODULES
};

if (typeof window !== 'undefined') {
    window.LazyLoader = LazyLoader;
    window.loadChartJs = loadChartJs;
    window.createChart = createChart;
    window.loadOnVisible = loadOnVisible;
}
