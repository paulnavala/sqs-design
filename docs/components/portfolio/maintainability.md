# Portfolio Component - Scalability & Maintainability Guide

This document explains how the portfolio component is designed for easy scaling and maintenance.

## Architecture Overview

The portfolio component uses a **data-driven approach** with automated build tools:

```
┌─────────────────────────────────────────────────────────┐
│  DATA LAYER (Edit This)                                 │
│  data/portfolio-projects.json                           │
│  - Human-readable JSON                                  │
│  - Easy to edit, version control friendly              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  BUILD LAYER (Automated)                                │
│  scripts/build-portfolio-data.js                        │
│  - Validates data                                       │
│  - Generates HTML                                       │
│  - Updates component file                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Auto-Generated)                   │
│  html/portfolio-uiux-loader.html                       │
│  - Generated HTML with data attributes                  │
│  - Read by portfolio.js                                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  RUNTIME LAYER (No Changes Needed)                      │
│  js/portfolio.js                                        │
│  - Reads HTML, renders cards                            │
│  - Handles filtering, modal, etc.                       │
└─────────────────────────────────────────────────────────┘
```

## Key Design Principles

### 1. Separation of Concerns

- **Data** (`data/portfolio-projects.json`) - What you edit
- **Build** (`scripts/build-portfolio-data.js`) - Automation
- **Presentation** (`html/portfolio-uiux-loader.html`) - Auto-generated
- **Logic** (`js/portfolio.js`) - No changes needed

### 2. Single Source of Truth

All project data comes from `data/portfolio-projects.json`. The HTML is generated, so there's never a conflict between data sources.

### 3. Validation First

The build process validates:
- ✅ Required fields present
- ✅ Unique IDs
- ✅ Valid formats (URLs, colors, years)
- ✅ Data types correct

### 4. Automated Builds

No manual HTML editing. Edit JSON → Build → Done.

## Adding Projects (3 Ways)

### Method 1: Interactive Tool (Easiest)

```bash
npm run portfolio-add
```

Prompts for all fields, handles validation, updates JSON automatically.

### Method 2: Edit JSON Directly

```json
{
  "projects": [
    {
      "id": "my-project",
      "title": "My Project",
      "figma": "https://..."
    }
  ]
}
```

Then run: `npm run portfolio-build`

### Method 3: Copy Template

Use existing projects as templates, or use the generator tool.

## Scaling to Many Projects

### Performance Considerations

- **Lazy Loading**: Iframes load only when in viewport
- **Intersection Observer**: Efficient scroll detection
- **Template-based Rendering**: Single template, cloned efficiently
- **Filtering**: Client-side, instant

### Data Organization Tips

**By Category:**
```json
{
  "projects": [
    { "id": "cern-01", "categories": ["cern"] },
    { "id": "cern-02", "categories": ["cern"] },
    { "id": "mobile-01", "categories": ["mobile"] }
  ]
}
```

**By Year:**
```json
{
  "projects": [
    { "id": "project-2025", "year": 2025 },
    { "id": "project-2024", "year": 2024 }
  ]
}
```

**By Client:**
```json
{
  "projects": [
    { "id": "client-a-01", "categories": ["client-a"] },
    { "id": "client-b-01", "categories": ["client-b"] }
  ]
}
```

### Recommended Structure

For 50+ projects, organize in JSON with consistent naming:

```json
{
  "projects": [
    // Group related projects with similar IDs
    { "id": "cern-01", "title": "CERN Prototype" },
    { "id": "cern-02", "title": "CERN Flows" },
    { "id": "cern-03", "title": "CERN Systems" },
    
    // Use prefixes for categories
    { "id": "mobile-app-01", "categories": ["mobile"] },
    { "id": "web-app-01", "categories": ["web"] },
    
    // Chronological ordering (newest first)
    { "id": "2025-project-01", "year": 2025 },
    { "id": "2024-project-01", "year": 2024 }
  ]
}
```

## Maintenance Tasks

### Daily/Weekly: Add Projects

```bash
npm run portfolio-add
# or edit JSON + npm run portfolio-build
```

### Monthly: Validate All Data

```bash
npm run portfolio-validate
```

### Quarterly: Review & Cleanup

1. Check for unused categories
2. Remove old projects
3. Update filter buttons if needed
4. Validate: `npm run portfolio-validate`

### Yearly: Update Defaults

Edit `data/portfolio-projects.json`:
```json
{
  "settings": {
    "defaultYear": 2026,
    "defaultAccent": "#D29A84"
  }
}
```

## Version Control Best Practices

### Recommended `.gitignore` Entries

You might want to ignore generated files (optional):

```
# Generated HTML (if you prefer to always rebuild)
html/portfolio-projects-data.html
```

But keep:
- ✅ `data/portfolio-projects.json` - Your source data
- ✅ `html/portfolio-uiux-loader.html` - Needed for Squarespace
- ✅ All scripts and config files

### Commit Strategy

1. **Small commits**: One project per commit
   ```bash
   git add data/portfolio-projects.json
   git commit -m "Add new project: Mobile App Redesign"
   npm run portfolio-build
   git add html/portfolio-uiux-loader.html
   git commit -m "Rebuild portfolio HTML"
   ```

2. **Or combined**: Edit + build in one commit
   ```bash
   # Edit JSON
   npm run portfolio-build
   git add data/portfolio-projects.json html/portfolio-uiux-loader.html
   git commit -m "Add project and rebuild"
   ```

## Automation Options

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run portfolio-validate
if [ $? -ne 0 ]; then
  echo "Portfolio validation failed!"
  exit 1
fi
```

### CI/CD Integration

Add to your build pipeline:

```yaml
# Example GitHub Actions
- name: Validate Portfolio Data
  run: npm run portfolio-validate

- name: Build Portfolio
  run: npm run portfolio-build
```

### Watch Mode (Future Enhancement)

For development, a watch mode could auto-rebuild:

```bash
npm run portfolio-watch  # (not yet implemented)
```

## Troubleshooting

### Build Fails: Validation Errors

**Problem**: Required fields missing or invalid data

**Solution**: 
```bash
npm run portfolio-validate
# Fix errors shown
npm run portfolio-build
```

### Build Succeeds but Projects Don't Show

**Problem**: HTML not updated correctly

**Solution**:
1. Check `html/portfolio-uiux-loader.html` has `<ul id="projects-data">`
2. Verify projects are inside the `<ul>`
3. Check browser console for JavaScript errors

### Duplicate IDs

**Problem**: Multiple projects with same ID

**Solution**: 
```bash
npm run portfolio-validate
# Will show which IDs are duplicated
# Edit JSON to make IDs unique
```

### Performance Issues (100+ Projects)

**Solutions**:
- Pagination (add to portfolio.js if needed)
- Filter by default (show "featured" only)
- Lazy load filtering (debounce filter changes)
- Virtual scrolling (for very large lists)

## Future Enhancements

Potential improvements for even better scalability:

1. **Database Backend**: Replace JSON with database for very large portfolios
2. **Admin Interface**: Web UI for managing projects
3. **Image Optimization**: Auto-optimize project images
4. **SEO Enhancement**: Generate meta tags from project data
5. **Analytics Integration**: Track project views/clicks
6. **A/B Testing**: Test different project orders/layouts

## Summary

✅ **Data-driven**: Edit JSON, not HTML  
✅ **Validated**: Catch errors before they reach production  
✅ **Automated**: Build process handles HTML generation  
✅ **Scalable**: Handles 10 or 1000 projects  
✅ **Maintainable**: Clear structure, good documentation  

The system is designed to grow with you. Start simple, scale as needed.

