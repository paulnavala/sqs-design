import { defineComponent, h, ref, PropType } from 'vue';

export type LogoItem = {
    id: string;
    name: string;
    description: string;
    gridSrc: string;
    previewSrc: string;
    alt: string;
};

function slug(s: string): string {
    return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function unique<T>(arr: T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const v of arr) {
        const k = String(v);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        out.push(v);
    }
    return out;
}

function variantCandidates(id: string, variant: 'grid' | 'preview', sizes: Array<'sm' | 'md' | 'lg' | ''> = ['sm', 'md', 'lg', '']): string[] {
    const varBase = 'https://assets.peachless.design/assets/logos/variants/';
    const s = slug(id);
    const bases = unique([s, s.replace(/-/g, '_'), s.replace(/_/g, '-')]);
    const v = variant;
    const namePatterns: string[] = [];
    bases.forEach((b) => {
        sizes.forEach((sz) => {
            const suf = sz ? `-${sz}` : '';
            namePatterns.push(`${b}_${v}${suf}`);
            namePatterns.push(`${b}-${v}${suf}`);
        });
    });
    const exts = ['.webp', '.png', '.jpg', '.jpeg'];
    const urls: string[] = [];
    namePatterns.forEach((n) => {
        exts.forEach((ext) => urls.push(varBase + n + ext));
    });
    return urls;
}

function variantFromBasename(base: string, sizes: Array<'sm' | 'md' | 'lg' | ''> = ['sm', 'md', 'lg', '']): string[] {
    const varBase = 'https://assets.peachless.design/assets/logos/variants/';
    const clean = base.replace(/\.[a-z0-9]+$/i, ''); // drop extension if present
    const names = sizes.map((sz) => `${clean}${sz ? '-' + sz : ''}.webp`);
    return names.map((n) => varBase + n);
}

function fileBaseFromPath(src?: string): string {
    if (!src) return '';
    try {
        const withoutQuery = src.split('?')[0];
        const parts = withoutQuery.split('/');
        return parts[parts.length - 1].replace(/\.[a-z0-9]+$/i, '');
    } catch {
        return '';
    }
}

function originalCandidates(id: string, variant: 'grid' | 'preview'): string[] {
    const baseA = 'https://assets.peachless.design/assets/logos/';
    const baseB = 'https://assets.peachless.design/assets/logos/originals/';
    const s = slug(id);
    const bases = unique([s, s.replace(/-/g, '_'), s.replace(/_/g, '-')]);
    const v = variant;
    const namePatterns: string[] = [];
    bases.forEach((b) => {
        namePatterns.push(`${b}_${v}`);
        namePatterns.push(`${b}-${v}`);
    });
    const exts = ['.png', '.jpg', '.jpeg', '.webp'];
    const urls: string[] = [];
    namePatterns.forEach((n) => {
        exts.forEach((ext) => {
            urls.push(baseB + n + ext);
            urls.push(baseA + n + ext);
        });
    });
    return urls;
}

function pickVariant(id: string, variant: 'grid' | 'preview', preferred: Array<'sm' | 'md' | 'lg' | ''>) {
    return unique(variantCandidates(id, variant, preferred));
}

