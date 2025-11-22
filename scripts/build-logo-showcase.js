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

async function buildEntry(entryPath) {
    const { build } = await import('vite');
    const vue = (await import('@vitejs/plugin-vue')).default;

    const entryDir = path.dirname(entryPath);
    const baseName = path.basename(entryPath).replace('.entry.ts', '');
    const jsOut = toPosix(path.join('components', path.basename(entryDir), `${baseName}.js`));
    const cssOut = toPosix(path.join('components', path.basename(entryDir), `${baseName}.css`));

    console.log(`⚙️  Building ${toPosix(entryPath)} -> ${jsOut} + ${cssOut}`);

    try {
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
        console.log('Build successful!');
    } catch (e) {
        console.error('Build failed:', e);
    }
}

const entry = 'components/logo-showcase/logo-showcase.entry.ts';
buildEntry(entry);
