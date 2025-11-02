#!/usr/bin/env node
/**
 * Portfolio Data Builder
 * 
 * Converts portfolio-projects.json to HTML data-list format used by the
 * portfolio component. Includes comprehensive validation to catch errors
 * before they reach production.
 * 
 * Features:
 * - Validates project data structure and types
 * - Checks for duplicate IDs
 * - Validates URLs, colors, and date formats
 * - Generates HTML from validated JSON
 * - Updates component HTML file automatically
 * 
 * Usage:
 *   node scripts/build-portfolio-data.js              # Validate and build
 *   node scripts/build-portfolio-data.js --validate-only  # Validate only
 *   npm run portfolio-build                            # Build
 *   npm run portfolio-validate                         # Validate only
 * 
 * Input:
 *   data/portfolio-projects.json - Source data file
 * 
 * Output:
 *   components/portfolio-uiux/portfolio-uiux-loader.html - Updated HTML
 *   loaders/portfolio-projects-data.html - Standalone data HTML
 * 
 * @module build-portfolio-data
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

/** Path to portfolio projects JSON file */
const JSON_FILE = path.join(__dirname, '../data/portfolio-projects.json');

/** Path to portfolio component HTML file (will be updated) */
const HTML_FILE = path.join(__dirname, '../components/portfolio-uiux/portfolio-uiux-loader.html');

/** Path for standalone generated data HTML */
const OUTPUT_FILE = path.join(__dirname, '../loaders/portfolio-projects-data.html');

/** Fields required for every project */
const REQUIRED_FIELDS = ['id', 'title', 'figma'];

// ============================================================================
// Validation State
// ============================================================================

/** Accumulated validation errors (blocking) */
const errors = [];

/** Accumulated validation warnings (non-blocking) */
const warnings = [];

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a single project object
 * 
 * Checks:
 * - Required fields are present
 * - Field types are correct
 * - Format constraints (IDs, URLs, colors, dates)
 * - Duplicate IDs across all projects
 * 
 * @param {Object} project - Project object to validate
 * @param {number} index - Index in projects array (for error messages)
 * @returns {boolean} True if project is valid (no errors)
 */
function validateProject(project, index) {
  const projectErrors = [];
  const projectWarnings = [];
  
  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!project[field] || project[field].toString().trim() === '') {
      projectErrors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate field types
  if (project.id && typeof project.id !== 'string') {
    projectErrors.push(`Field 'id' must be a string`);
  }
  
  // Validate ID format (should be lowercase, alphanumeric with hyphens)
  if (project.id && !/^[a-z0-9-]+$/.test(project.id)) {
    projectWarnings.push(`ID '${project.id}' should be lowercase, alphanumeric with hyphens only`);
  }
  
  // Validate Figma URL format
  if (project.figma && !project.figma.startsWith('http')) {
    projectWarnings.push(`Figma URL should be a full URL starting with http/https`);
  }
  
  // Validate year (reasonable range)
  if (project.year && (typeof project.year !== 'number' || project.year < 2000 || project.year > 2100)) {
    projectWarnings.push(`Year should be a valid number between 2000-2100`);
  }
  
  // Validate accent color format (hex code)
  if (project.accent && project.accent !== '' && !/^#[0-9A-Fa-f]{6}$/.test(project.accent)) {
    projectWarnings.push(`Accent color '${project.accent}' should be a valid hex color (e.g., #D29A84)`);
  }
  
  // Check for duplicate IDs across all projects
  const data = require(JSON_FILE);
  if (data.projects && Array.isArray(data.projects)) {
    const duplicateCount = data.projects.filter(p => p.id === project.id).length;
    if (duplicateCount > 1) {
      projectErrors.push(`Duplicate ID: '${project.id}' is used ${duplicateCount} times`);
    }
  }
  
  // Collect errors and warnings
  if (projectErrors.length > 0) {
    errors.push(`Project #${index + 1} (${project.id || 'unnamed'}): ${projectErrors.join(', ')}`);
  }
  
  if (projectWarnings.length > 0) {
    warnings.push(`Project #${index + 1} (${project.id || 'unnamed'}): ${projectWarnings.join(', ')}`);
  }
  
  return projectErrors.length === 0;
}

/**
 * Validate entire portfolio data file
 * 
 * Performs:
 * - File existence check
 * - JSON parsing validation
 * - Schema validation (projects array)
 * - Individual project validation
 * 
 * @returns {boolean} True if all validation passes
 */
function validateAll() {
  // Check file exists
  if (!fs.existsSync(JSON_FILE)) {
    errors.push(`JSON file not found: ${JSON_FILE}`);
    return false;
  }
  
  // Parse JSON
  let data;
  try {
    const content = fs.readFileSync(JSON_FILE, 'utf8');
    data = JSON.parse(content);
  } catch (err) {
    errors.push(`Failed to parse JSON: ${err.message}`);
    return false;
  }
  
  // Validate structure
  if (!Array.isArray(data.projects)) {
    errors.push(`JSON must have a 'projects' array`);
    return false;
  }
  
  // Warn if empty
  if (data.projects.length === 0) {
    warnings.push('No projects found in data file');
  }
  
  // Validate each project
  data.projects.forEach((project, index) => {
    validateProject(project, index);
  });
  
  return errors.length === 0;
}

