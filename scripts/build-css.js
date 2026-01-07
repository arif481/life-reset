#!/usr/bin/env node

/**
 * @fileoverview CSS Bundler & Minifier
 * @description Build script to concatenate and minify CSS files for production
 * @version 2.0.0
 * 
 * Usage:
 *   node scripts/build-css.js          # Build production CSS
 *   node scripts/build-css.js --watch  # Watch mode for development
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    // Source directory
    srcDir: path.join(__dirname, '..', 'css'),
    
    // Output directory
    distDir: path.join(__dirname, '..', 'dist'),
    
    // Output filename
    outputFile: 'bundle.min.css',
    
    // CSS files in load order (order matters for cascade)
    cssFiles: [
        'variables.css',    // CSS custom properties first
        'base.css',         // Reset and base styles
        'layout.css',       // Layout structure
        'components.css',   // Reusable components
        'auth.css',         // Authentication screens
        'dashboard.css',    // Dashboard view
        'tracker.css',      // Task tracker
        'habits.css',       // Habits module
        'goals.css',        // Goals module
        'journal.css',      // Mood journal
        'analytics.css',    // Analytics/charts
        'gamification.css', // Gamification features
        'gamification-v2.css', // Gamification v2 enhancements
        'settings.css',     // Settings page
        'mobile.css'        // Mobile responsive overrides (last)
    ],
    
    // Minification options
    minify: true,
    
    // Generate source map
    sourceMap: false,
    
    // Add banner comment
    banner: `/*!\n * Life Reset v2.0.0\n * Bundled CSS - ${new Date().toISOString()}\n */\n`
};

// ============================================================================
// CSS Minifier (Simple implementation)
// ============================================================================

/**
 * Minify CSS content
 * @param {string} css - CSS content
 * @returns {string} Minified CSS
 */
function minifyCSS(css) {
    return css
        // Remove comments (but preserve /*! important */)
        .replace(/\/\*(?!!)[^*]*\*+([^/*][^*]*\*+)*\//g, '')
        // Remove whitespace around special characters
        .replace(/\s*([{}:;,>~+])\s*/g, '$1')
        // Remove whitespace at start/end of lines
        .replace(/^\s+|\s+$/gm, '')
        // Collapse multiple spaces
        .replace(/\s{2,}/g, ' ')
        // Remove newlines
        .replace(/\n/g, '')
        // Remove space after colons in properties
        .replace(/:\s+/g, ':')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        // Remove units from zero values (0px -> 0)
        .replace(/(\s|:)0(px|em|rem|%|vh|vw)/g, '$10')
        // Optimize color values
        .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3')
        .trim();
}

/**
 * Format CSS for readability (development mode)
 * @param {string} css - CSS content
 * @returns {string} Formatted CSS
 */
function formatCSS(css) {
    return css
        // Add newlines after rules
        .replace(/}/g, '}\n\n')
        // Add newlines after opening braces
        .replace(/{/g, ' {\n  ')
        // Add newlines after semicolons
        .replace(/;/g, ';\n  ')
        // Clean up extra whitespace
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Read a CSS file
 * @param {string} filename - CSS filename
 * @returns {string} File content
 */
function readCSSFile(filename) {
    const filePath = path.join(CONFIG.srcDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        return '';
    }
    
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Ensure output directory exists
 */
function ensureDistDir() {
    if (!fs.existsSync(CONFIG.distDir)) {
        fs.mkdirSync(CONFIG.distDir, { recursive: true });
    }
}

/**
 * Write bundled CSS file
 * @param {string} content - CSS content
 */
function writeBundle(content) {
    ensureDistDir();
    
    const outputPath = path.join(CONFIG.distDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Written: ${CONFIG.outputFile} (${sizeKB} KB)`);
}

/**
 * Write unminified bundle for debugging
 * @param {string} content - CSS content
 */
function writeDebugBundle(content) {
    ensureDistDir();
    
    const debugFile = CONFIG.outputFile.replace('.min.css', '.css');
    const outputPath = path.join(CONFIG.distDir, debugFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    
    console.log(`✅ Written: ${debugFile} (debug version)`);
}

// ============================================================================
// Build Process
// ============================================================================

/**
 * Main build function
 */
function build() {
    console.log('\n🔨 Building CSS bundle...\n');
    
    const startTime = Date.now();
    
    // Collect all CSS content
    let combinedCSS = '';
    let fileCount = 0;
    
    CONFIG.cssFiles.forEach(filename => {
        const content = readCSSFile(filename);
        if (content) {
            combinedCSS += `\n/* === ${filename} === */\n`;
            combinedCSS += content;
            fileCount++;
            console.log(`  📄 ${filename}`);
        }
    });
    
    // Check for any additional CSS files not in the list
    const allCSSFiles = fs.readdirSync(CONFIG.srcDir)
        .filter(f => f.endsWith('.css'));
    
    const missingFiles = allCSSFiles.filter(f => !CONFIG.cssFiles.includes(f));
    if (missingFiles.length > 0) {
        console.log('\n⚠️  CSS files not included in bundle:');
        missingFiles.forEach(f => console.log(`    - ${f}`));
    }
    
    // Save unminified version
    writeDebugBundle(CONFIG.banner + combinedCSS);
    
    // Minify
    if (CONFIG.minify) {
        const minified = CONFIG.banner + minifyCSS(combinedCSS);
        writeBundle(minified);
        
        // Calculate compression ratio
        const originalSize = combinedCSS.length;
        const minifiedSize = minified.length;
        const ratio = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        
        console.log(`\n📊 Compression: ${ratio}% reduction`);
    } else {
        writeBundle(CONFIG.banner + combinedCSS);
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`\n✨ Done! Built ${fileCount} files in ${elapsed}ms\n`);
}

// ============================================================================
// Watch Mode
// ============================================================================

/**
 * Watch for CSS file changes
 */
function watch() {
    console.log('\n👀 Watching for CSS changes...\n');
    console.log(`   Source: ${CONFIG.srcDir}`);
    console.log(`   Output: ${CONFIG.distDir}\n`);
    
    // Initial build
    build();
    
    // Watch for changes
    fs.watch(CONFIG.srcDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.css')) {
            console.log(`\n🔄 Change detected: ${filename}`);
            build();
        }
    });
    
    console.log('Press Ctrl+C to stop watching.\n');
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
    watch();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CSS Bundler for Life Reset

Usage:
  node scripts/build-css.js [options]

Options:
  --watch, -w    Watch mode (rebuild on changes)
  --help, -h     Show this help message

Output:
  dist/bundle.min.css  - Minified production CSS
  dist/bundle.css      - Unminified debug CSS
`);
} else {
    build();
}
