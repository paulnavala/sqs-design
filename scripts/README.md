# Scripts

## generate-loaders.js

Automatically generates `global-css-loader.html` and `global-js-loader.html` by scanning the `css/` and `js/` directories.

### Usage

```bash
# Using npm script
npm run generate-loaders

# Or directly with node
node scripts/generate-loaders.js
```

### What it does

1. **Scans directories:**
   - Reads all `.css` files from `css/` directory
   - Reads all `.js` files from `js/` directory
   - Reads all `.html` component files from `html/` directory (excludes loaders)

2. **Generates loader files:**
   - `html/global-css-loader.html` - Contains all CSS file paths
   - `html/global-js-loader.html` - Contains all JS file paths (utilities.js first)

3. **Generates component registry:**
   - `html/components-registry.json` - JSON format with component metadata
   - `html/components-registry.md` - Markdown format with detailed component info

4. **Smart ordering:**
   - CSS files are sorted alphabetically
   - JavaScript files are sorted alphabetically, but `utilities.js` is moved to the front (since other scripts may depend on it)
   - Components are sorted alphabetically by name

5. **Extracts component metadata:**
   - Component name from filename (e.g., `twin-gallery-loader.html` → "Twin Gallery")
   - Description from HTML comments (looks for `Description:` field first, then first meaningful line)
   - GitHub Pages URL for each component

### When to run

Run this script whenever you:
- ✅ Add a new CSS or JS file
- ✅ Delete a CSS or JS file
- ✅ Rename a CSS or JS file
- ✅ Add a new HTML component
- ✅ Delete an HTML component
- ✅ Update component descriptions in HTML comments

The loader files and component registry will automatically be updated with the current file list.

### Adding Component Descriptions

To add a description to a component, include a `Description:` line in the HTML comment at the top of the file:

```html
<!-- 
  Component Name Component HTML for Squarespace
  
  Description: Your component description here. This will be used in the registry.
  
  Usage: ...
-->
```

If no `Description:` field is found, the script will try to extract a description from the first meaningful line of the comment.

### Output

The script prints:
- Number of CSS files found
- Number of JavaScript files found
- List of all files that will be loaded
- Confirmation that files were generated

### Tips

- Add this script to a Git pre-commit hook to auto-update loaders
- Or run it manually before committing new component files
- The generated files include a note that they're auto-generated

