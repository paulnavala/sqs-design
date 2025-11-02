# Portfolio Data Directory

This directory contains the JSON data file for managing portfolio projects.

## Files

- **`portfolio-projects.json`** - Main data file (EDIT THIS)
- **`PORTFOLIO-DATA-GUIDE.md`** - Complete guide to using the JSON system

## Quick Start

### Add a Project

**Option 1: Interactive Tool (Recommended)**
```bash
npm run portfolio-add
```

**Option 2: Edit JSON Directly**
1. Open `portfolio-projects.json`
2. Add project to the `projects` array
3. Run `npm run portfolio-build`

### Build HTML

After editing JSON:
```bash
npm run portfolio-build
```

### Validate Data

Check for errors without building:
```bash
npm run portfolio-validate
```

## Why JSON?

- ✅ **Easy to edit**: Clean, readable format
- ✅ **Version control friendly**: Better diffs
- ✅ **Validated**: Automatic error checking
- ✅ **Scalable**: Handle hundreds of projects
- ✅ **Maintainable**: Separate data from code

## Workflow

1. Edit `portfolio-projects.json`
2. Run `npm run portfolio-validate` (optional)
3. Run `npm run portfolio-build`
4. HTML is automatically updated!

See `PORTFOLIO-DATA-GUIDE.md` for detailed documentation.

