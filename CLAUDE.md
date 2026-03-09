# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Squarespace-ready UI components built with TypeScript, Vue 3, Vite, and Tailwind CSS. Each component is bundled as a standalone IIFE + CSS file for drop-in use via Squarespace Code Injection. Hosted on GitHub Pages (see `CNAME` → peachless.design).

## Commands

- `npm run build:vue` — Build all components (discovers `*.entry.ts` files, outputs IIFE JS + CSS to `components/[name]/`)
- `npm run build` — Build portfolio data + regenerate loaders
- `npm run generate-loaders` — Regenerate `loaders/global-*-loader.html` and `components-registry.json`
- `npm run dev` — Dev server with auto-open
- `npm run serve` — Static server at `http://localhost:8080/test/index-auto.html`
- `npm run test` — Vitest unit tests (`test/unit/`)
- `npm run test:watch` — Vitest in watch mode
- `npm run typecheck` — `vue-tsc --noEmit`
- `npm run lint` — ESLint (TS + JS)
- `npm run format` — Prettier

## Architecture

### Component Structure
Each component lives in `components/[name]/` with three files:
- `[name].entry.ts` — Entry point bundled to IIFE; exposes `window.init[PascalName]()`
- `[name].css` — Styles (built output, committed to repo)
- `[name]-loader.html` — Squarespace-ready HTML snippet

Shared DOM utilities (waitFor, qs/qsa, trapFocus, rafThrottle, isReducedMotion) are in `components/_shared/dom.ts`.

### Build Pipeline
`scripts/build-vue.js` auto-discovers all `*.entry.ts` files under `components/`, builds each with Vite as IIFE, copies JS/CSS from `dist-vue/` back to the component directory. Build outputs are committed alongside source.

### Loader System
- `loaders/global-css-loader.html` → Squarespace Header Injection (loads all component CSS)
- `loaders/global-js-loader.html` → Squarespace Footer Injection (loads all component JS)
- `loaders/components-registry.json` — Auto-generated metadata
- `core/component-loader.js` — Runtime loader that can load component HTML by name
- Components activate via `<div data-component="[name]"></div>` attributes

### Data
`data/` contains JSON files (brand-guidelines, logos, portfolio-projects, portfolio-photos) consumed by components at runtime from `assets.peachless.design`.

### Core
`core/` contains standalone JS/CSS files used directly in Squarespace (header, footer, mobile-menu, tagline, etc.) — not bundled through the Vue build pipeline.

## Key Conventions

- Tailwind uses prefix `tw-` and `preflight: false` to avoid Squarespace style collisions
- Brand colors use CSS custom properties (`--c1` through `--c4`, `--ink`, `--card`) mapped to Tailwind as `brand-c1`, `ink`, `card`
- Component globals must stay stable (e.g., `window.initFortunePeach`) for loader compatibility
- IIFE format is required — no ES modules in production output
- Components should be self-contained within their folder
- DOM targeting uses IDs/classes scoped to the component's loader HTML
