# Component Loaders for Squarespace

## 🚀 Quick Start

**New to this?** See the detailed setup guide: [`SQUARESPACE-SETUP.md`](./SQUARESPACE-SETUP.md)

### TL;DR - How to Link Global Loaders:

**Method 1: Link by URL (Recommended)** ⭐

1. **In Squarespace:** Settings → Advanced → Code Injection
2. **Header section:** Add: `<script src="https://assets.peachless.design/js/global-css-loader.js"></script>`
3. **Footer section:** Add: `<script src="https://assets.peachless.design/js/global-js-loader.js"></script>`
4. **Save**

**Method 2: Copy/Paste Code**

1. **In Squarespace:** Settings → Advanced → Code Injection
2. **Header section:** Copy/paste entire content of `global-css-loader.html`
3. **Footer section:** Copy/paste entire content of `global-js-loader.html`
4. **Save**

That's it! Your CSS and JS files will now load sitewide from GitHub Pages.

**Why Method 1 is better:** Updates automatically when you regenerate loaders and push to GitHub. No need to update Squarespace!

---

## 🔄 Auto-Generate Loaders

The loader files are **auto-generated** from your `css/` and `js/` directories!

### Generate/Update Loaders

```bash
npm run generate-loaders
```

Or:
```bash
node scripts/generate-loaders.js
```

**Run this script whenever you:**
- ✅ Add a new CSS or JS file
- ✅ Delete a CSS or JS file  
- ✅ Rename a CSS or JS file

The loader files will automatically update with all current files.

---

## Setup (One-Time Configuration)

### Step 1: Add Global CSS Loader
1. In Squarespace, go to **Settings > Advanced > Code Injection**
2. Open `global-css-loader.html`
3. Copy the **entire content**
4. Paste into the **Header** section
5. Save

This will load all CSS files sitewide:
- `header.css`
- `twin-gallery.css`
- `tagline.css`
- `project-cards.css`
- `prototype-showcase.css`
- `portfolio.css`
- `mobile-menu.css`
- `elegant-footer.css`

### Step 2: Add Global JavaScript Loader
1. Still in **Settings > Advanced > Code Injection**
2. Open `global-js-loader.html`
3. Copy the **entire content**
4. Paste into the **Footer** section (or Header if preferred)
5. Save

This will load all JavaScript files sitewide (in order):
- `utilities.js` (loads first - dependencies)
- `mobile-menu.js`
- `tagline.js`
- `project-card.js`
- `twin-gallery.js`
- `prototype-showcase.js`
- `portfolio.js`
- `elegant-footer.js`

## Using Components

Once the global loaders are set up, you can use any component by adding its HTML structure to a Code Block:

### Twin Gallery Component
1. Add a **Code Block** in Squarespace
2. Open `twin-gallery-loader.html`
3. Copy the content and paste into the code block
4. Update image URLs and links as needed

**Note:** The CSS and JS are already loaded globally, so you only need the HTML structure.

## Component HTML Files

Each component will have its own HTML file in the `html/` directory that contains just the markup (no CSS/JS links needed).

## Component Registry

The script automatically generates a component registry that tracks all HTML components:

- **`components-registry.json`** - JSON format with component metadata (name, description, URL)
- **`components-registry.md`** - Markdown format with detailed component information

The registry is automatically updated when you run `npm run generate-loaders`. It includes:
- Component name (extracted from filename)
- Description (extracted from HTML comments)
- GitHub Pages URL
- File name

View the registry at:
- **JSON:** `https://assets.peachless.design/html/components-registry.json`
- **Markdown:** `https://assets.peachless.design/html/components-registry.md`

## GitHub Pages Setup

Make sure your repository is configured for GitHub Pages and your domain (assets.peachless.design) is set up correctly.

All CSS and JS files should be accessible at:
- `https://assets.peachless.design/css/[filename].css`
- `https://assets.peachless.design/js/[filename].js`

## Benefits

- ✅ Load CSS/JS once sitewide (better performance)
- ✅ Use components anywhere with just HTML
- ✅ Easy to update - change loader files and all pages update
- ✅ No duplicate CSS/JS loading on pages with multiple components

