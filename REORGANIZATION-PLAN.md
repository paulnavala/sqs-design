# Codebase Reorganization Plan

## Proposed Structure

```
sqs-design/
├── components/           # Individual component folders
│   ├── fortune-peach/
│   │   ├── fortune-peach.css
│   │   ├── fortune-peach.js
│   │   └── fortune-peach-loader.html
│   ├── twin-gallery/
│   │   ├── twin-gallery.css
│   │   ├── twin-gallery.js
│   │   └── twin-gallery-loader.html
│   ├── portfolio-uiux/
│   │   ├── portfolio-uiux.css
│   │   ├── portfolio.js
│   │   ├── portfolio-uiux-loader.html
│   │   └── README.md (component-specific docs)
│   └── ...
│
├── core/                 # Core/shared functionality
│   ├── utilities.js
│   ├── component-loader.js
│   ├── header.css
│   ├── mobile-menu.css
│   ├── mobile-menu.js
│   ├── elegant-footer.css
│   ├── elegant-footer.js
│   └── ...
│
├── loaders/              # Generated loader files
│   ├── global-css-loader.html
│   ├── global-js-loader.html
│   ├── global-css-loader.js
│   ├── global-js-loader.js
│   ├── components-registry.json
│   └── components-registry.md
│
├── docs/                 # All documentation
│   ├── README.md
│   ├── GETTING-STARTED.md
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── data-guide.md
│   │   │   ├── maintenance.md
│   │   │   └── workflow.md
│   │   └── ...
│   ├── guides/
│   │   ├── squarespace-setup.md
│   │   ├── loader-usage.md
│   │   └── component-syntax.md
│   └── api/
│       └── component-loader.md
│
├── data/                 # Data files
│   └── portfolio-projects.json
│
├── scripts/              # Build scripts
│   ├── generate-loaders.js
│   ├── build-portfolio-data.js
│   ├── add-portfolio-project.js
│   └── generate-portfolio-entry.js
│
├── test/                 # Test files
│   ├── index.html
│   ├── index-auto.html
│   ├── components.js
│   └── README.md
│
├── package.json
├── README.md             # Main project README
└── .gitignore
```

## Migration Strategy

1. Create new folder structure
2. Move component files to component folders
3. Move core files to core/
4. Move docs to docs/
5. Update all script paths
6. Update test files
7. Test build system
8. Clean up old files

