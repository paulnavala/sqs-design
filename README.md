# SQS Design Components

Modern, Squarespace-ready components built with TypeScript, Vite, and Tailwind CSS. Outputs single-file IIFE bundles and standalone CSS for drop-in use via Code Injection and global loaders.

## Quick Start

```bash
npm install
# Build all components to their existing paths
npm run build:vue
# Start local test server
npm run serve
# → http://localhost:8080/test/index-auto.html
```

## How it Works

- components/[name]
  - [name].entry.ts: Component logic (bundled to IIFE JS at the same path)
  - [name].css: Component styles (loaded by loader HTML)
  - [name]-loader.html: Squarespace-ready HTML you paste into the page or load via the global loader
- loaders/
  - global-css-loader.html: Include in Squarespace Header Injection
  - global-js-loader.html: Include in Squarespace Footer Injection
  - components-registry.json: Metadata for automated loader generation
- core/component-loader.js: Optional utility that can load component loader HTML by name at runtime

## Build and Test

- Build JS/CSS bundles (per component entries):
  - `npm run build:vue`
- Local test pages:
  - `npm run serve`
  - Open `test/index-auto.html` to verify components with global loaders
- Lint/format/tests:
  - `npm run lint`
  - `npm run format`
  - `npm run test` / `npm run test:watch` (Vitest)

## Squarespace Integration

1. Paste the contents of:

- `loaders/global-css-loader.html` → Settings → Advanced → Code Injection → Header
- `loaders/global-js-loader.html` → Settings → Advanced → Code Injection → Footer

2. Add components to a page via HTML blocks:

- Use `<div data-component="fortune-peach"></div>` (auto-loaded by the global JS loader), or
- Paste the corresponding `components/[name]/[name]-loader.html` contents directly into a block

### New Vue core components

- Mobile Menu: `<div data-component="mobile-menu"></div>`
- Tagline (optional lines): `<div data-component="tagline" data-line1="..." data-line2="..."></div>`
- Prototype Showcase (Figma): `<div data-component="prototype-showcase" data-figma="https://www.figma.com/file/..." data-title="..."></div>`
- Project Card (behavior): `<div data-component="project-card"></div>` — adds parallax hover to any `.project-card` elements on the page.

3. Host the built JS/CSS on your CDN (or use GitHub Pages) if not inlining.

## Conventions

- Keep component folders self-contained (CSS, entry TS, loader HTML).
- Target the DOM by IDs/classes scoped to the component loader HTML.
- Respect accessibility (ARIA, focus management, reduced motion).
- Keep globals stable for loader parity (e.g., `window.initFortunePeach`).

## Repository Scripts

- `build:vue`: Builds all `*.entry.ts` to IIFE JS and copies CSS alongside
- `generate-loaders`: Recreates global loader files and registry when components change
- `serve`: Static server for `test/` pages (no SSR)
- `lint` / `format`: ESLint (flat config) and Prettier
- `test` / `test:watch`: Unit tests with Vitest; `tests/e2e` for smoke via Playwright

## Adding a Component

1. Create `components/my-widget/` with:

- `my-widget.entry.ts`
- `my-widget.css` (or Tailwind classes + optional scoped styles)
- `my-widget-loader.html`

2. Build and test:

```bash
npm run build:vue && npm run serve
```

3. Integrate in Squarespace via the global loaders or by pasting the loader HTML.

## Notes

- Output format is IIFE to avoid polluting the global scope and to work within Squarespace’s environment.
- Tailwind uses the `tw-` prefix and `preflight: false` to prevent style collisions.
- The codebase favors simple, framework-agnostic DOM utilities (see `components/_shared/dom.ts`).
