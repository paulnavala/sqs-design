#!/usr/bin/env node
/**
 * Codebase Reorganization Script
 * 
 * Reorganizes the codebase into a cleaner, more maintainable structure
 */

const fs = require('fs');
const path = require('path');

const moves = [];

// Component files
const components = {
  'fortune-peach': {
    css: 'css/fortune-peach.css',
    js: 'js/fortune-peach.js',
    html: 'html/fortune-peach-loader.html'
  },
  'twin-gallery': {
    css: 'css/twin-gallery.css',
    js: 'js/twin-gallery.js',
    html: 'html/twin-gallery-loader.html'
  },
  'portfolio-uiux': {
    css: 'css/portfolio-uiux.css',
    js: 'js/portfolio.js',
    html: 'html/portfolio-uiux-loader.html'
  }
};

// Core files (shared/utilities)
const coreFiles = [
  { from: 'js/utilities.js', to: 'core/utilities.js' },
  { from: 'js/component-loader.js', to: 'core/component-loader.js' },
  { from: 'css/header.css', to: 'core/header.css' },
  { from: 'css/mobile-menu.css', to: 'core/mobile-menu.css' },
  { from: 'js/mobile-menu.js', to: 'core/mobile-menu.js' },
  { from: 'css/elegant-footer.css', to: 'core/elegant-footer.css' },
  { from: 'js/elegant-footer.js', to: 'core/elegant-footer.js' },
  { from: 'css/project-cards.css', to: 'core/project-cards.css' },
  { from: 'js/project-card.js', to: 'core/project-card.js' },
  { from: 'css/prototype-showcase.css', to: 'core/prototype-showcase.css' },
  { from: 'js/prototype-showcase.js', to: 'core/prototype-showcase.js' },
  { from: 'css/tagline.css', to: 'core/tagline.css' },
  { from: 'js/tagline.js', to: 'core/tagline.js' },
  { from: 'css/portfolio.css', to: 'core/portfolio.css' } // Legacy portfolio.css
];

// Generated loader files
const loaderFiles = [
  { from: 'html/global-css-loader.html', to: 'loaders/global-css-loader.html' },
  { from: 'html/global-js-loader.html', to: 'loaders/global-js-loader.html' },
  { from: 'js/global-css-loader.js', to: 'loaders/global-css-loader.js' },
  { from: 'js/global-js-loader.js', to: 'loaders/global-js-loader.js' },
  { from: 'html/components-registry.json', to: 'loaders/components-registry.json' },
  { from: 'html/components-registry.md', to: 'loaders/components-registry.md' },
  { from: 'html/COMPONENT-SYNTAX.md', to: 'loaders/COMPONENT-SYNTAX.md' },
  { from: 'html/COMPONENT-SYNTAX.txt', to: 'loaders/COMPONENT-SYNTAX.txt' },
  { from: 'html/portfolio-projects-data.html', to: 'loaders/portfolio-projects-data.html' }
];

// Documentation files
const docFiles = [
  { from: 'COMPONENTS.md', to: 'docs/components-overview.md' },
  { from: 'html/SQUARESPACE-SETUP.md', to: 'docs/guides/squarespace-setup.md' },
  { from: 'html/COMPONENT-LOADER-USAGE.md', to: 'docs/guides/component-loader-usage.md' },
  { from: 'html/LOADER-ORDER.md', to: 'docs/guides/loader-order.md' },
  { from: 'html/PORTFOLIO-GUIDE.md', to: 'docs/components/portfolio/html-guide.md' },
  { from: 'html/PORTFOLIO-ENTRY-TEMPLATE.html', to: 'docs/components/portfolio/entry-template.html' },
  { from: 'html/PORTFOLIO-QUICK-REFERENCE.txt', to: 'docs/components/portfolio/quick-reference.txt' },
  { from: 'data/PORTFOLIO-DATA-GUIDE.md', to: 'docs/components/portfolio/data-guide.md' },
  { from: 'PORTFOLIO-MAINTAINABILITY.md', to: 'docs/components/portfolio/maintainability.md' },
  { from: 'PORTFOLIO-WORKFLOW.md', to: 'docs/components/portfolio/workflow.md' },
  { from: 'data/README.md', to: 'docs/components/portfolio/data-readme.md' },
  { from: 'html/README.md', to: 'docs/guides/html-components-readme.md' },
  { from: 'scripts/README.md', to: 'docs/scripts-readme.md' },
  { from: 'test/README.md', to: 'docs/test-readme.md' }
];

function moveFile(from, to) {
  const fromPath = path.join(__dirname, '..', from);
  const toPath = path.join(__dirname, '..', to);
  
  if (!fs.existsSync(fromPath)) {
    console.warn(`⚠️  File not found: ${from}`);
    return false;
  }
  
  // Create directory if needed
  const toDir = path.dirname(toPath);
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }
  
  // Move file
  fs.renameSync(fromPath, toPath);
  moves.push({ from, to });
  return true;
}

function main() {
  console.log('🔄 Starting codebase reorganization...\n');
  
  // Move component files
  console.log('📦 Moving component files...');
  Object.keys(components).forEach(componentName => {
    const component = components[componentName];
    const componentDir = path.join('components', componentName);
    
    // Create component directory
    const dirPath = path.join(__dirname, '..', componentDir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Move files
    if (component.css) {
      const to = path.join(componentDir, path.basename(component.css));
      moveFile(component.css, to);
    }
    if (component.js) {
      const to = path.join(componentDir, path.basename(component.js));
      moveFile(component.js, to);
    }
    if (component.html) {
      const to = path.join(componentDir, path.basename(component.html));
      moveFile(component.html, to);
    }
  });
  
  // Move core files
  console.log('🔧 Moving core files...');
  coreFiles.forEach(({ from, to }) => {
    moveFile(from, to);
  });
  
  // Move loader files
  console.log('📥 Moving loader files...');
  loaderFiles.forEach(({ from, to }) => {
    moveFile(from, to);
  });
  
  // Move documentation
  console.log('📚 Moving documentation...');
  docFiles.forEach(({ from, to }) => {
    moveFile(from, to);
  });
  
  console.log('\n✅ File reorganization complete!');
  console.log(`   Moved ${moves.length} files\n`);
  
  console.log('⚠️  Next steps:');
  console.log('1. Update script paths in scripts/generate-loaders.js');
  console.log('2. Update test file paths');
  console.log('3. Update all file references');
  console.log('4. Run npm run generate-loaders to test');
}

main();

