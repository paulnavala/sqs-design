#!/usr/bin/env node
/**
 * Generate Loader Files Script
 * 
 * Automatically scans css/, js/, and html/ directories and generates:
 * - global-css-loader.html
 * - global-js-loader.html
 * - components-registry.json (component registry with metadata)
 * 
 * Usage:
 *   node scripts/generate-loaders.js
 * 
 * Or add to package.json scripts for npm run generate-loaders
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://assets.peachless.design';
const CSS_DIR = path.join(__dirname, '..', 'css');
const JS_DIR = path.join(__dirname, '..', 'js');
const HTML_DIR = path.join(__dirname, '..', 'html');

// Ensure html directory exists
if (!fs.existsSync(HTML_DIR)) {
  fs.mkdirSync(HTML_DIR, { recursive: true });
}

/**
 * Get all CSS files from css/ directory
 */
function getCSSFiles() {
  if (!fs.existsSync(CSS_DIR)) {
    console.warn('Warning: css/ directory not found');
    return [];
  }
  
  const files = fs.readdirSync(CSS_DIR)
    .filter(file => file.endsWith('.css'))
    .map(file => `/css/${file}`)
    .sort(); // Sort alphabetically for consistent ordering
  
  return files;
}

/**
 * Get all JS files from js/ directory
 * Ensures utilities.js loads first if it exists
 * Excludes global loader files (to avoid self-loading)
 */
function getJSFiles() {
  if (!fs.existsSync(JS_DIR)) {
    console.warn('Warning: js/ directory not found');
    return [];
  }
  
  // Exclude global loader files - they're not loaded by themselves
  const excludeFiles = ['global-css-loader.js', 'global-js-loader.js'];
  
  const files = fs.readdirSync(JS_DIR)
    .filter(file => file.endsWith('.js') && !excludeFiles.includes(file))
    .map(file => `/js/${file}`)
    .sort();
  
  // Move utilities.js to the beginning if it exists
  const utilitiesIndex = files.indexOf('/js/utilities.js');
  if (utilitiesIndex > 0) {
    files.splice(utilitiesIndex, 1);
    files.unshift('/js/utilities.js');
  }
  
  return files;
}

/**
 * Generate CSS loader HTML
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
</script>
`;
}

/**
 * Get all HTML component files (excludes loaders and README)
 */
