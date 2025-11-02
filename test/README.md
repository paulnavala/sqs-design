# Local Component Testing

This directory contains test files for locally testing your Squarespace components.

## Quick Start

### Option 1: Open Directly in Browser

1. Open `test/index.html` or `test/index-auto.html` in your browser
2. Note: Some browsers may block local file access for fetch requests. If you see errors, use Option 2.

### Option 2: Use Local Server (Recommended)

```bash
npm run serve
```

This will:
- Start a local HTTP server on port 8080
- Automatically open the test page in your browser
- Load all components from the registry automatically

You can also manually start a server:

```bash
# Using Python (if installed)
python -m http.server 8080

# Using Node.js http-server (if installed globally)
http-server -p 8080

# Using PHP (if installed)
php -S localhost:8080
```

Then open: `http://localhost:8080/test/index-auto.html`

## Test Files

- **`index.html`** - Manual component test page (loads specific components)
- **`index-auto.html`** - Auto-loads all components from the registry
- **`components.js`** - Script that dynamically loads all components

## How It Works

The test files use local paths (empty BASE_URL) instead of the GitHub Pages URL, so they load CSS and JS files from your local `css/` and `js/` directories.

The auto-loader reads `html/components-registry.json` and automatically creates test sections for each component.

## Notes

- Make sure to run `npm run generate-loaders` first to ensure the registry is up to date
- The test page loads CSS and JS files locally, matching the Squarespace loader behavior
- All components are loaded in separate sections for easy testing

