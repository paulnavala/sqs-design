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
 */
function getJSFiles() {
  if (!fs.existsSync(JS_DIR)) {
    console.warn('Warning: js/ directory not found');
    return [];
  }
  
  const files = fs.readdirSync(JS_DIR)
    .filter(file => file.endsWith('.js'))
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
  
  console.log('\n✨ Done! All files have been updated.');
  console.log('💡 Remember to copy the new loader content to Squarespace Code Injection if needed.');
}

// Run the script
main();

