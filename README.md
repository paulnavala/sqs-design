# Squarespace Design Components

A modern, scalable component library for Squarespace websites with automated build tools and comprehensive documentation.

## 📁 Project Structure

```
sqs-design/
├── components/              # Individual UI components
│   ├── fortune-peach/      # Fortune Peach interactive widget
│   ├── portfolio-uiux/     # Portfolio showcase with filtering
│   └── twin-gallery/       # Twin gallery component
│
├── core/                   # Core utilities and shared functionality
│   ├── component-loader.js # Dynamic component loader
│   ├── utilities.js       # Shared utilities
│   ├── *.css              # Core stylesheets
│   └── *.js               # Core JavaScript modules
│
├── data/                   # Data files (JSON, etc.)
│   └── portfolio-projects.json  # Portfolio project data
│
├── loaders/                # Auto-generated loader files
│   ├── global-css-loader.html    # CSS loader for Squarespace
│   ├── global-js-loader.html     # JS loader for Squarespace
│   ├── components-registry.json   # Component metadata
│   └── *.md, *.txt              # Component syntax references
│
├── scripts/                # Build and utility scripts
│   ├── generate-loaders.js        # Generate loader files
│   ├── build-portfolio-data.js    # Build portfolio HTML from JSON
│   ├── add-portfolio-project.js   # Interactive project adder
│   └── generate-portfolio-entry.js # Legacy entry generator
│
├── docs/                   # Documentation
│   ├── components/        # Component-specific docs
│   ├── guides/            # Usage guides
│   └── *.md               # Overview documentation
│
├── test/                   # Local testing files
│   ├── index.html         # Manual test page
│   ├── index-auto.html    # Auto-loading test page
│   └── components.js       # Test utilities
│
└── package.json           # Project configuration
```

## 🚀 Quick Start

### Setup

```bash
# Install dependencies (if any)
npm install

# Generate loader files (auto-discovers all components)
npm run generate-loaders
```

> 💡 **Auto-Update System:** All loaders, documentation, and paths are automatically generated and kept in sync. Just run `npm run generate-loaders` after adding/removing components. See `AUTO-UPDATE-SYSTEM.md` for details.

### Adding a New Component

1. Create a folder in `components/` with your component name
2. Add `.css`, `.js`, and `-loader.html` files
3. Run `npm run generate-loaders` to update loaders

### Building Portfolio

```bash
# Add a new portfolio project (interactive)
npm run portfolio-add

# Build portfolio HTML from JSON
npm run portfolio-build

# Validate portfolio data
npm run portfolio-validate
```

### Testing Locally

```bash
npm run serve
# Opens http://localhost:8080/test/index-auto.html
```

## 📦 Components

### Fortune Peach
Interactive fortune cookie widget with animations.

**Files:**
- `components/fortune-peach/fortune-peach.css`
- `components/fortune-peach/fortune-peach.js`
- `components/fortune-peach/fortune-peach-loader.html`

**Usage:** See `docs/components/` for details.

### Portfolio UI/UX
Modern portfolio showcase with filtering, Figma embeds, and modal views.

**Files:**
- `components/portfolio-uiux/portfolio-uiux.css`
- `components/portfolio-uiux/portfolio.js`
- `components/portfolio-uiux/portfolio-uiux-loader.html`

**Data:** `data/portfolio-projects.json`

**Documentation:** `docs/components/portfolio/`

### Twin Gallery
Side-by-side gallery component.

**Files:**
- `components/twin-gallery/twin-gallery.css`
- `components/twin-gallery/twin-gallery.js`
- `components/twin-gallery/twin-gallery-loader.html`

## 🛠️ NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run generate-loaders` | Generate global CSS/JS loaders and component registry |
| `npm run portfolio-add` | Interactively add a new portfolio project |
| `npm run portfolio-build` | Build portfolio HTML from JSON data |
| `npm run portfolio-validate` | Validate portfolio data without building |
| `npm run build` | Full build (portfolio + loaders) |
| `npm run serve` | Start local development server |
| `npm test` | Open test page instructions |

## 📚 Documentation

- **Component Overview**: `docs/components-overview.md`
- **Squarespace Setup**: `docs/guides/squarespace-setup.md`
- **Component Loader**: `docs/guides/component-loader-usage.md`
- **Portfolio Guide**: `docs/components/portfolio/workflow.md`

## 🏗️ Architecture

### Component Structure

Each component follows this structure:

```
components/
  └── component-name/
      ├── component-name.css          # Component styles
      ├── component-name.js           # Component logic
      └── component-name-loader.html  # Squarespace-ready HTML
```

### Core Files

Core utilities and shared functionality live in `core/`:
- `utilities.js` - Shared utility functions
- `component-loader.js` - Dynamic component loader
- `*.css` - Core stylesheets
- `*.js` - Core JavaScript modules

### Data Management

Portfolio projects use a JSON-based data system:
- **Source**: `data/portfolio-projects.json`
- **Build**: `npm run portfolio-build` generates HTML
- **Validation**: Automatic validation on build

## 🎯 Best Practices

### Adding Components

1. **Organize by feature**: Each component gets its own folder
2. **Consistent naming**: Use kebab-case for files and folders
3. **Include loader**: Create a `-loader.html` file for Squarespace
4. **Document**: Add usage notes in component files

### Portfolio Management

1. **Use JSON**: Edit `data/portfolio-projects.json`, not HTML
2. **Validate first**: Run `npm run portfolio-validate`
3. **Build after changes**: Always run `npm run portfolio-build`

### Version Control

- ✅ Commit `data/` files (source of truth)
- ✅ Commit `components/` files
- ✅ Commit `core/` files
- ✅ Commit generated `loaders/` (needed for Squarespace)
- ⚠️ Consider ignoring generated files if preferred

## 🔧 Development Workflow

1. **Edit** component files in `components/` or data in `data/`
2. **Build** run `npm run generate-loaders` or `npm run portfolio-build`
3. **Test** use `npm run serve` for local testing
4. **Deploy** copy loader files to Squarespace Code Injection

## 📖 Squarespace Integration

1. Copy `loaders/global-css-loader.html` → Settings > Advanced > Code Injection > Header
2. Copy `loaders/global-js-loader.html` → Settings > Advanced > Code Injection > Footer
3. Use components via `data-component` attribute or paste loader HTML

See `docs/guides/squarespace-setup.md` for detailed instructions.

## 🤝 Contributing

When adding new components:

1. Create component folder in `components/`
2. Add CSS, JS, and loader HTML files
3. Update component metadata in loader HTML comments
4. Run `npm run generate-loaders`
5. Test locally with `npm run serve`

## 📝 License

ISC

---

For detailed component documentation, see the `docs/` directory.

