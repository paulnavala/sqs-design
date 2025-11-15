#!/usr/bin/env node
/**
 * Optimize photography assets into small/medium/large WebP variants.
 *
 * Input dir: assets/photography/originals/
 * Processes all image files (including -after/-before format and standalone images).
 * Outputs:
 *   <name>-sm.webp  (max width  640)
 *   <name>-md.webp  (max width 1200)
 *   <name>-lg.webp  (max width 1920)
 *
 * Skips regeneration if the output is newer than the source.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const BASE_DIR = path.join(ROOT, 'assets', 'photography');
const ORIG_DIR = fs.existsSync(path.join(BASE_DIR, 'originals'))
  ? path.join(BASE_DIR, 'originals')
  : BASE_DIR;
const VAR_DIR = path.join(BASE_DIR, 'variants');
const SIZES = [
  { suffix: '-sm', width: 640, quality: 78 },
  { suffix: '-md', width: 1200, quality: 80 },
  { suffix: '-lg', width: 1920, quality: 82 },
];
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function isVariant(file) {
  const ext = path.extname(file).toLowerCase();
  if (!VALID_EXT.has(ext)) return false;
  const base = path.basename(file, ext).toLowerCase();
  // ends with -sm / -md / -lg
  return /-(sm|md|lg)$/.test(base);
}

function baseFromVariant(file) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  return base.replace(/-(sm|md|lg)$/i, '');
}

function hasOriginal(dir, baseName) {
  for (const ext of VALID_EXT) {
    const candidate = path.join(dir, baseName + ext);
    if (fs.existsSync(candidate)) return true;
  }
  return false;
}

function cleanupOrphans() {
  if (!fs.existsSync(VAR_DIR)) return;
  const files = fs.readdirSync(VAR_DIR);
  files.forEach((f) => {
    if (!isVariant(f)) return;
    const baseName = baseFromVariant(f);
    if (!hasOriginal(ORIG_DIR, baseName) && !hasOriginal(BASE_DIR, baseName)) {
      try {
        fs.unlinkSync(path.join(VAR_DIR, f));
        console.log('deleted orphan:', path.relative(ROOT, path.join(VAR_DIR, f)));
      } catch (e) {
        console.warn('failed to delete orphan:', f, e.message);
      }
    }
  });
}

function isCandidate(file) {
  const ext = path.extname(file).toLowerCase();
  if (!VALID_EXT.has(ext)) return false;
  const base = path.basename(file, ext).toLowerCase();
  // Exclude already sized variants (-sm, -md, -lg)
  if (/(?:-|_)(sm|md|lg)$/.test(base)) return false;
  // Include all valid image files (both -after/-before format and standalone images)
  return true;
}

function mtime(file) {
  try {
    return fs.statSync(file).mtimeMs || 0;
  } catch {
    return 0;
  }
}

async function processOne(srcPath) {
  const dir = path.dirname(srcPath);
  const ext = path.extname(srcPath);
  const base = path.basename(srcPath, ext);

  const srcTime = mtime(srcPath);
  const buf = fs.readFileSync(srcPath);
  const img = sharp(buf, { limitInputPixels: false }).rotate();
  const meta = await img.metadata();

  if (!fs.existsSync(VAR_DIR)) fs.mkdirSync(VAR_DIR, { recursive: true });

  for (const { suffix, width, quality } of SIZES) {
    const outPath = path.join(VAR_DIR, `${base}${suffix}.webp`);
    const outTime = mtime(outPath);
    if (outTime >= srcTime) {
      console.log('skip (fresh):', path.relative(ROOT, outPath));
      continue;
    }
    const targetWidth = Math.min(width, meta.width || width);
    await sharp(buf, { limitInputPixels: false })
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(outPath);
    console.log('wrote:', path.relative(ROOT, outPath));
  }
}

async function main() {
  if (!fs.existsSync(ORIG_DIR)) {
    console.error('Originals directory not found:', ORIG_DIR);
    process.exit(1);
  }
  // Remove variants whose originals are missing
  cleanupOrphans();
  const files = fs
    .readdirSync(ORIG_DIR)
    .filter((f) => isCandidate(f))
    .map((f) => path.join(ORIG_DIR, f));

  if (files.length === 0) {
    console.log('No source images found in', ORIG_DIR);
    return;
  }

  console.log(`Optimizing ${files.length} images…`);
  const concurrency = 4;
  let i = 0;
  async function next() {
    const idx = i++;
    if (idx >= files.length) return;
    const file = files[idx];
    try {
      await processOne(file);
    } catch (err) {
      console.warn('Failed:', path.relative(ROOT, file), err.message);
    }
    await next();
  }
  await Promise.all(Array.from({ length: concurrency }, () => next()));
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


