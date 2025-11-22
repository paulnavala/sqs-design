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

    const jsSrc = path.join(process.cwd(), 'dist-vue', jsOut);
    const cssSrc = path.join(process.cwd(), 'dist-vue', cssOut);
    const jsDst = path.join(process.cwd(), jsOut);
    const cssDst = path.join(process.cwd(), cssOut);

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
    const entry = path.join(__dirname, '..', 'components', 'modern-footer', 'modern-footer.entry.ts');
    try {
        await buildEntry(entry);
        console.log('✅ Build complete');
    } catch (err) {
        console.error(`❌ Failed to build ${entry}`);
        console.error(err);
        fs.writeFileSync('build_error.log', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        process.exit(1);
    }
}

main();