function getHTMLComponents() {
  if (!fs.existsSync(HTML_DIR)) {
    console.warn('Warning: html/ directory not found');
    return [];
  }
  
  const excludeFiles = ['global-css-loader.html', 'global-js-loader.html', 'README.md'];
  
  return fs.readdirSync(HTML_DIR)
    .filter(file => {
      return file.endsWith('.html') && !excludeFiles.includes(file);
    })
    .map(file => {
      const filePath = path.join(HTML_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract component name from filename (remove extension and -loader suffix)
      const baseName = file.replace('.html', '').replace('-loader', '');
      const name = baseName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Extract description from HTML comments
      let description = '';
      // Match multiline HTML comments
      const commentRegex = /<!--\s*([\s\S]*?)\s*-->/;
      const commentMatch = content.match(commentRegex);
      if (commentMatch) {
        const commentText = commentMatch[1];
        
        // First, try to find a "Description:" line explicitly
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
              !l.startsWith('1.') &&
              !l.startsWith('2.') &&
              !l.startsWith('3.') &&
              !l.startsWith('- Add') &&
              !l.startsWith('- Paste') &&
              !l.startsWith('- Update') &&
              !l.toLowerCase().includes('global-css-loader') &&
              !l.toLowerCase().includes('global-js-loader') &&
              !l.toLowerCase().includes('code injection') &&
              !l.toLowerCase().includes('code block') &&
              l.length > 10 // Skip very short lines
            );
          if (lines.length > 0) {
            // Take the first line that seems descriptive (not instructions)
            let descLine = lines.find(l => 
              l.length > 15 && 
              !l.toLowerCase().includes('component html') &&
              !l.toLowerCase().includes('prerequisites') &&
              !l.toLowerCase().includes('usage') &&
              !l.toLowerCase().includes('settings') &&
              !l.toLowerCase().includes('advanced')
            ) || lines[0];
            
            description = descLine;
          }
        }
        
        // Clean up the description
        if (description) {
          description = description
            .replace(/^\w+\s+Component\s*(HTML\s*)?/i, '')
            .replace(/for Squarespace/i, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          // If it's too long, take first sentence
          if (description.length > 100) {
            const sentence = description.split('.')[0];
            description = sentence ? sentence + '.' : description.substring(0, 97) + '...';
          }
        }
      }
      
      // If no description found, create one from filename
      if (!description) {
        description = `${name} component for Squarespace`;
      }
      
      return {
        filename: file,
        name: name,
        description: description,
        url: `${BASE_URL}/html/${file}`,
        localPath: `/html/${file}`
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Generate component registry JSON
 */
function generateComponentRegistry(components) {
  const registry = {
    generated: new Date().toISOString(),
    baseUrl: BASE_URL,
    components: components.map(comp => ({
      name: comp.name,
      description: comp.description,
      url: comp.url,
      filename: comp.filename
    }))
  };
  
  return JSON.stringify(registry, null, 2);
}

/**
 * Generate component registry Markdown
 */
function generateComponentRegistryMarkdown(components) {
  let md = `# Components Registry

> Auto-generated component registry  
> Last updated: ${new Date().toLocaleString()}

This registry contains all available HTML components that can be used in Squarespace Code Blocks.

## Components

`;
  
  if (components.length === 0) {
    md += '_No components found._\n';
    return md;
  }
  
  components.forEach(comp => {
    md += `### ${comp.name}\n\n`;
    md += `**Description:** ${comp.description}\n\n`;
    md += `**File:** \`${comp.filename}\`\n\n`;
    md += `**GitHub Pages URL:** [${comp.url}](${comp.url})\n\n`;
    md += `**Usage:** Copy the content from the file above and paste it into a Squarespace Code Block.\n\n`;
    md += `---\n\n`;
  });
  
  md += `\n## Notes\n\n`;
  md += `- All components require the global CSS and JS loaders to be set up in Squarespace Code Injection\n`;
  md += `- See \`html/README.md\` for setup instructions\n`;
  md += `- This registry is auto-generated. Run \`npm run generate-loaders\` to regenerate.\n`;
  
  return md;
}

/**
 * Generate CSS loader JavaScript (standalone .js file)
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
 * Generate JS loader JavaScript (standalone .js file)
 */
function generateJSLoaderJS(jsFiles) {
  const filesList = jsFiles
    .map((file, index) => {
      const prefix = index === 0 && file.includes('utilities.js') 
        ? '    // utilities.js loads first as other scripts may depend on it\n    '
        : '    ';
      return prefix + `'${file}'`;
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

/**
 * Generate JS loader HTML
 */
function generateJSLoader(jsFiles) {
  const filesList = jsFiles
    .map((file, index) => {
      const prefix = index === 0 && file.includes('utilities.js') 
        ? '    // utilities.js loads first as other scripts may depend on it\n    '
        : '    ';
      return prefix + `'${file}'`;
    })
    .join(',\n');
  
  return `<!-- 
  Global JavaScript Loader for Squarespace
  Load all JavaScript files from GitHub Pages
  
  Usage in Squarespace:
  1. Go to Settings > Advanced > Code Injection
  2. Paste this ENTIRE content into the Footer section (or Header)
  3. Update BASE_URL if your GitHub Pages domain is different
  
  Note: utilities.js loads first as other scripts may depend on it
  Note: This file is auto-generated. Run 'node scripts/generate-loaders.js' to regenerate.
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
</script>
  `;
}

/**
 * Generate test files with current CSS and JS file lists
 */
function updateTestFiles(cssFiles, jsFiles) {
  const TEST_DIR = path.join(__dirname, '..', 'test');
  
  // Ensure test directory exists
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  // Generate CSS files list for test
  const cssFilesList = cssFiles
    .map(file => `        '${file}'`)
    .join(',\n');
  
  // Generate JS files list for test
  const jsFilesList = jsFiles
    .map(file => `        '${file}'`)
    .join(',\n');
  
  // Template for test index-auto.html
  const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Test - Local Development (Auto-Load)</title>
  
  <!-- Local CSS Loader -->
  <script>
    (function() {
      'use strict';
      
      const BASE_URL = '..'; // Parent directory for local paths
      const CSS_FILES = [
` + cssFilesList + `
      ];
      
      function loadCSS(href) {
        const existing = document.querySelector(\`link[href*="\${href}"]\`);
        if (existing) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = BASE_URL + href;
        document.head.appendChild(link);
      }
      
      CSS_FILES.forEach(function(file) {
        loadCSS(file);
      });
    })();
  </script>
  
  <!-- Local JS Loader -->
  <script>
    (function() {
      'use strict';
      
      const BASE_URL = '..'; // Parent directory for local paths
      const JS_FILES = [
` + jsFilesList + `
      ];
      
      function loadJS(src, callback) {
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
      
      let index = 0;
      function loadNext() {
        if (index >= JS_FILES.length) return;
        
        loadJS(JS_FILES[index], function() {
          index++;
          loadNext();
        });
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNext);
      } else {
        loadNext();
      }
    })();
  </script>
  
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      font-family: system-ui, -apple-system, "Segoe UI", Inter, Roboto, Arial, sans-serif;
      background: #f5f5f5;
    }
    .test-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .component-section {
      background: white;
      border-radius: 8px;
      padding: 40px;
      margin-bottom: 60px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .component-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .component-info {
      font-size: 14px;
      color: #666;
      margin-bottom: 30px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="test-container">
    <h1 style="text-align: center; margin-bottom: 40px;">Component Test Page</h1>
    <p class="loading" id="loading">Loading components...</p>
  </div>
  
  <!-- Auto-load all components from registry -->
  <script src="components.js"></script>
  <script>
    // Hide loading message once components start loading
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
    }, 500);
  </script>
</body>
</html>`;

  // Write test file
  const testPath = path.join(TEST_DIR, 'index-auto.html');
  fs.writeFileSync(testPath, testHtml, 'utf8');
  console.log(`✅ Updated: ${testPath}`);
  
  // Also update index.html if it exists (keep manual test file as-is or update CSS/JS lists)
  const indexHtmlPath = path.join(TEST_DIR, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Update CSS files list
    const cssRegex = /const CSS_FILES = \[[\s\S]*?\];/;
    const newCssList = 'const CSS_FILES = [\n' + cssFilesList + '\n      ];';
    indexHtml = indexHtml.replace(cssRegex, newCssList);
    
    // Update JS files list
    const jsRegex = /const JS_FILES = \[[\s\S]*?\];/;
    const newJsList = 'const JS_FILES = [\n' + jsFilesList + '\n      ];';
    indexHtml = indexHtml.replace(jsRegex, newJsList);
    
    fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
    console.log(`✅ Updated: ${indexHtmlPath}`);
  }
}

/**
 * Generate component syntax reference for easy copy-paste
 */
function generateComponentSyntaxReference(components) {
  const HTML_DIR = path.join(__dirname, '..', 'html');
  
  // Deduplicate components - prefer -loader versions when both exist
  const componentMap = new Map();
  components.forEach(comp => {
    const baseName = comp.filename.replace('-loader.html', '').replace('.html', '');
    
    if (!componentMap.has(baseName)) {
      componentMap.set(baseName, comp);
    } else {
      // Prefer -loader version if it exists
      const existing = componentMap.get(baseName);
      if (comp.filename.includes('-loader') && !existing.filename.includes('-loader')) {
        componentMap.set(baseName, comp);
      }
    }
  });
  
  // Convert back to array and sort
  const uniqueComponents = Array.from(componentMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Generate Markdown reference
  let md = `# Component Syntax Reference

> Auto-generated component syntax guide  
> Last updated: ${new Date().toLocaleString()}

Quick reference for using components in Squarespace Code Blocks.

## Component Loader Syntax

All components use the same simple syntax with the \`data-component\` attribute:

\`\`\`html
<div data-component="COMPONENT-NAME"></div>
\`\`\`

---

## Available Components

`;
  
  uniqueComponents.forEach((comp, index) => {
    // Extract component name from filename (remove -loader and .html)
    const componentKey = comp.filename.replace('-loader.html', '').replace('.html', '');
    
    md += `### ${comp.name}\n\n`;
    md += `**Description:** ${comp.description}\n\n`;
    md += `**Syntax:**\n\n`;
    md += `\`\`\`html\n<div data-component="${componentKey}"></div>\n\`\`\`\n\n`;
    md += `**Copy this code:**\n\n`;
    md += `\`\`\`\n<div data-component="${componentKey}"></div>\n\`\`\`\n\n`;
    md += `---\n\n`;
  });
  
  md += `## Quick Copy-Paste List\n\n`;
  md += `### All Components at Once:\n\n\`\`\`html\n`;
  
  uniqueComponents.forEach(comp => {
    const componentKey = comp.filename.replace('-loader.html', '').replace('.html', '');
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
  
  const mdPath = path.join(HTML_DIR, 'COMPONENT-SYNTAX.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`✅ Generated: ${mdPath}`);
  
  // Also generate a simple text file for easy copy-paste
  let txt = `COMPONENT SYNTAX REFERENCE\n`;
  txt += `Generated: ${new Date().toLocaleString()}\n\n`;
  txt += `COPY-PASTE READY SYNTAX:\n`;
  txt += `========================\n\n`;
  
  uniqueComponents.forEach(comp => {
    const componentKey = comp.filename.replace('-loader.html', '').replace('.html', '');
    txt += `${comp.name}:\n<div data-component="${componentKey}"></div>\n\n`;
  });
  
  const txtPath = path.join(HTML_DIR, 'COMPONENT-SYNTAX.txt');
  fs.writeFileSync(txtPath, txt, 'utf8');
  console.log(`✅ Generated: ${txtPath}`);
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning directories...');
  
  const cssFiles = getCSSFiles();
  const jsFiles = getJSFiles();
  const htmlComponents = getHTMLComponents();
  
  console.log(`📦 Found ${cssFiles.length} CSS files:`);
  cssFiles.forEach(file => console.log(`   ${file}`));
  
  console.log(`📦 Found ${jsFiles.length} JavaScript files:`);
  jsFiles.forEach(file => console.log(`   ${file}`));
  
  console.log(`📦 Found ${htmlComponents.length} HTML components:`);
  htmlComponents.forEach(comp => console.log(`   ${comp.name} (${comp.filename})`));
  
  console.log('\n📝 Generating loader files...');
  
  // Generate CSS loader
  const cssLoader = generateCSSLoader(cssFiles);
  const cssLoaderPath = path.join(HTML_DIR, 'global-css-loader.html');
  fs.writeFileSync(cssLoaderPath, cssLoader, 'utf8');
  console.log(`✅ Generated: ${cssLoaderPath}`);
  
  // Generate JS loader
  const jsLoader = generateJSLoader(jsFiles);
  const jsLoaderPath = path.join(HTML_DIR, 'global-js-loader.html');
  fs.writeFileSync(jsLoaderPath, jsLoader, 'utf8');
  console.log(`✅ Generated: ${jsLoaderPath}`);
  
  // Generate standalone .js loader files (for direct linking)
  console.log('\n📦 Generating standalone loader files...');
  
  const cssLoaderJS = generateCSSLoaderJS(cssFiles);
  const cssLoaderJSPath = path.join(JS_DIR, 'global-css-loader.js');
  fs.writeFileSync(cssLoaderJSPath, cssLoaderJS, 'utf8');
  console.log(`✅ Generated: ${cssLoaderJSPath}`);
  
  const jsLoaderJS = generateJSLoaderJS(jsFiles);
  const jsLoaderJSPath = path.join(JS_DIR, 'global-js-loader.js');
  fs.writeFileSync(jsLoaderJSPath, jsLoaderJS, 'utf8');
  console.log(`✅ Generated: ${jsLoaderJSPath}`);
  
  // Generate component registry
  if (htmlComponents.length > 0) {
    console.log('\n📋 Generating component registry...');
    
    // Generate JSON registry
    const registryJson = generateComponentRegistry(htmlComponents);
    const registryJsonPath = path.join(HTML_DIR, 'components-registry.json');
    fs.writeFileSync(registryJsonPath, registryJson, 'utf8');
    console.log(`✅ Generated: ${registryJsonPath}`);
    
    // Generate Markdown registry
    const registryMd = generateComponentRegistryMarkdown(htmlComponents);
    const registryMdPath = path.join(HTML_DIR, 'components-registry.md');
    fs.writeFileSync(registryMdPath, registryMd, 'utf8');
    console.log(`✅ Generated: ${registryMdPath}`);
  } else {
    console.log('\n⚠️  No HTML components found. Skipping registry generation.');
  }
  
  // Generate/update test files
  console.log('\n🧪 Updating test files...');
  updateTestFiles(cssFiles, jsFiles);
  
  // Generate component syntax reference
  if (htmlComponents.length > 0) {
    console.log('\n📚 Generating component syntax reference...');
    generateComponentSyntaxReference(htmlComponents);
  }
  
  console.log('\n✨ Done! All files have been updated.');
  console.log('💡 Remember to copy the new loader content to Squarespace Code Injection if needed.');
}

// Run the script
main();

