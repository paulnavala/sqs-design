#!/usr/bin/env node
/**
 * Generate Loader Files Script
 * 
 * Automatically scans the codebase and generates:
 * - global-css-loader.html/js  - CSS file loader for Squarespace
 * - global-js-loader.html/js    - JavaScript file loader for Squarespace
 * - components-registry.json     - Component metadata registry
 * - components-registry.md       - Human-readable component list
 * - COMPONENT-SYNTAX.md/txt     - Quick syntax reference
 * - Test file updates            - Auto-updates test HTML files
 * 
 * File Discovery:
 * - CSS files: Scans core/ and components/ directories
 * - JS files: Scans core/ and components/ directories (prioritizes utilities.js)
 * - HTML components: Scans components/ directories for *-loader.html files
 * 
 * Usage:
 *   node scripts/generate-loaders.js
 *   npm run generate-loaders
 * 
 * Output:
 *   All files written to loaders/ directory
 *   Test files in test/ directory are updated
 * 
 * @module generate-loaders
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

/** Base URL for GitHub Pages CDN */
const BASE_URL = 'https://assets.peachless.design';

/** Directory paths */
const CSS_DIR = path.join(__dirname, '..', 'core');
const JS_DIR = path.join(__dirname, '..', 'core');
const HTML_DIR = path.join(__dirname, '..', 'components');
const LOADERS_DIR = path.join(__dirname, '..', 'loaders');
const TEST_DIR = path.join(__dirname, '..', 'test');

// ============================================================================
// File Discovery Functions
// ============================================================================

/**
 * Get all CSS files from core/ and components/ directories
 * 
 * Scans:
 * - core/*.css - Core stylesheets
 * - components/[name]/*.css - Component-specific styles
 * 
 * @returns {Array<{path: string, file: string}>} Array of CSS file info
 */
function getAllCSSFiles() {
  const files = [];
  
  // Scan core directory for CSS files
  if (fs.existsSync(CSS_DIR)) {
    fs.readdirSync(CSS_DIR)
      .filter(file => file.endsWith('.css'))
      .forEach(file => {
        files.push({ 
          path: `/core/${file}`, 
          file 
        });
      });
  }
  
  // Scan component directories for component-specific CSS
  const componentsDir = path.join(__dirname, '..', 'components');
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(componentName => {
      const componentDir = path.join(componentsDir, componentName);
      
      // Only process directories (skip files)
      if (fs.statSync(componentDir).isDirectory()) {
        fs.readdirSync(componentDir)
          .filter(file => file.endsWith('.css'))
          .forEach(file => {
            files.push({ 
              path: `/components/${componentName}/${file}`, 
              file: `${componentName}/${file}` 
            });
          });
      }
    });
  }
  
  // Sort alphabetically for consistent output
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Get all JavaScript files from core/ and components/ directories
 * 
 * Prioritizes loading order:
 * 1. utilities.js (must load first)
 * 2. component-loader.js (loads second)
 * 3. All other files (alphabetical)
 * 
 * @returns {Array<{path: string, file: string}>} Array of JS file info
 */
function getAllJSFiles() {
  const files = [];
  
  // Scan core directory for JS files
  if (fs.existsSync(JS_DIR)) {
    const coreFiles = fs.readdirSync(JS_DIR)
      .filter(file => file.endsWith('.js'))
      .map(file => ({ 
        path: `/core/${file}`, 
        file, 
        // Set priority for load order
        priority: file === 'utilities.js' ? 0 : 
                  file === 'component-loader.js' ? 1 : 
                  2 
      }));
    
    // Sort by priority, then alphabetically
    coreFiles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.file.localeCompare(b.file);
    });
    
    // Add to files array (without priority property)
    coreFiles.forEach(({ path: filePath, file }) => {
      files.push({ path: filePath, file });
    });
  }
  
  // Scan component directories for component-specific JS
  const componentsDir = path.join(__dirname, '..', 'components');
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(componentName => {
      const componentDir = path.join(componentsDir, componentName);
      
      // Only process directories
      if (fs.statSync(componentDir).isDirectory()) {
        fs.readdirSync(componentDir)
          .filter(file => file.endsWith('.js'))
          .forEach(file => {
            files.push({ 
              path: `/components/${componentName}/${file}`, 
              file: `${componentName}/${file}` 
            });
          });
      }
    });
  }
  
  return files;
}

// ============================================================================
// Component Discovery
// ============================================================================

/**
 * Get all HTML component files from components/ directories
 * 
 * Looks for files matching pattern: *-loader.html
 * Extracts metadata from HTML comments.
 * 
 * @returns {Array<{filename: string, name: string, description: string, url: string, localPath: string}>}
 */
