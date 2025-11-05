#!/usr/bin/env node
/**
 * Add Portfolio Project
 *
 * Interactive tool to add a new project to portfolio-projects.json
 *
 * Usage: node scripts/add-portfolio-project.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const JSON_FILE = path.join(__dirname, '../data/portfolio-projects.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('\n🎨 Add New Portfolio Project\n');
  console.log('Press Enter to skip optional fields.\n');

  // Load existing data
  if (!fs.existsSync(JSON_FILE)) {
    console.error(`❌ Data file not found: ${JSON_FILE}`);
    console.error('   Please create it first with the correct structure.');
    rl.close();
    process.exit(1);
  }

  let data;
  try {
    const content = fs.readFileSync(JSON_FILE, 'utf8');
    data = JSON.parse(content);
  } catch (err) {
    console.error(`❌ Failed to read JSON file: ${err.message}`);
    rl.close();
    process.exit(1);
  }

  if (!data.projects || !Array.isArray(data.projects)) {
    console.error('❌ JSON file must have a "projects" array');
    rl.close();
    process.exit(1);
  }

  // Check for duplicate IDs
  const existingIds = data.projects.map((p) => p.id);

  const project = {};

  // Required fields
  const title = await question('Project Title (required): ');
  if (!title.trim()) {
    console.log('❌ Title is required!');
    rl.close();
    return;
  }
  project.title = title.trim();

  let id = slugify(title);
  const customId = await question(`Project ID (default: "${id}"): `);
  if (customId.trim()) {
    id = slugify(customId);
  }

  // Check for duplicates
  if (existingIds.includes(id)) {
    console.log(`⚠️  Warning: ID "${id}" already exists.`);
    const override = await question('Use a different ID? (y/n, default: yes): ');
    if (override.trim().toLowerCase() !== 'n') {
      let newId = id;
      let counter = 1;
      while (existingIds.includes(newId)) {
        newId = `${id}-${counter}`;
        counter++;
      }
      id = newId;
      console.log(`   Using ID: "${id}"`);
    }
  }
  project.id = id;

  // Optional fields
  const description = await question('Description (optional): ');
  if (description.trim()) {
    project.description = description.trim();
  }

  const figma = await question('Figma Prototype URL (optional but recommended): ');
  if (figma.trim()) {
    project.figma = figma.trim();
  } else {
    console.log('⚠️  Warning: Figma URL is recommended. You can add it later.');
  }

  const caseStudy = await question('Case Study URL (e.g., /projects/slug) (optional): ');
  if (caseStudy.trim()) {
    project.case = caseStudy.trim();
  }

  const badgesInput = await question('Badges (comma-separated) (optional): ');
  if (badgesInput.trim()) {
    project.badges = badgesInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
  }

  const categoriesInput = await question('Categories for filtering (comma-separated) (optional): ');
  if (categoriesInput.trim()) {
    project.categories = categoriesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }

  const year = await question(`Year (default: ${new Date().getFullYear()}) (optional): `);
  if (year.trim()) {
    const yearNum = parseInt(year.trim(), 10);
    if (!isNaN(yearNum)) {
      project.year = yearNum;
    }
  }

  const accent = await question('Accent Color (hex, e.g., #D29A84) (optional): ');
  if (accent.trim()) {
    project.accent = accent.trim();
  }

  // Add to projects array (prepend for newest first)
  data.projects.unshift(project);

  // Save JSON file
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(JSON_FILE, jsonContent + '\n', 'utf8');
    console.log('\n' + '='.repeat(60));
    console.log('✅ Project added successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Review the JSON file:', JSON_FILE);
    console.log('2. Run: npm run portfolio-build');
    console.log('3. Or run: npm run build (builds everything)\n');
  } catch (err) {
    console.error('\n❌ Failed to save JSON file:', err.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
