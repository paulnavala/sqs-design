# Auto-Update System Documentation

## Overview

This project uses an automated build system that keeps all loaders, documentation, and paths synchronized with your actual component files. **No manual path updates are needed** when components change.

## What Gets Auto-Updated

When you run `npm run generate-loaders`, the following files are **automatically regenerated**:

### ✅ Loader Files (for Squarespace)
- `loaders/global-css-loader.html` - CSS loader for Squarespace Header
- `loaders/global-js-loader.html` - JS loader for Squarespace Footer  
- `loaders/global-css-loader.js` - Standalone CSS loader (JS version)
- `loaders/global-js-loader.js` - Standalone JS loader (JS version)

**These contain:**
- Complete list of all CSS files (auto-scanned from `core/` and `components/`)
- Complete list of all JS files (auto-scanned from `core/` and `components/`)
- Correct load order (utilities.js first, component-loader.js second)
- All paths automatically constructed with BASE_URL

### ✅ Documentation Files
- `loaders/components-registry.json` - Component metadata (machine-readable)
- `loaders/components-registry.md` - Component list with descriptions (human-readable)
- `loaders/COMPONENT-SYNTAX.md` - Component usage syntax reference
- `loaders/COMPONENT-SYNTAX.txt` - Quick copy-paste reference
- `SQUARESPACE-PATHS.md` - Complete paths and linking guide

**These contain:**
- All current components (auto-discovered)
- All file paths (auto-generated)
- Usage examples (auto-generated)
- Syntax reference (auto-generated)

### ✅ Test Files
- `test/index.html` - Manual test page (file lists updated)
- `test/index-auto.html` - Auto-loading test page (file lists updated)

**These contain:**
- Complete CSS file list (auto-updated)
- Complete JS file list (auto-updated)
- Ready for local testing

## How It Works

### File Discovery
The `generate-loaders.js` script automatically:

1. **Scans `core/` directory** for CSS and JS files
2. **Scans `components/` directories** for component files
3. **Identifies HTML loaders** (`*-loader.html` files)
4. **Extracts metadata** from HTML comments (descriptions, etc.)
5. **Generates all output files** with current file lists

### Path Construction
All paths are constructed automatically:

```javascript
// CSS/JS files
BASE_URL + file_path
// Example: https://assets.peachless.design/core/utilities.js

// Component HTML files
BASE_URL + '/components/' + component-name + '/' + component-name + '-loader.html'
// Example: https://assets.peachless.design/components/fortune-peach/fortune-peach-loader.html
```

### Deduplication
The system automatically:
- ✅ Removes duplicate components (prefers `-loader` versions)
- ✅ Sorts files alphabetically
- ✅ Maintains correct load order (utilities.js first)

## When to Run

Run `npm run generate-loaders` when you:

✅ **Add a new component**
- New component folder with CSS/JS/HTML files
- Automatically discovered and added to all loaders

✅ **Remove a component**
- Delete component folder
- Automatically removed from all loaders and docs

✅ **Rename a component**
- Rename component folder
- Run generate-loaders to update all references

✅ **Change component file structure**
- Move files within components
- Paths automatically updated

✅ **Add/remove core files**
- Add new CSS/JS to `core/` directory
- Automatically included in loaders

✅ **Before committing changes**
- Ensures all generated files are up-to-date

## Build Integration

The generate-loaders command is integrated into the build process:

```bash
npm run build  # Runs: portfolio-build + generate-loaders
```

This ensures that:
1. Portfolio data is built first
2. Loaders are generated with current files
3. Everything stays in sync

## What Does NOT Auto-Update

These files require manual updates (if you change them):

⚠️ **Manual Updates Needed:**
- `scripts/generate-loaders.js` - BASE_URL configuration
- `core/component-loader.js` - BASE_URL configuration  
- `CNAME` file - GitHub Pages domain
- `package.json` - Scripts and dependencies
- Source component files (CSS, JS, HTML) - Your actual code

⚠️ **Note:** Documentation files in `docs/` directory may contain hardcoded paths. These are manually maintained documentation files.

## Verification

After running `npm run generate-loaders`, verify:

1. **Check console output** - Should show all discovered files
2. **Open loaders** - Verify file lists are complete
3. **Test locally** - Run `npm run serve` to test components
4. **Check documentation** - Open `SQUARESPACE-PATHS.md` to see current paths

## Best Practices

1. **Run before committing** - Keeps generated files in sync
2. **Run after component changes** - Ensures everything updates
3. **Commit generated files** - Makes it easy to see what changed
4. **Don't edit generated files** - They'll be overwritten
5. **Use git diff** - See what files changed after generation

## Troubleshooting

### Issue: Files not in loaders

**Solution:**
- Check file naming (must be `component-name.css`, `component-name.js`)
- Check file location (must be in `core/` or `components/[name]/`)
- Run `npm run generate-loaders` again

### Issue: Wrong paths in documentation

**Solution:**
- Check BASE_URL in `scripts/generate-loaders.js`
- Regenerate: `npm run generate-loaders`
- Documentation is auto-generated from actual file structure

### Issue: Components missing from registry

**Solution:**
- Ensure HTML file is named `*-loader.html`
- Check that HTML file is in `components/[name]/` folder
- Verify HTML has proper comments (for description extraction)

## Summary

✅ **All paths are auto-generated**  
✅ **All loaders auto-update**  
✅ **All documentation auto-updates**  
✅ **Just run `npm run generate-loaders`**  
✅ **Everything stays in sync automatically**

---

> 🔄 **Last Updated:** ${new Date().toLocaleString()}  
> 📝 **Maintained by:** `scripts/generate-loaders.js`

