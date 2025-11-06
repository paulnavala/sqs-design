#!/usr/bin/env node
/*
 * Programmatic Vite multi-entry build to emit JS/CSS to existing paths
 * without changing the repository structure. Compatible with CommonJS.
 */

const fs = require('fs');
const path = require('path');

function toGlobalName(kebab) {
  return kebab
    .split('/')
    .pop()
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function discoverEntries() {
  const entries = [];
  const componentsDir = path.join(__dirname, '..', 'components');
  if (fs.existsSync(componentsDir)) {
    const componentNames = fs
      .readdirSync(componentsDir)
      .filter((d) => fs.statSync(path.join(componentsDir, d)).isDirectory());

    componentNames.forEach((name) => {
      const dir = path.join(componentsDir, name);
      // Include any *.entry.ts within the component directory to allow custom basenames
      fs.readdirSync(dir)
        .filter((f) => f.endsWith('.entry.ts'))
        .forEach((f) => entries.push(path.join(dir, f)));
    });
  }
  return entries;
}

async function buildEntry(entryPath) {
  const { build } = await import('vite');
  const vue = (await import('@vitejs/plugin-vue')).default;

  const entryDir = path.dirname(entryPath);
  const baseName = path.basename(entryPath).replace('.entry.ts', '');
  const jsOut = toPosix(path.join('components', path.basename(entryDir), `${baseName}.js`));
  const cssOut = toPosix(path.join('components', path.basename(entryDir), `${baseName}.css`));

  console.log(`⚙️  Building ${toPosix(entryPath)} -> ${jsOut} + ${cssOut}`);

  await build({
    plugins: [vue()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
      process: '{}',
      global: 'globalThis',
    },
    build: {
      outDir: 'dist-vue',
      emptyOutDir: false,
      cssCodeSplit: true,
      minify: 'esbuild',
      lib: {
        entry: toPosix(entryPath),
        name: toGlobalName(baseName),
        formats: ['iife'],
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          entryFileNames: () => jsOut,
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (name.endsWith('.css')) {
              return cssOut;
            }
            return 'assets/[name][extname]';
          },
        },
      },
    },
  });

  // Copy outputs from dist-vue to repository root and clean up
  const jsSrc = path.join(process.cwd(), 'dist-vue', jsOut);
  const cssSrc = path.join(process.cwd(), 'dist-vue', cssOut);
  const jsDst = path.join(process.cwd(), jsOut);
  const cssDst = path.join(process.cwd(), cssOut);

  // Ensure destination directories exist
  fs.mkdirSync(path.dirname(jsDst), { recursive: true });
  fs.mkdirSync(path.dirname(cssDst), { recursive: true });

  if (fs.existsSync(jsSrc)) {
    fs.copyFileSync(jsSrc, jsDst);
  }
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, cssDst);
  }
}

async function main() {
  const entries = discoverEntries();
  if (entries.length === 0) {
    console.log('ℹ️  No *.entry.ts files found under components/. Nothing to build.');
    process.exit(0);
  }

  for (const entry of entries) {
    try {
      await buildEntry(entry);
    } catch (err) {
      console.error(`❌ Failed to build ${entry}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  if (process.exitCode !== 1) {
    console.log('✅ Build complete');
  }
}

main();