// ============================================================================
// HTML Generation Functions
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate HTML list from projects array
 * 
 * Creates <li> elements with data attributes matching the format
 * expected by portfolio.js.
 * 
 * @param {Array<Object>} projects - Array of project objects
 * @returns {string} HTML string
 */
function generateHtmlList(projects) {
  const items = projects.map(project => {
    const parts = [];
    
    // Required fields (always included)
    parts.push(`      data-id="${escapeHtml(project.id)}"`);
    parts.push(`      data-title="${escapeHtml(project.title)}"`);
    
    // Optional fields (only if present)
    if (project.description) {
      parts.push(`      data-description="${escapeHtml(project.description)}"`);
    }
    
    if (project.figma) {
      parts.push(`      data-figma="${escapeHtml(project.figma)}"`);
    }
    
    if (project.case) {
      parts.push(`      data-case="${escapeHtml(project.case)}"`);
    }
    
    // Badges: convert array to pipe-separated string
    if (project.badges && Array.isArray(project.badges) && project.badges.length > 0) {
      parts.push(`      data-badges="${escapeHtml(project.badges.join('|'))}"`);
    }
    
    // Categories: convert array to pipe-separated string
    if (project.categories && Array.isArray(project.categories) && project.categories.length > 0) {
      parts.push(`      data-categories="${escapeHtml(project.categories.join('|'))}"`);
    }
    
    if (project.year) {
      parts.push(`      data-year="${escapeHtml(project.year)}"`);
    }
    
    // Accent: include even if empty (for default color override)
    if (project.accent !== undefined && project.accent !== null) {
      parts.push(`      data-accent="${escapeHtml(project.accent)}"`);
    }
    
    return `    <li\n${parts.join('\n')}\n    ></li>`;
  });
  
  return `  <ul id="projects-data" hidden>
${items.join('\n\n')}
  </ul>`;
}

/**
 * Update portfolio component HTML file with new project data
 * 
 * Finds the <ul id="projects-data"> section and replaces it with
 * newly generated HTML from JSON data.
 * 
 * @param {string} htmlContent - Unused (kept for compatibility)
 * @returns {boolean} True if update successful
 */
function updateHtmlFile(htmlContent) {
  // Check HTML file exists
  if (!fs.existsSync(HTML_FILE)) {
    console.warn(`⚠️  HTML file not found: ${HTML_FILE}`);
    return false;
  }
  
  // Read current HTML
  let content = fs.readFileSync(HTML_FILE, 'utf8');
  
  // Find projects-data section
  const startMarker = '  <ul id="projects-data" hidden>';
  const endMarker = '  </ul>';
  
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn(`⚠️  Could not find projects-data section in HTML file`);
    return false;
  }
  
  // Find closing tag
  let endIndex = content.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) {
    console.warn(`⚠️  Could not find closing tag for projects-data section`);
    return false;
  }
  endIndex += endMarker.length;
  
  // Generate new HTML from JSON
  const data = require(JSON_FILE);
  const newHtmlList = generateHtmlList(data.projects);
  
  // Replace section
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  // Preserve any comments before the list
  const commentMatch = before.match(/(.*)(\n  <ul id="projects-data")/s);
  const newContent = commentMatch 
    ? before + '\n' + newHtmlList + after
    : before + newHtmlList + after;
  
  // Write updated content
  fs.writeFileSync(HTML_FILE, newContent, 'utf8');
  
  return true;
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Main function - orchestrates validation and build process
 */
function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');
  
  console.log('🔍 Validating portfolio data...\n');
  
  // Run validation
  const isValid = validateAll();
  
  // Display warnings (non-blocking)
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }
  
  // Display errors (blocking)
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(e => console.error(`   ${e}`));
    console.error('');
    console.error('Please fix these errors before building.');
    process.exit(1);
  }
  
  console.log('✅ All projects validated successfully!\n');
  
  // If validate-only mode, stop here
  if (validateOnly) {
    console.log('Validation complete. Use without --validate-only to rebuild HTML.');
    return;
  }
  
  // Build HTML
  console.log('🔨 Building HTML from JSON data...\n');
  
  const updated = updateHtmlFile();
  
  if (updated) {
    console.log('✅ Successfully updated HTML file with latest project data.');
    console.log(`   Updated: ${HTML_FILE}`);
  } else {
    console.error('❌ Failed to update HTML file.');
    process.exit(1);
  }
  
  // Also generate standalone data file
  const data = require(JSON_FILE);
  const standaloneHtml = generateHtmlList(data.projects);
  fs.writeFileSync(OUTPUT_FILE, standaloneHtml + '\n', 'utf8');
  console.log(`   Also generated: ${OUTPUT_FILE}`);
  
  console.log('\n✨ Done!');
}

// Run main function
main();
