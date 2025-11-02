# Portfolio Data Management Guide

This guide explains the new JSON-based data system for managing portfolio projects.

## Overview

Portfolio projects are now managed in a **JSON file** (`data/portfolio-projects.json`) instead of directly in HTML. This makes it:

- ✅ **Easier to edit**: Clean JSON format
- ✅ **Easy to validate**: Built-in validation checks
- ✅ **Version control friendly**: Better diffs, easier merges
- ✅ **Scalable**: Add/edit/remove projects without touching HTML
- ✅ **Maintainable**: Separate data from presentation

## File Structure

```
data/
  └── portfolio-projects.json    # Your project data (EDIT THIS)
html/
  └── portfolio-uiux-loader.html # Auto-generated from JSON
scripts/
  └── build-portfolio-data.js    # Build script
```

## Quick Start

### 1. Edit Projects

Open `data/portfolio-projects.json` and edit the `projects` array:

```json
{
  "projects": [
    {
      "id": "my-project",
      "title": "My Project",
      "description": "Project description",
      "figma": "https://www.figma.com/proto/...",
      "case": "/projects/my-project",
      "badges": ["Prototype", "Figma"],
      "categories": ["prototype", "web"],
      "year": 2025,
      "accent": "#D29A84"
    }
  ]
}
```

### 2. Build HTML

After editing JSON, run the build script:

```bash
npm run portfolio-build
```

This will:
- ✅ Validate your data
- ✅ Generate HTML from JSON
- ✅ Update the portfolio HTML file automatically

### 3. Validate Only

To check for errors without building:

```bash
npm run portfolio-validate
```

## Project Schema

Each project object has these fields:

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | `"cern-01"` |
| `title` | string | Project title | `"CERN Prototype"` |
| `figma` | string | Figma prototype URL | `"https://www.figma.com/proto/..."` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Brief description | `"An interactive exploration..."` |
| `case` | string | Case study URL | `"/projects/cern"` |
| `badges` | array | Array of badge strings | `["Prototype", "Figma"]` |
| `categories` | array | Filter categories | `["prototype", "cern"]` |
| `year` | number | Year (2000-2100) | `2025` |
| `accent` | string | Hex color code | `"#D29A84"` or `""` |

## Examples

### Minimal Project

```json
{
  "id": "simple-project",
  "title": "Simple Project",
  "figma": "https://www.figma.com/proto/abc123/..."
}
```

### Full Project

```json
{
  "id": "feature-rich-project",
  "title": "Feature Rich Project",
  "description": "A complete redesign focusing on user experience and accessibility.",
  "figma": "https://www.figma.com/proto/abc123/...",
  "case": "/projects/feature-rich",
  "badges": ["Prototype", "Mobile", "Figma"],
  "categories": ["prototype", "mobile", "web"],
  "year": 2024,
  "accent": "#58433B"
}
```

## Adding a New Project

1. Open `data/portfolio-projects.json`
2. Add a new object to the `projects` array:

```json
{
  "projects": [
    // ... existing projects ...
    {
      "id": "new-project",
      "title": "New Project",
      "figma": "https://www.figma.com/proto/..."
    }
  ]
}
```

3. Run `npm run portfolio-build`
4. Done! The HTML is automatically updated.

## Editing Projects

1. Open `data/portfolio-projects.json`
2. Find the project in the `projects` array
3. Edit any fields
4. Run `npm run portfolio-build`

## Removing Projects

1. Open `data/portfolio-projects.json`
2. Remove the project object from the `projects` array
3. Run `npm run portfolio-build`

## Field Guidelines

### `id`
- Must be unique
- Lowercase, alphanumeric with hyphens only
- Example: `"cern-01"`, `"app-redesign"`

### `badges`
- Array of strings
- Will be joined with `|` in HTML
- Example: `["Prototype", "Figma"]` → `"Prototype|Figma"`

### `categories`
- Array of strings
- Must match filter button `data-filter` values
- Example: `["prototype", "cern"]`
- If using new categories, add filter buttons in HTML!

### `year`
- Number between 2000-2100
- Omit to use current year

### `accent`
- Hex color code: `"#D29A84"`
- Empty string `""` for default color
- Omit field for default color

## Validation

The build script automatically validates:

- ✅ Required fields present
- ✅ Unique IDs
- ✅ Valid field types
- ✅ URL formats
- ✅ Color formats
- ✅ Year ranges

Run `npm run portfolio-validate` to check without building.

## Workflow

### Recommended Workflow

1. **Edit JSON**: `data/portfolio-projects.json`
2. **Validate**: `npm run portfolio-validate`
3. **Build**: `npm run portfolio-build`
4. **Test**: `npm run serve` (local testing)

### Full Build (All Components)

```bash
npm run build
```

This runs portfolio build + loader generation.

## Migration from HTML

If you have existing projects in HTML format, you can:

1. Manually copy data to JSON (recommended)
2. Or use the generator tool: `npm run portfolio-entry` (then copy to JSON)

## Tips

### Organization

- Keep projects in chronological order (newest first)
- Group related projects with similar IDs (e.g., `cern-01`, `cern-02`)
- Use consistent category naming

### Bulk Editing

Since it's JSON, you can:
- Use find/replace in your editor
- Write scripts to bulk update
- Use JSON editors/validators

### Version Control

- Commit JSON changes
- HTML is auto-generated (can ignore in `.gitignore` if desired)
- Better diffs: see exactly what changed

### Validation in CI/CD

Add to your build process:
```bash
npm run portfolio-validate && npm run portfolio-build
```

## Troubleshooting

### Build Fails: "Missing required field"
- Check that all projects have `id`, `title`, and `figma`
- Ensure JSON syntax is valid (check commas, brackets)

### Build Fails: "Duplicate ID"
- Ensure all `id` values are unique
- Search JSON for duplicates

### Validation Warnings
- Warnings don't block the build
- Fix for best results:
  - ID format issues
  - URL format issues
  - Year/color validation

### HTML Not Updating
- Check that build script completed successfully
- Verify HTML file path is correct
- Check file permissions

## Advanced: Programmatic Access

You can import and use the JSON data in scripts:

```javascript
const data = require('./data/portfolio-projects.json');
console.log(`Total projects: ${data.projects.length}`);
```

## Backward Compatibility

The generated HTML works exactly the same as before. The JavaScript (`portfolio.js`) reads from the HTML list, so no changes needed there.

## Questions?

- See `html/PORTFOLIO-GUIDE.md` for HTML structure details
- See `scripts/build-portfolio-data.js` for build logic
- Run `npm run portfolio-validate` to check your data

