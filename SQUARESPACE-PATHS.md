# Squarespace File Paths & Linking Guide

**Auto-generated:** 02/11/2025, 23:31:26

> ⚠️ **This file is auto-generated.** Do not edit manually.  
> Run `npm run generate-loaders` to regenerate when components change.

## Overview

All files are loaded from GitHub Pages at `https://assets.peachless.design`. All paths and documentation are automatically kept in sync when components are added, removed, or renamed.

## Current Path Structure

### Base URL
```
https://assets.peachless.design
```

### File Paths

**Core CSS Files (7 files):**
```
/core/elegant-footer.css
/core/header.css
/core/mobile-menu.css
/core/portfolio.css
/core/project-cards.css
/core/prototype-showcase.css
/core/tagline.css
```

**Core JavaScript Files (7 files):**
```
/core/component-loader.js
/core/elegant-footer.js
/core/mobile-menu.js
/core/project-card.js
/core/prototype-showcase.js
/core/tagline.js
/core/utilities.js
```

**Component Files:**
```
/components/[component-name]/[component-name].css
/components/[component-name]/[component-name].js
/components/[component-name]/[component-name]-loader.html
```

**Current Components (3):**
```
/fortune-peach/fortune-peach.css
/fortune-peach/fortune-peach.js
/fortune-peach/fortune-peach-loader.html

/portfolio-uiux/portfolio-uiux.css
/portfolio-uiux/portfolio-uiux.js
/portfolio-uiux/portfolio-uiux-loader.html

/twin-gallery/twin-gallery.css
/twin-gallery/twin-gallery.js
/twin-gallery/twin-gallery-loader.html

```

**Complete File List:**

**Component CSS (3 files):**
```
/components/fortune-peach/fortune-peach.css
/components/portfolio-uiux/portfolio-uiux.css
/components/twin-gallery/twin-gallery.css
```

**Component JavaScript (3 files):**
```
/components/fortune-peach/fortune-peach.js
/components/portfolio-uiux/portfolio.js
/components/twin-gallery/twin-gallery.js
```

## How Squarespace Linking Works

### Method 1: Global Loaders (Recommended - Auto-Updated)

**Step 1: Add CSS Loader to Header**
- Go to Settings > Advanced > Code Injection
- Paste content from `loaders/global-css-loader.html` into **Header** section
- This loads ALL CSS files automatically (currently 10 files)

**Step 2: Add JS Loader to Footer**
- In the same Code Injection page
- Paste content from `loaders/global-js-loader.html` into **Footer** section
- This loads ALL JavaScript files automatically (currently 10 files)

**Step 3: Use Components**
- For HTML components, use the component loader:
  ```html
  <div data-component="COMPONENT-NAME"></div>
  ```
- See `loaders/COMPONENT-SYNTAX.md` for component names

**✅ Automatic Updates:** When you run `npm run generate-loaders`, the loaders are automatically updated with any new/removed components. Just copy the new loader content to Squarespace.

### Method 2: Individual File Linking (Not Recommended)

If you need to link files individually:

**CSS Files:**
```html
<link rel="stylesheet" href="https://assets.peachless.design/components/fortune-peach/fortune-peach.css">
<link rel="stylesheet" href="https://assets.peachless.design/components/portfolio-uiux/portfolio-uiux.css">
<link rel="stylesheet" href="https://assets.peachless.design/components/twin-gallery/twin-gallery.css">
```

**JavaScript Files:**
```html
<script src="https://assets.peachless.design/components/fortune-peach/fortune-peach.js"></script>
<script src="https://assets.peachless.design/components/portfolio-uiux/portfolio.js"></script>
<script src="https://assets.peachless.design/components/twin-gallery/twin-gallery.js"></script>
```

## Path Construction Logic

### Global Loaders
The loaders construct URLs as:
```
BASE_URL + file_path
```

Example:
```
'https://assets.peachless.design' + '/core/elegant-footer.css'
= 'https://assets.peachless.design/core/elegant-footer.css'
```

### Component Loader
For component HTML files:
```
BASE_URL + '/components/' + component-name + '/' + component-name + '-loader.html'
```

Example:
```
'https://assets.peachless.design' + '/components/' + 'fortune-peach' + '/' + 'fortune-peach-loader.html'
= 'https://assets.peachless.design/components/fortune-peach/fortune-peach-loader.html'
```

## Auto-Update System

### What Gets Auto-Updated

When you run `npm run generate-loaders`, the following files are automatically regenerated:

✅ **Loader Files:**
- `loaders/global-css-loader.html` - CSS loader for Squarespace Header
- `loaders/global-js-loader.html` - JS loader for Squarespace Footer
- `loaders/global-css-loader.js` - Standalone CSS loader (JS version)
- `loaders/global-js-loader.js` - Standalone JS loader (JS version)

✅ **Documentation Files:**
- `loaders/components-registry.json` - Component metadata (machine-readable)
- `loaders/components-registry.md` - Component list (human-readable)
- `loaders/COMPONENT-SYNTAX.md` - Component usage syntax
- `loaders/COMPONENT-SYNTAX.txt` - Quick copy-paste reference
- `SQUARESPACE-PATHS.md` - **This file** (paths documentation)

✅ **Test Files:**
- `test/index.html` - Manual test page (file lists updated)
- `test/index-auto.html` - Auto-loading test page (file lists updated)

### When to Run

Run `npm run generate-loaders` when you:
- ✅ Add a new component
- ✅ Remove a component
- ✅ Rename a component
- ✅ Change component file structure
- ✅ Add/remove core CSS or JS files

**It's also included in the build process:**
```bash
npm run build  # Runs portfolio-build + generate-loaders
```

## GitHub Pages Structure

For GitHub Pages to serve files correctly, your repository structure should be:

```
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
```

**Important:** If your GitHub Pages uses a different source (like `/docs` folder), you'll need to:
1. Move all files into that folder, OR
2. Update BASE_URL and paths in loaders to include the folder prefix

## Changing the Base URL

To change the GitHub Pages domain:

1. **Update `scripts/generate-loaders.js`:**
   ```javascript
   const BASE_URL = 'https://your-new-domain.com';
   ```

2. **Update `core/component-loader.js`:**
   ```javascript
   const BASE_URL = 'https://your-new-domain.com';
   ```

3. **Regenerate loaders:**
   ```bash
   npm run generate-loaders
   ```

4. **Update CNAME file:**
   ```
   your-new-domain.com
   ```

## Verifying Paths

To verify a file is accessible:

1. **Test URL in browser:**
   ```
   https://assets.peachless.design/core/utilities.js
   ```

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
2. Wrong component name in `data-component`
3. Component HTML file not accessible

**Solution:**
- Check browser console for errors
- Verify `component-loader.js` is loaded
- Test component URL directly: `https://assets.peachless.design/components/[component]/[component]-loader.html`

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
3. **Test paths locally first** - Use `npm run serve` to test
4. **Keep BASE_URL consistent** - Update in all places when changing
5. **Use relative paths in loaders** - Paths start with `/` (absolute from domain root)
6. **Verify GitHub Pages deployment** - Ensure files are accessible before deploying to Squarespace

## Summary

✅ **All paths are auto-generated** - No manual path updates needed  
✅ **All loaders auto-update** - New components automatically included  
✅ **All documentation auto-updates** - Stays in sync with actual files  
✅ **Just run `npm run generate-loaders`** - One command updates everything

---

> 📝 **Last Updated:** 02/11/2025, 23:31:26  
> 🔄 **Auto-generated by:** `scripts/generate-loaders.js`  
> ⚠️ **Do not edit manually** - Changes will be overwritten
