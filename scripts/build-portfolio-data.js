#!/usr/bin/env node
/**
 * Portfolio Data Builder
 * 
 * Converts portfolio-projects.json to HTML data-list format
 * and optionally validates the data structure.
 * 
 * Usage:
 *   node scripts/build-portfolio-data.js [--validate-only]
 * 
 * Options:
 *   --validate-only    Only validate, don't rebuild HTML
 */

const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '../data/portfolio-projects.json');
const HTML_FILE = path.join(__dirname, '../html/portfolio-uiux-loader.html');
const OUTPUT_FILE = path.join(__dirname, '../html/portfolio-projects-data.html');

// Required fields
const REQUIRED_FIELDS = ['id', 'title', 'figma'];

// Validation errors
const errors = [];
const warnings = [];

function validateProject(project, index) {
  const projectErrors = [];
  const projectWarnings = [];
  
  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!project[field] || project[field].toString().trim() === '') {
      projectErrors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate field types and formats
  if (project.id && typeof project.id !== 'string') {
    projectErrors.push(`Field 'id' must be a string`);
  }
  
  if (project.id && !/^[a-z0-9-]+$/.test(project.id)) {
    projectWarnings.push(`ID '${project.id}' should be lowercase, alphanumeric with hyphens only`);
  }
  
  if (project.figma && !project.figma.startsWith('http')) {
    projectWarnings.push(`Figma URL should be a full URL starting with http/https`);
  }
  
  if (project.year && (typeof project.year !== 'number' || project.year < 2000 || project.year > 2100)) {
    projectWarnings.push(`Year should be a valid number between 2000-2100`);
  }
  
  if (project.accent && project.accent !== '' && !/^#[0-9A-Fa-f]{6}$/.test(project.accent)) {
    projectWarnings.push(`Accent color '${project.accent}' should be a valid hex color (e.g., #D29A84)`);
  }
  
  // Check for duplicate IDs
  const projects = require(JSON_FILE).projects;
  const duplicateCount = projects.filter(p => p.id === project.id).length;
  if (duplicateCount > 1) {
    projectErrors.push(`Duplicate ID: '${project.id}' is used ${duplicateCount} times`);
  }
  
  if (projectErrors.length > 0) {
    errors.push(`Project #${index + 1} (${project.id || 'unnamed'}): ${projectErrors.join(', ')}`);
  }
  
  if (projectWarnings.length > 0) {
    warnings.push(`Project #${index + 1} (${project.id || 'unnamed'}): ${projectWarnings.join(', ')}`);
  }
  
  return projectErrors.length === 0;
}

function validateAll() {
  if (!fs.existsSync(JSON_FILE)) {
    errors.push(`JSON file not found: ${JSON_FILE}`);
    return false;
  }
  
  let data;
  try {
    const content = fs.readFileSync(JSON_FILE, 'utf8');
    data = JSON.parse(content);
  } catch (err) {
    errors.push(`Failed to parse JSON: ${err.message}`);
    return false;
  }
  
  if (!Array.isArray(data.projects)) {
    errors.push(`JSON must have a 'projects' array`);
    return false;
  }
  
  if (data.projects.length === 0) {
    warnings.push('No projects found in data file');
  }
  
  // Validate each project
  data.projects.forEach((project, index) => {
    validateProject(project, index);
  });
  
  return errors.length === 0;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateHtmlList(projects) {
  const items = projects.map(project => {
    const parts = [];
    
    // Required fields
    parts.push(`      data-id="${escapeHtml(project.id)}"`);
    parts.push(`      data-title="${escapeHtml(project.title)}"`);
    
    // Optional fields
    if (project.description) {
      parts.push(`      data-description="${escapeHtml(project.description)}"`);
    }
    
    if (project.figma) {
      parts.push(`      data-figma="${escapeHtml(project.figma)}"`);
    }
    
    if (project.case) {
      parts.push(`      data-case="${escapeHtml(project.case)}"`);
    }
    
    if (project.badges && Array.isArray(project.badges) && project.badges.length > 0) {
      parts.push(`      data-badges="${escapeHtml(project.badges.join('|'))}"`);
    }
    
    if (project.categories && Array.isArray(project.categories) && project.categories.length > 0) {
      parts.push(`      data-categories="${escapeHtml(project.categories.join('|'))}"`);
    }
    
    if (project.year) {
      parts.push(`      data-year="${escapeHtml(project.year)}"`);
    }
    
    if (project.accent !== undefined && project.accent !== null) {
      parts.push(`      data-accent="${escapeHtml(project.accent)}"`);
    }
    
    return `    <li\n${parts.join('\n')}\n    ></li>`;
  });
  
  return `  <ul id="projects-data" hidden>
${items.join('\n\n')}
  </ul>`;
}

function updateHtmlFile(htmlContent) {
  if (!fs.existsSync(HTML_FILE)) {
    console.warn(`⚠️  HTML file not found: ${HTML_FILE}`);
    return false;
  }
  
  let content = fs.readFileSync(HTML_FILE, 'utf8');
  
  // Find the projects-data section
  const startMarker = '  <ul id="projects-data" hidden>';
  const endMarker = '  </ul>';
  
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn(`⚠️  Could not find projects-data section in HTML file`);
    return false;
  }
  
  // Find the closing tag
  let endIndex = content.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) {
    console.warn(`⚠️  Could not find closing tag for projects-data section`);
    return false;
  }
  endIndex += endMarker.length;
  
  // Extract the new HTML from the generated content
  const data = require(JSON_FILE);
  const newHtmlList = generateHtmlList(data.projects);
  
  // Replace the section
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  // Preserve comments before the list
  const commentMatch = before.match(/(.*)(\n  <ul id="projects-data")/s);
  if (commentMatch) {
    const newContent = before + '\n' + newHtmlList + after;
    fs.writeFileSync(HTML_FILE, newContent, 'utf8');
  } else {
    const newContent = before + newHtmlList + after;
    fs.writeFileSync(HTML_FILE, newContent, 'utf8');
  }
  
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');
  
  console.log('🔍 Validating portfolio data...\n');
  
  const isValid = validateAll();
  
  // Print warnings
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }
  
  // Print errors
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(e => console.error(`   ${e}`));
    console.error('');
    console.error('Please fix these errors before building.');
    process.exit(1);
  }
  
  console.log('✅ All projects validated successfully!\n');
  
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
  
  // Also write standalone data file
  const data = require(JSON_FILE);
  const standaloneHtml = generateHtmlList(data.projects);
  fs.writeFileSync(OUTPUT_FILE, standaloneHtml + '\n', 'utf8');
  console.log(`   Also generated: ${OUTPUT_FILE}`);
  
  console.log('\n✨ Done!');
}

main();