function getAllHTMLComponents() {
  const components = [];
  const componentsDir = path.join(__dirname, '..', 'components');
  
  if (!fs.existsSync(componentsDir)) {
    return components;
  }
  
  // Scan each component directory
  fs.readdirSync(componentsDir).forEach(componentName => {
    const componentDir = path.join(componentsDir, componentName);
    
    if (!fs.statSync(componentDir).isDirectory()) {
      return; // Skip files, only process directories
    }
    
    // Look for loader HTML files
    fs.readdirSync(componentDir)
      .filter(file => file.endsWith('-loader.html') || file.endsWith('.html'))
      .forEach(file => {
        const filePath = path.join(componentDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Generate component name from filename
        const baseName = file.replace('-loader.html', '').replace('.html', '');
        const name = baseName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Extract description from HTML comments
        let description = '';
        const commentRegex = /<!--\s*([\s\S]*?)\s*-->/;
        const commentMatch = content.match(commentRegex);
        
        if (commentMatch) {
          const commentText = commentMatch[1];
          
          // Try to find explicit "Description:" line
          const descMatch = commentText.match(/Description:\s*(.+?)(?:\n|$)/ims);
          if (descMatch && descMatch[1]) {
            description = descMatch[1].trim();
          } else {
            // Extract first meaningful line as description
            const lines = commentText
              .split('\n')
              .map(l => l.trim())
              .filter(l => 
                l && 
                !l.startsWith('Prerequisites:') && 
                !l.startsWith('Usage:') && 
                !l.startsWith('Note:') &&
                !l.startsWith('Description:') &&
                !l.match(/^\d+\./) && // Skip numbered lists
                !l.startsWith('- Add') &&
                !l.startsWith('- Paste') &&
                !l.toLowerCase().includes('global-css-loader') &&
                !l.toLowerCase().includes('global-js-loader') &&
                !l.toLowerCase().includes('code injection') &&
                !l.toLowerCase().includes('code block') &&
                l.length > 10 // Skip very short lines
              );
            
            if (lines.length > 0) {
              // Find first descriptive line
              const descLine = lines.find(l => 
                l.length > 15 && 
                !l.toLowerCase().includes('component html') &&
                !l.toLowerCase().includes('prerequisites') &&
                !l.toLowerCase().includes('usage')
              ) || lines[0];
              
              description = descLine;
            }
          }
          
          // Clean up description
          if (description) {
            description = description
              .replace(/^\w+\s+Component\s*(HTML\s*)?/i, '')
              .replace(/for Squarespace/i, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            // Truncate if too long
            if (description.length > 100) {
              const sentence = description.split('.')[0];
              description = sentence ? sentence + '.' : description.substring(0, 97) + '...';
            }
          }
        }
        
        // Default description if none found
        if (!description) {
          description = `${name} component for Squarespace`;
        }
        
        const url = `${BASE_URL}/components/${componentName}/${file}`;
        
        components.push({
          filename: file,
          name: name,
          description: description,
          url: url,
          localPath: `/components/${componentName}/${file}`,
          syntax: baseName // For component loader syntax
        });
      });
  });
  
  // Sort alphabetically by name
  return components.sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Loader Generation Functions
// ============================================================================

/**
 * Generate CSS loader HTML file
 * 
 * Creates an HTML snippet that loads all CSS files from GitHub Pages.
 * Designed to be pasted into Squarespace Code Injection > Header.
 * 
 * @param {Array<string>} cssFiles - Array of CSS file paths
 * @returns {string} HTML content with embedded script
 */
function generateCSSLoader(cssFiles) {
  const filesList = cssFiles
    .map(file => `    '${file}'`)
    .join(',\n');
  
  return `<!-- 
  Global CSS Loader for Squarespace
  Load all CSS files from GitHub Pages
  
  Usage in Squarespace:
  1. Go to Settings > Advanced > Code Injection
  2. Paste this ENTIRE content into the Header section
  3. Update BASE_URL if your GitHub Pages domain is different
  
  Note: This file is auto-generated. Run 'node scripts/generate-loaders.js' to regenerate.
-->

<script>
(function() {
  'use strict';
  
  const BASE_URL = '${BASE_URL}';
  
  // List of all CSS files to load (auto-generated)
  const CSS_FILES = [
${filesList}
  ];
  
  // Function to load CSS
  function loadCSS(href) {
    // Check if already loaded (avoid duplicates)
    const existing = document.querySelector(\`link[href*="\${href}"]\`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_URL + href;
    document.head.appendChild(link);
  }
  
  // Load all CSS files
  CSS_FILES.forEach(function(file) {
    loadCSS(file);
  });
})();
</script>
`;
}

/**
 * Generate JavaScript loader HTML file
 * 
 * Creates an HTML snippet that loads all JS files from GitHub Pages.
 * Loads files sequentially to respect dependencies (utilities.js first).
 * Designed to be pasted into Squarespace Code Injection > Footer.
 * 
 * @param {Array<string>} jsFiles - Array of JS file paths
 * @returns {string} HTML content with embedded script
 */
function generateJSLoader(jsFiles) {
  const filesList = jsFiles
    .map((file, index) => {
      const prefix = index === 0 && file.includes('utilities.js')
        ? '    // utilities.js loads first as other scripts may depend on it\n'
        : '';
      return prefix + `    '${file}'`;
    })
    .join(',\n');
  
  return `<!-- 
  Global JavaScript Loader for Squarespace
  Load all JavaScript files from GitHub Pages
  
  Usage in Squarespace:
  1. Go to Settings > Advanced > Code Injection
  2. Paste this ENTIRE content into the Footer section
  3. Update BASE_URL if your GitHub Pages domain is different
  
  Note: utilities.js loads first as other scripts may depend on it
  Auto-generated - Run 'node scripts/generate-loaders.js' to regenerate.
-->

<script>
(function() {
  'use strict';
  
  const BASE_URL = '${BASE_URL}';
  
  // List of all JS files to load (in order) - auto-generated
  const JS_FILES = [
${filesList}
  ];
  
  // Function to load JS (sequential loading to respect dependencies)
  function loadJS(src, callback) {
    // Check if already loaded (avoid duplicates)
    const existing = document.querySelector(\`script[src*="\${src}"]\`);
    if (existing) {
      if (callback) callback();
      return;
    }
    
    const script = document.createElement('script');
    script.src = BASE_URL + src;
    script.onerror = function() {
      console.warn('Failed to load:', src);
      if (callback) callback();
    };
    if (callback) {
      script.onload = callback;
    }
    document.head.appendChild(script);
  }
  
  // Load JS files sequentially
  let index = 0;
  function loadNext() {
    if (index >= JS_FILES.length) return;
    
    loadJS(JS_FILES[index], function() {
      index++;
      loadNext();
    });
  }
  
  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNext);
  } else {
    loadNext();
  }
})();
</script>
`;
}

/**
 * Generate standalone CSS loader JavaScript file
 * 
 * @param {Array<string>} cssFiles - Array of CSS file paths
 * @returns {string} JavaScript code
 */
function generateCSSLoaderJS(cssFiles) {
  const filesList = cssFiles
    .map(file => `    '${file}'`)
    .join(',\n');
  
  return `/**
 * Global CSS Loader for Squarespace
 * Load all CSS files from GitHub Pages
 * 
 * Auto-generated - Run 'node scripts/generate-loaders.js' to regenerate.
 */

(function() {
  'use strict';
  
  const BASE_URL = '${BASE_URL}';
  
  // List of all CSS files to load (auto-generated)
  const CSS_FILES = [
${filesList}
  ];
  
  // Function to load CSS
  function loadCSS(href) {
    // Check if already loaded
    const existing = document.querySelector(\`link[href*="\${href}"]\`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_URL + href;
    document.head.appendChild(link);
  }
  
  // Load all CSS files
  CSS_FILES.forEach(function(file) {
    loadCSS(file);
  });
})();
`;
}

/**
 * Generate standalone JavaScript loader file
 * 
 * @param {Array<string>} jsFiles - Array of JS file paths
 * @returns {string} JavaScript code
 */
function generateJSLoaderJS(jsFiles) {
  const filesList = jsFiles
    .map((file, index) => {
      const prefix = index === 0 && file.includes('utilities.js')
        ? '    // utilities.js loads first as other scripts may depend on it\n'
        : '';
      return prefix + `    '${file}'`;
    })
    .join(',\n');
  
  return `/**
 * Global JavaScript Loader for Squarespace
 * Load all JavaScript files from GitHub Pages
 * 
 * Note: utilities.js loads first as other scripts may depend on it
 * Auto-generated - Run 'node scripts/generate-loaders.js' to regenerate.
 */

(function() {
  'use strict';
  
  const BASE_URL = '${BASE_URL}';
  
  // List of all JS files to load (in order) - auto-generated
  const JS_FILES = [
${filesList}
  ];
  
  // Function to load JS (sequential loading to respect dependencies)
  function loadJS(src, callback) {
    // Check if already loaded
    const existing = document.querySelector(\`script[src*="\${src}"]\`);
    if (existing) {
      if (callback) callback();
      return;
    }
    
    const script = document.createElement('script');
    script.src = BASE_URL + src;
    script.onerror = function() {
      console.warn('Failed to load:', src);
      if (callback) callback();
    };
    if (callback) {
      script.onload = callback;
    }
    document.head.appendChild(script);
  }
  
  // Load JS files sequentially
  let index = 0;
  function loadNext() {
    if (index >= JS_FILES.length) return;
    
    loadJS(JS_FILES[index], function() {
      index++;
      loadNext();
    });
  }
  
  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNext);
  } else {
    loadNext();
  }
})();
`;
}

// ============================================================================
// Registry Generation Functions
// ============================================================================

/**
 * Generate component registry JSON file
 * 
 * Creates a JSON file with all component metadata for programmatic access.
 * Deduplicates components (prefers -loader versions).
 * 
 * @param {Array} components - Array of component objects
 * @returns {string} JSON string
 */
function generateComponentRegistry(components) {
  // Deduplicate: prefer -loader versions when both exist
  const componentMap = new Map();
  
  components.forEach(comp => {
    const baseName = comp.filename.replace('-loader.html', '').replace('.html', '');
    
    if (!componentMap.has(baseName)) {
      componentMap.set(baseName, comp);
    } else {
      // Prefer -loader version
      if (comp.filename.includes('-loader')) {
        componentMap.set(baseName, comp);
      }
    }
  });
  
  // Convert to array and sort
  const uniqueComponents = Array.from(componentMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return JSON.stringify({
    components: uniqueComponents,
    generated: new Date().toISOString(),
    total: uniqueComponents.length
  }, null, 2);
}

/**
 * Generate component registry Markdown file
 * 
 * Creates a human-readable markdown file listing all components.
 * 
 * @param {Array} components - Array of component objects
 * @returns {string} Markdown content
 */
function generateComponentRegistryMarkdown(components) {
  // Deduplicate (same logic as JSON)
  const componentMap = new Map();
  components.forEach(comp => {
    const baseName = comp.filename.replace('-loader.html', '').replace('.html', '');
    if (!componentMap.has(baseName)) {
      componentMap.set(baseName, comp);
    } else {
      if (comp.filename.includes('-loader')) {
        componentMap.set(baseName, comp);
      }
    }
  });
  
  const uniqueComponents = Array.from(componentMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  let md = `# Components Registry

Generated: ${new Date().toLocaleString()}

This registry lists all available components in the Squarespace Design Components library.

## Components

`;
  
  if (uniqueComponents.length === 0) {
    md += '_No components found._\n';
    return md;
  }
  
  uniqueComponents.forEach(comp => {
    const syntax = comp.syntax || comp.filename.replace('-loader.html', '').replace('.html', '');
    
    md += `### ${comp.name}\n\n`;
    md += `**Description:** ${comp.description}\n\n`;
    md += `**File:** \`${comp.filename}\`\n\n`;
    md += `**GitHub Pages URL:** [${comp.url}](${comp.url})\n\n`;
    md += `**Component Loader Syntax:**\n\`\`\`html\n<div data-component="${syntax}"></div>\n\`\`\`\n\n`;
    md += `**Usage:** Use the Component Loader syntax above, or copy the content from the file and paste it into a Squarespace Code Block.\n\n`;
    md += `---\n\n`;
  });
  
  md += `\n## Notes\n\n`;
  md += `- All components require the global CSS and JS loaders to be set up in Squarespace Code Injection\n`;
  md += `- See \`docs/guides/squarespace-setup.md\` for setup instructions\n`;
  md += `- This registry is auto-generated. Run \`npm run generate-loaders\` to regenerate.\n`;
  
  return md;
}

/**
 * Generate component syntax reference files
 * 
 * Creates quick-reference files for component syntax.
 * 
 * @param {Array} components - Array of component objects
 */
function generateComponentSyntaxReference(components) {
  // Deduplicate components
  const componentMap = new Map();
  components.forEach(comp => {
    const baseName = comp.filename.replace('-loader.html', '').replace('.html', '');
    if (!componentMap.has(baseName)) {
      componentMap.set(baseName, comp);
    } else {
      if (comp.filename.includes('-loader')) {
        componentMap.set(baseName, comp);
      }
    }
  });
  
  const uniqueComponents = Array.from(componentMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Generate Markdown
  let md = `# Component Syntax Reference

Generated: ${new Date().toLocaleString()}

Quick reference for using components in Squarespace Code Blocks.

## Quick Copy Table

<table>
  <thead>
    <tr>
      <th>Component Name</th>
      <th>Syntax</th>
      <th>Copy Code</th>
    </tr>
  </thead>
  <tbody>
`;

  // Helper function to escape HTML for display
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Helper function to decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Add table rows with click-to-copy
  uniqueComponents.forEach(comp => {
    const componentKey = comp.syntax || comp.filename.replace('-loader.html', '').replace('.html', '');
    const copyCode = `<div data-component="${componentKey}"></div>`;
    const escapedCopyCode = escapeHtml(copyCode);
    // Store the raw code in data-copy (HTML entities will be auto-decoded by getAttribute, but we need to escape for attribute)
    const dataCopyValue = copyCode.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    md += `    <tr>
      <td>${comp.name}</td>
      <td><code class="copyable" data-copy="${componentKey}">${componentKey} <span class="copy-icon">📋</span></code></td>
      <td><code class="copyable" data-copy="${dataCopyValue}">${escapedCopyCode} <span class="copy-icon">📋</span></code></td>
    </tr>
`;
  });

  md += `  </tbody>
</table>

<p><em>💡 Click any code cell to copy it to your clipboard</em></p>

---

## Component Loader Syntax

All components use the same simple syntax with the \`data-component\` attribute:

\`\`\`html
<div data-component="COMPONENT-NAME"></div>
\`\`\`

---

## Available Components

`;
  
  uniqueComponents.forEach((comp, index) => {
    const componentKey = comp.syntax || comp.filename.replace('-loader.html', '').replace('.html', '');
    
    md += `### ${comp.name}\n\n`;
    md += `**Description:** ${comp.description}\n\n`;
    md += `**Syntax:**\n\n`;
    md += `\`\`\`html\n<div data-component="${componentKey}"></div>\n\`\`\`\n\n`;
    md += `---\n\n`;
  });
  
  md += `## Quick Copy-Paste List\n\n`;
  md += `### All Components at Once:\n\n\`\`\`html\n`;
  
  uniqueComponents.forEach(comp => {
    const componentKey = comp.syntax || comp.filename.replace('-loader.html', '').replace('.html', '');
    md += `<div data-component="${componentKey}"></div>\n`;
  });
  
  md += `\`\`\`\n\n`;
  
  md += `## Usage Notes\n\n`;
  md += `- Make sure the **Component Loader** is set up (it's included in the Global JS Loader)\n`;
  md += `- Just paste the \`<div data-component="..."></div>\` syntax in any Code Block\n`;
  md += `- Components automatically load from GitHub Pages\n`;
  md += `- Updates are automatic - change component on GitHub, Squarespace updates instantly\n\n`;
  
  md += `---\n\n`;
  md += `> **Note:** This file is auto-generated. Run \`npm run generate-loaders\` to regenerate.\n`;

  // Add click-to-copy JavaScript
  md += `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const copyableElements = document.querySelectorAll('.copyable');
    
    copyableElements.forEach(element => {
      element.style.cursor = 'pointer';
      element.style.userSelect = 'none';
      element.title = 'Click to copy';
      
      element.addEventListener('click', function() {
        // getAttribute automatically decodes HTML entities
        const textToCopy = this.getAttribute('data-copy');
        
        // Use modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const copyIcon = this.querySelector('.copy-icon');
            const originalIcon = copyIcon ? copyIcon.textContent : '';
            if (copyIcon) {
              copyIcon.textContent = '✓';
              copyIcon.style.color = '#28a745';
            }
            
            setTimeout(() => {
              if (copyIcon) {
                copyIcon.textContent = originalIcon;
                copyIcon.style.color = '';
              }
            }, 1500);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          
          try {
            document.execCommand('copy');
            const copyIcon = this.querySelector('.copy-icon');
            const originalIcon = copyIcon ? copyIcon.textContent : '';
            if (copyIcon) {
              copyIcon.textContent = '✓';
              copyIcon.style.color = '#28a745';
            }
            
            setTimeout(() => {
              if (copyIcon) {
                copyIcon.textContent = originalIcon;
                copyIcon.style.color = '';
              }
            }, 1500);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
          
          document.body.removeChild(textarea);
        }
      });
    });
  });
</script>

<style>
  .copyable {
    transition: color 0.2s ease;
  }
  
  .copyable:hover {
    opacity: 0.8;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  
  table th,
  table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  table code {
    background-color: #f1f3f5;
    padding: 4px 8px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    display: inline-block;
    position: relative;
  }
  
  .copy-icon {
    margin-left: 6px;
    font-size: 0.85em;
    opacity: 0.7;
    transition: all 0.2s ease;
  }
  
  .copyable:hover .copy-icon {
    opacity: 1;
    transform: scale(1.1);
  }
</style>
`;

  // Write Markdown file
  const mdPath = path.join(LOADERS_DIR, 'COMPONENT-SYNTAX.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  
  // Also create a standalone HTML version for better browser compatibility
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Syntax Reference</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    
    h1 {
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }
    
    .copyable {
      transition: color 0.2s ease;
      cursor: pointer;
      user-select: none;
    }
    
    .copyable:hover {
      opacity: 0.8;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    table th,
    table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    table code {
      background-color: #f1f3f5;
      padding: 4px 8px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      display: inline-block;
      position: relative;
    }
    
    .copy-icon {
      margin-left: 6px;
      font-size: 0.85em;
      opacity: 0.7;
      transition: all 0.2s ease;
    }
    
    .copyable:hover .copy-icon {
      opacity: 1;
      transform: scale(1.1);
    }
    
    code {
      background-color: #f1f3f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
${md.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '')}
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const copyableElements = document.querySelectorAll('.copyable');
      
      copyableElements.forEach(element => {
        element.title = 'Click to copy';
        
        element.addEventListener('click', function() {
          // getAttribute automatically decodes HTML entities
          const textToCopy = this.getAttribute('data-copy');
          
          // Use modern clipboard API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
              // Visual feedback
              const copyIcon = this.querySelector('.copy-icon');
              const originalIcon = copyIcon ? copyIcon.textContent : '';
              if (copyIcon) {
                copyIcon.textContent = '✓';
                copyIcon.style.color = '#28a745';
              }
              
              setTimeout(() => {
                if (copyIcon) {
                  copyIcon.textContent = originalIcon;
                  copyIcon.style.color = '';
                }
              }, 1500);
            }).catch(err => {
              console.error('Failed to copy:', err);
              alert('Failed to copy to clipboard. Please try selecting the text manually.');
            });
          } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
              document.execCommand('copy');
              const copyIcon = this.querySelector('.copy-icon');
              const originalIcon = copyIcon ? copyIcon.textContent : '';
              if (copyIcon) {
                copyIcon.textContent = '✓';
                copyIcon.style.color = '#28a745';
              }
              
              setTimeout(() => {
                if (copyIcon) {
                  copyIcon.textContent = originalIcon;
                  copyIcon.style.color = '';
                }
              }, 1500);
            } catch (err) {
              console.error('Failed to copy:', err);
              alert('Failed to copy to clipboard. Please try selecting the text manually.');
            }
            
            document.body.removeChild(textarea);
          }
        });
      });
    });
  </script>
</body>
</html>`;
  
  const htmlPath = path.join(LOADERS_DIR, 'COMPONENT-SYNTAX.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  // Generate plain text version for quick copy-paste
  let txt = `Component Syntax Reference\n`;
  txt += `Generated: ${new Date().toLocaleString()}\n\n`;
  txt += `Quick Copy-Paste List:\n\n`;
  
  uniqueComponents.forEach(comp => {
    const componentKey = comp.syntax || comp.filename.replace('-loader.html', '').replace('.html', '');
    txt += `<div data-component="${componentKey}"></div>\n`;
  });
  
  txt += `\n---\n`;
  txt += `\nFor full documentation, see COMPONENT-SYNTAX.md\n`;
  
  const txtPath = path.join(LOADERS_DIR, 'COMPONENT-SYNTAX.txt');
  fs.writeFileSync(txtPath, txt, 'utf8');
}

/**
 * Generate Squarespace Paths Documentation
 * 
 * Creates comprehensive documentation about file paths, URLs, and linking
 * in Squarespace. Auto-generated from current file structure.
 * 
 * @param {Array<{path: string}>} cssFiles - Array of CSS file paths
 * @param {Array<{path: string}>} jsFiles - Array of JS file paths
 * @param {Array<Object>} components - Array of component objects
 */
function generatePathsDocumentation(cssFiles, jsFiles, components) {
  const cssPaths = cssFiles.map(f => f.path).sort();
  const jsPaths = jsFiles.map(f => f.path).sort();
  
  // Separate core and component files
  const coreCSS = cssPaths.filter(p => p.startsWith('/core/'));
  const componentCSS = cssPaths.filter(p => p.startsWith('/components/'));
  const coreJS = jsPaths.filter(p => p.startsWith('/core/'));
  const componentJS = jsPaths.filter(p => p.startsWith('/components/'));
  
  let doc = `# Squarespace File Paths & Linking Guide

**Auto-generated:** ${new Date().toLocaleString()}

> ⚠️ **This file is auto-generated.** Do not edit manually.  
> Run \`npm run generate-loaders\` to regenerate when components change.

## Overview

All files are loaded from GitHub Pages at \`${BASE_URL}\`. All paths and documentation are automatically kept in sync when components are added, removed, or renamed.

## Current Path Structure

### Base URL
\`\`\`
${BASE_URL}
\`\`\`

### File Paths

**Core CSS Files (${coreCSS.length} files):**
\`\`\`
${coreCSS.join('\n')}
\`\`\`

**Core JavaScript Files (${coreJS.length} files):**
\`\`\`
${coreJS.join('\n')}
\`\`\`

**Component Files:**
\`\`\`
/components/[component-name]/[component-name].css
/components/[component-name]/[component-name].js
/components/[component-name]/[component-name]-loader.html
\`\`\`

**Current Components (${components.length}):**
\`\`\`
`;
  
  // Add component examples
  components.forEach(comp => {
    const baseName = comp.filename.replace('-loader.html', '').replace('.html', '');
    const componentDir = baseName.includes('/') ? baseName.split('/')[0] : baseName;
    doc += `/${componentDir}/${componentDir}.css\n`;
    doc += `/${componentDir}/${comp.filename.replace(/-loader\.html$/, '.js')}\n`;
    doc += `/${componentDir}/${comp.filename}\n\n`;
  });
  
  doc += `\`\`\`

**Complete File List:**

**Component CSS (${componentCSS.length} files):**
\`\`\`
${componentCSS.join('\n')}
\`\`\`

**Component JavaScript (${componentJS.length} files):**
\`\`\`
${componentJS.join('\n')}
\`\`\`

## How Squarespace Linking Works

### Method 1: Global Loaders (Recommended - Auto-Updated)

**Step 1: Add CSS Loader to Header**
- Go to Settings > Advanced > Code Injection
- Paste content from \`loaders/global-css-loader.html\` into **Header** section
- This loads ALL CSS files automatically (currently ${cssPaths.length} files)

**Step 2: Add JS Loader to Footer**
- In the same Code Injection page
- Paste content from \`loaders/global-js-loader.html\` into **Footer** section
- This loads ALL JavaScript files automatically (currently ${jsPaths.length} files)

**Step 3: Use Components**
- For HTML components, use the component loader:
  \`\`\`html
  <div data-component="COMPONENT-NAME"></div>
  \`\`\`
- See \`loaders/COMPONENT-SYNTAX.md\` for component names

**✅ Automatic Updates:** When you run \`npm run generate-loaders\`, the loaders are automatically updated with any new/removed components. Just copy the new loader content to Squarespace.

### Method 2: Individual File Linking (Not Recommended)

If you need to link files individually:

**CSS Files:**
\`\`\`html
`;
  
  cssPaths.slice(0, 3).forEach(p => {
    doc += `<link rel="stylesheet" href="${BASE_URL}${p}">\n`;
  });
  
  doc += `\`\`\`

**JavaScript Files:**
\`\`\`html
`;
  
  jsPaths.slice(0, 3).forEach(p => {
    doc += `<script src="${BASE_URL}${p}"></script>\n`;
  });
  
  doc += `\`\`\`

## Path Construction Logic

### Global Loaders
The loaders construct URLs as:
\`\`\`
BASE_URL + file_path
\`\`\`

Example:
\`\`\`
'${BASE_URL}' + '/core/elegant-footer.css'
= '${BASE_URL}/core/elegant-footer.css'
\`\`\`

### Component Loader
For component HTML files:
\`\`\`
BASE_URL + '/components/' + component-name + '/' + component-name + '-loader.html'
\`\`\`

Example:
\`\`\`
'${BASE_URL}' + '/components/' + 'fortune-peach' + '/' + 'fortune-peach-loader.html'
= '${BASE_URL}/components/fortune-peach/fortune-peach-loader.html'
\`\`\`

## Auto-Update System

### What Gets Auto-Updated

When you run \`npm run generate-loaders\`, the following files are automatically regenerated:

✅ **Loader Files:**
- \`loaders/global-css-loader.html\` - CSS loader for Squarespace Header
- \`loaders/global-js-loader.html\` - JS loader for Squarespace Footer
- \`loaders/global-css-loader.js\` - Standalone CSS loader (JS version)
- \`loaders/global-js-loader.js\` - Standalone JS loader (JS version)

✅ **Documentation Files:**
- \`loaders/components-registry.json\` - Component metadata (machine-readable)
- \`loaders/components-registry.md\` - Component list (human-readable)
- \`loaders/COMPONENT-SYNTAX.md\` - Component usage syntax
- \`loaders/COMPONENT-SYNTAX.txt\` - Quick copy-paste reference
- \`SQUARESPACE-PATHS.md\` - **This file** (paths documentation)

✅ **Test Files:**
- \`test/index.html\` - Manual test page (file lists updated)
- \`test/index-auto.html\` - Auto-loading test page (file lists updated)

### When to Run

Run \`npm run generate-loaders\` when you:
- ✅ Add a new component
- ✅ Remove a component
- ✅ Rename a component
- ✅ Change component file structure
- ✅ Add/remove core CSS or JS files

**It's also included in the build process:**
\`\`\`bash
npm run build  # Runs portfolio-build + generate-loaders
\`\`\`

## GitHub Pages Structure

For GitHub Pages to serve files correctly, your repository structure should be:

\`\`\`
repository-root/
├── core/
│   ├── elegant-footer.css
│   ├── utilities.js
│   └── ...
├── components/
│   ├── fortune-peach/
│   │   ├── fortune-peach.css
│   │   ├── fortune-peach.js
│   │   └── fortune-peach-loader.html
│   └── ...
└── CNAME (contains: assets.peachless.design)
\`\`\`

**Important:** If your GitHub Pages uses a different source (like \`/docs\` folder), you'll need to:
1. Move all files into that folder, OR
2. Update BASE_URL and paths in loaders to include the folder prefix

## Changing the Base URL

To change the GitHub Pages domain:

1. **Update \`scripts/generate-loaders.js\`:**
   \`\`\`javascript
   const BASE_URL = 'https://your-new-domain.com';
   \`\`\`

2. **Update \`core/component-loader.js\`:**
   \`\`\`javascript
   const BASE_URL = 'https://your-new-domain.com';
   \`\`\`

3. **Regenerate loaders:**
   \`\`\`bash
   npm run generate-loaders
   \`\`\`

4. **Update CNAME file:**
   \`\`\`
   your-new-domain.com
   \`\`\`

## Verifying Paths

To verify a file is accessible:

1. **Test URL in browser:**
   \`\`\`
   ${BASE_URL}/core/utilities.js
   \`\`\`

2. **Check browser console** for 404 errors when loading components

3. **Use browser Network tab** to see which files load/fail

## Common Issues

### Issue: Files Not Loading (404 errors)

**Possible causes:**
1. Files not pushed to GitHub Pages branch
2. GitHub Pages not configured correctly
3. Wrong BASE_URL in loaders
4. Path case sensitivity (Linux servers are case-sensitive)

**Solution:**
- Verify files exist at the URLs in your browser
- Check GitHub Pages settings
- Ensure file names match exactly (case-sensitive)

### Issue: Components Not Appearing

**Possible causes:**
1. Component loader not loaded
2. Wrong component name in \`data-component\`
3. Component HTML file not accessible

**Solution:**
- Check browser console for errors
- Verify \`component-loader.js\` is loaded
- Test component URL directly: \`${BASE_URL}/components/[component]/[component]-loader.html\`

### Issue: Styles Not Applying

**Possible causes:**
1. CSS files not loading
2. CSS load order issues
3. Squarespace theme overriding styles

**Solution:**
- Check Network tab for CSS files
- Ensure global-css-loader is in Header (not Footer)
- Use browser inspector to verify styles are loaded

## Best Practices

1. **Always use global loaders** - Easier to maintain and update
2. **Run generate-loaders after changes** - Keeps everything in sync
3. **Test paths locally first** - Use \`npm run serve\` to test
4. **Keep BASE_URL consistent** - Update in all places when changing
5. **Use relative paths in loaders** - Paths start with \`/\` (absolute from domain root)
6. **Verify GitHub Pages deployment** - Ensure files are accessible before deploying to Squarespace

## Summary

✅ **All paths are auto-generated** - No manual path updates needed  
✅ **All loaders auto-update** - New components automatically included  
✅ **All documentation auto-updates** - Stays in sync with actual files  
✅ **Just run \`npm run generate-loaders\`** - One command updates everything

---

> 📝 **Last Updated:** ${new Date().toLocaleString()}  
> 🔄 **Auto-generated by:** \`scripts/generate-loaders.js\`  
> ⚠️ **Do not edit manually** - Changes will be overwritten
`;

  const docPath = path.join(__dirname, '..', 'SQUARESPACE-PATHS.md');
  fs.writeFileSync(docPath, doc, 'utf8');
}

// ============================================================================
// Test File Update Functions
// ============================================================================

/**
 * Update test HTML files with current file lists
 * 
 * Automatically updates the CSS and JS file lists in test/index.html
 * and test/index-auto.html to reflect current component files.
 * 
 * @param {Array<string>} cssFiles - Array of CSS file paths
 * @param {Array<string>} jsFiles - Array of JS file paths
 */
function updateTestFiles(cssFiles, jsFiles) {
  // Read test files
  const testFiles = [
    path.join(TEST_DIR, 'index.html'),
    path.join(TEST_DIR, 'index-auto.html')
  ];
  
  testFiles.forEach(testFile => {
    if (!fs.existsSync(testFile)) {
      console.warn(`⚠️  Test file not found: ${testFile}`);
      return;
    }
    
    let content = fs.readFileSync(testFile, 'utf8');
    
    // Update CSS files list
    const cssList = cssFiles.map(f => `    '${f}'`).join(',\n');
    const cssRegex = /(const CSS_FILES = \[)([\s\S]*?)(\];)/;
    if (cssRegex.test(content)) {
      content = content.replace(cssRegex, `$1\n${cssList}\n$3`);
    }
    
    // Update JS files list
    const jsList = jsFiles.map(f => `    '${f}'`).join(',\n');
    const jsRegex = /(const JS_FILES = \[)([\s\S]*?)(\];)/;
    if (jsRegex.test(content)) {
      content = content.replace(jsRegex, `$1\n${jsList}\n$3`);
    }
    
    // Write updated content
    fs.writeFileSync(testFile, content, 'utf8');
  });
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Main function - orchestrates the entire build process
 */
function main() {
  console.log('🔍 Scanning directories...\n');
  
  // Ensure loaders directory exists
  if (!fs.existsSync(LOADERS_DIR)) {
    fs.mkdirSync(LOADERS_DIR, { recursive: true });
  }
  
  // Discover all files
  const cssFiles = getAllCSSFiles();
  const jsFiles = getAllJSFiles();
  const htmlComponents = getAllHTMLComponents();
  
  // Log discovery results
  console.log(`📦 Found ${cssFiles.length} CSS files:`);
  cssFiles.forEach(f => console.log(`   ${f.path}`));
  
  console.log(`\n📦 Found ${jsFiles.length} JavaScript files:`);
  jsFiles.forEach(f => console.log(`   ${f.path}`));
  
  console.log(`\n📦 Found ${htmlComponents.length} HTML components:`);
  htmlComponents.forEach(c => console.log(`   ${c.name} (${c.filename})`));
  
  console.log('\n📝 Generating loader files...\n');
  
  // Generate CSS loader
  const cssLoaderHtml = generateCSSLoader(cssFiles.map(f => f.path));
  const cssLoaderPath = path.join(LOADERS_DIR, 'global-css-loader.html');
  fs.writeFileSync(cssLoaderPath, cssLoaderHtml, 'utf8');
  console.log(`✅ Generated: ${cssLoaderPath}`);
  
  // Generate JS loader
  const jsLoaderHtml = generateJSLoader(jsFiles.map(f => f.path));
  const jsLoaderPath = path.join(LOADERS_DIR, 'global-js-loader.html');
  fs.writeFileSync(jsLoaderPath, jsLoaderHtml, 'utf8');
  console.log(`✅ Generated: ${jsLoaderPath}`);
  
  console.log('\n📦 Generating standalone loader files...\n');
  
  // Generate standalone JS files
  const cssLoaderJS = generateCSSLoaderJS(cssFiles.map(f => f.path));
  const cssLoaderJSPath = path.join(LOADERS_DIR, 'global-css-loader.js');
  fs.writeFileSync(cssLoaderJSPath, cssLoaderJS, 'utf8');
  console.log(`✅ Generated: ${cssLoaderJSPath}`);
  
  const jsLoaderJS = generateJSLoaderJS(jsFiles.map(f => f.path));
  const jsLoaderJSPath = path.join(LOADERS_DIR, 'global-js-loader.js');
  fs.writeFileSync(jsLoaderJSPath, jsLoaderJS, 'utf8');
  console.log(`✅ Generated: ${jsLoaderJSPath}`);
  
  console.log('\n📋 Generating component registry...\n');
  
  // Generate component registry
  const registryJson = generateComponentRegistry(htmlComponents);
  const registryJsonPath = path.join(LOADERS_DIR, 'components-registry.json');
  fs.writeFileSync(registryJsonPath, registryJson, 'utf8');
  console.log(`✅ Generated: ${registryJsonPath}`);
  
  const registryMd = generateComponentRegistryMarkdown(htmlComponents);
  const registryMdPath = path.join(LOADERS_DIR, 'components-registry.md');
  fs.writeFileSync(registryMdPath, registryMd, 'utf8');
  console.log(`✅ Generated: ${registryMdPath}`);
  
  console.log('\n🧪 Updating test files...\n');
  updateTestFiles(cssFiles.map(f => f.path), jsFiles.map(f => f.path));
  console.log(`✅ Updated: ${path.join(TEST_DIR, 'index-auto.html')}`);
  console.log(`✅ Updated: ${path.join(TEST_DIR, 'index.html')}`);
  
  console.log('\n📚 Generating component syntax reference...\n');
  generateComponentSyntaxReference(htmlComponents);
  console.log(`✅ Generated: ${path.join(LOADERS_DIR, 'COMPONENT-SYNTAX.md')}`);
  console.log(`✅ Generated: ${path.join(LOADERS_DIR, 'COMPONENT-SYNTAX.txt')}`);
  
  console.log('\n📖 Generating paths documentation...\n');
  generatePathsDocumentation(cssFiles, jsFiles, htmlComponents);
  console.log(`✅ Generated: ${path.join(__dirname, '..', 'SQUARESPACE-PATHS.md')}`);
  
  console.log('\n✨ Done! All files have been updated.');
  console.log('💡 Remember to copy the new loader content to Squarespace Code Injection if needed.\n');
}

// Run main function
main();