export default defineComponent({
    name: 'LogoShowcase',
    props: {
        logos: { type: Array as PropType<LogoItem[]>, default: () => [] }
    },
    setup(props) {
        const activeIndex = ref<number | null>(null);
        const selectedLogo = ref<number | null>(null);

        const handleLogoClick = (index: number) => {
            selectedLogo.value = selectedLogo.value === index ? null : index;
        };

        return () => {
            const logoItems = props.logos || [];

            return h('section', { class: ['logo-showcase', { 'has-selection': selectedLogo.value !== null }] }, [
                h('div', { class: 'showcase-wrapper' }, [
                    h('div', { class: 'main-content' }, [
                        h('h2', { class: 'section-title' }, 'Trusted by innovative companies'),
                        h('div', { class: 'logo-grid' },
                            logoItems.map((logo, index) =>
                                h('div', {
                                    key: logo.id,
                                    class: 'logo-item',
                                    onMouseenter: () => activeIndex.value = index,
                                    onMouseleave: () => activeIndex.value = null,
                                    onClick: () => handleLogoClick(index)
                                }, [
                                    h('div', {
                                        class: ['logo-placeholder', {
                                            'is-active': activeIndex.value === index,
                                            'is-selected': selectedLogo.value === index
                                        }]
                                    }, [
                                        h('img', {
                                            class: 'logo-image',
                                            alt: logo.alt || logo.name,
                                            loading: 'lazy',
                                            decoding: 'async',
                                            src: unique([
                                                ...variantFromBasename(fileBaseFromPath(logo.gridSrc), ['sm', 'md', '']),
                                                ...pickVariant(logo.id, 'grid', ['sm', 'md', '']),
                                                ...originalCandidates(logo.id, 'grid'),
                                                logo.gridSrc || '',
                                            ])[0],
                                            srcset: unique([
                                                ...variantFromBasename(fileBaseFromPath(logo.gridSrc), ['sm', 'md']),
                                                ...pickVariant(logo.id, 'grid', ['sm', 'md']),
                                            ]).map((u) => {
                                                if (u.includes('-sm.')) return `${u} 320w`;
                                                if (u.includes('-md.')) return `${u} 640w`;
                                                return `${u} 1200w`;
                                            }).join(', '),
                                            sizes: '(min-width: 640px) 25vw, 50vw',
                                            'data-cand': JSON.stringify(
                                                unique([
                                                    ...variantFromBasename(fileBaseFromPath(logo.gridSrc), ['md', '']),
                                                    ...pickVariant(logo.id, 'grid', ['md', '']),
                                                    ...originalCandidates(logo.id, 'grid'),
                                                    logo.gridSrc || '',
                                                ]).slice(1)
                                            ),
                                            onError: (e: Event) => {
                                                const img = e.target as HTMLImageElement;
                                                try {
                                                    const list = JSON.parse(img.getAttribute('data-cand') || '[]') as string[];
                                                    const next = list.shift();
                                                    if (next) {
                                                        img.setAttribute('data-cand', JSON.stringify(list));
                                                        img.src = next;
                                                        return;
                                                    }
                                                } catch { }
                                                // Fallback to text if all images fail
                                                const placeholder = img.parentElement;
                                                if (placeholder) {
                                                    img.style.display = 'none';
                                                    const textSpan = h('span', { class: 'logo-text' }, logo.name);
                                                    placeholder.appendChild((textSpan as any).el || document.createTextNode(logo.name));
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ]),
                    selectedLogo.value !== null ? h('div', { class: 'detail-panel' }, [
                        h('button', {
                            class: 'close-button',
                            onClick: () => selectedLogo.value = null
                        }, '×'),
                        h('div', { class: 'detail-content' }, [
                            h('div', { class: 'detail-logo' }, [
                                h('img', {
                                    class: 'detail-logo-image',
                                    alt: logoItems[selectedLogo.value].alt || logoItems[selectedLogo.value].name,
                                    src: unique([
                                        ...variantFromBasename(fileBaseFromPath(logoItems[selectedLogo.value].previewSrc), ['md', 'lg', '']),
                                        ...pickVariant(logoItems[selectedLogo.value].id, 'preview', ['md', 'lg', '']),
                                        ...originalCandidates(logoItems[selectedLogo.value].id, 'preview'),
                                        logoItems[selectedLogo.value].previewSrc || '',
                                    ])[0],
                                    onError: (e: Event) => {
                                        const img = e.target as HTMLImageElement;
                                        // Fallback to text if image fails
                                        const logoDiv = img.parentElement;
                                        if (logoDiv) {
                                            img.style.display = 'none';
                                            const textSpan = document.createElement('span');
                                            textSpan.className = 'detail-logo-text';
                                            textSpan.textContent = logoItems[selectedLogo.value].name;
                                            logoDiv.appendChild(textSpan);
                                        }
                                    }
                                })
                            ]),
                            h('div', { class: 'detail-info' }, [
                                h('h3', { class: 'detail-title' }, logoItems[selectedLogo.value].name),
                                h('p', { class: 'detail-description' }, logoItems[selectedLogo.value].description)
                            ])
                        ])
                    ]) : null
                ])
            ]);
        };
    }
});
