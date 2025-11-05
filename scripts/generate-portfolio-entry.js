#!/usr/bin/env node
/**
 * Portfolio Entry Generator
 * Interactive CLI tool to generate portfolio entry HTML
 *
 * Usage: node scripts/generate-portfolio-entry.js
 */

const readline = require('readline');

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

function generateEntry(data) {
  const parts = [];

  // Always include id and title
  parts.push(`  data-id="${data.id || 'project-' + Date.now()}"`);
  parts.push(`  data-title="${data.title || 'Untitled Project'}"`);

  // Optional fields
  if (data.description) {
    parts.push(`  data-description="${data.description.replace(/"/g, '&quot;')}"`);
  }

  if (data.figma) {
    parts.push(`  data-figma="${data.figma}"`);
  }

  if (data.case && data.case !== '#') {
    parts.push(`  data-case="${data.case}"`);
  }

  if (data.badges) {
    parts.push(`  data-badges="${data.badges}"`);
  }

  if (data.categories) {
    parts.push(`  data-categories="${data.categories}"`);
  }

  if (data.year) {
    parts.push(`  data-year="${data.year}"`);
  }

  if (data.accent) {
    parts.push(`  data-accent="${data.accent}"`);
  }

  return `<li\n${parts.join('\n')}\n></li>`;
}

async function main() {
  console.log('\n🎨 Portfolio Entry Generator\n');
  console.log('Press Enter to skip optional fields.\n');

  const data = {};

  // Required fields
  const title = await question('Project Title (required): ');
  if (!title.trim()) {
    console.log('❌ Title is required!');
    rl.close();
    return;
  }
  data.title = title.trim();
  data.id = slugify(title);

  // Optional fields
  const customId = await question(`Project ID (default: "${data.id}"): `);
  if (customId.trim()) {
    data.id = slugify(customId);
  }

  const description = await question('Description (optional): ');
  if (description.trim()) {
    data.description = description.trim();
  }

  const figma = await question('Figma Prototype URL (optional): ');
  if (figma.trim()) {
    data.figma = figma.trim();
  }

  const caseStudy = await question('Case Study URL (e.g., /projects/slug) (optional): ');
  if (caseStudy.trim()) {
    data.case = caseStudy.trim();
  }

  const badges = await question('Badges (separate with | or ,) (optional): ');
  if (badges.trim()) {
    data.badges = badges.trim();
  }

  const categories = await question('Categories for filtering (separate with | or ,) (optional): ');
  if (categories.trim()) {
    data.categories = categories.trim();
  }

  const year = await question(`Year (default: ${new Date().getFullYear()}) (optional): `);
  if (year.trim()) {
    data.year = year.trim();
  }

  const accent = await question('Accent Color (hex, e.g., #D29A84) (optional): ');
  if (accent.trim()) {
    data.accent = accent.trim();
  }

  console.log('\n' + '='.repeat(60));
  console.log('Generated Entry:');
  console.log('='.repeat(60) + '\n');
  console.log(generateEntry(data));
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Copy the entry above and paste it into the <ul id="projects-data"> section');
  console.log('   in your portfolio-uiux-loader.html file.\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
