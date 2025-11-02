# Portfolio Component - Complete Workflow

Quick reference for the portfolio component system.

## System Overview

The portfolio component is now **data-driven** and **fully automated**:

1. **Edit** `data/portfolio-projects.json` (or use tools)
2. **Build** generates HTML automatically
3. **Deploy** to Squarespace

## Quick Commands

```bash
# Add a new project (interactive)
npm run portfolio-add

# Build HTML from JSON
npm run portfolio-build

# Validate data (check for errors)
npm run portfolio-validate

# Full build (portfolio + loaders)
npm run build
```

## Common Workflows

### Adding a New Project

**Fastest Way:**
```bash
npm run portfolio-add
npm run portfolio-build
```

**Manual Way:**
1. Edit `data/portfolio-projects.json`
2. Add project to `projects` array
3. Run `npm run portfolio-build`

### Editing an Existing Project

1. Open `data/portfolio-projects.json`
2. Find and edit the project
3. Run `npm run portfolio-build`

### Removing a Project

1. Open `data/portfolio-projects.json`
2. Delete the project object
3. Run `npm run portfolio-build`

### Bulk Updates

1. Use find/replace in `data/portfolio-projects.json`
2. Run `npm run portfolio-validate` to check
3. Run `npm run portfolio-build`

## File Structure

```
data/
  └── portfolio-projects.json    ← EDIT THIS
      └── PORTFOLIO-DATA-GUIDE.md (documentation)

scripts/
  ├── add-portfolio-project.js    (interactive add tool)
  └── build-portfolio-data.js      (build & validate)

html/
  └── portfolio-uiux-loader.html  ← AUTO-GENERATED
```

## Documentation Files

- **`PORTFOLIO-MAINTAINABILITY.md`** - Architecture & scaling guide
- **`data/PORTFOLIO-DATA-GUIDE.md`** - Complete JSON reference
- **`html/PORTFOLIO-GUIDE.md`** - HTML structure details
- **`html/PORTFOLIO-QUICK-REFERENCE.txt`** - One-page cheat sheet

## Tips

- ✅ Always validate before building: `npm run portfolio-validate`
- ✅ Keep IDs unique and descriptive
- ✅ Use consistent categories for filtering
- ✅ Test locally: `npm run serve`

## Need Help?

1. **Quick questions**: See `html/PORTFOLIO-QUICK-REFERENCE.txt`
2. **Data format**: See `data/PORTFOLIO-DATA-GUIDE.md`
3. **Architecture**: See `PORTFOLIO-MAINTAINABILITY.md`
4. **Validation errors**: Run `npm run portfolio-validate`

