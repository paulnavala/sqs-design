import { defineComponent, h, ref, PropType, computed } from 'vue';

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
        const mainContentRef = ref<HTMLElement | null>(null);
        const gridContainerRef = ref<HTMLElement | null>(null);

        // State for scroll cue
        const canScrollDown = ref(false);
        const isHoveringBottom = ref(false);
        const isInitial = ref(true);

        const checkScroll = () => {
            if (!mainContentRef.value) return;
            const el = mainContentRef.value;
            // Check if there is content below the current scroll position
            // Tolerance of 5px
            canScrollDown.value = el.scrollHeight - el.scrollTop > el.clientHeight + 5;
        };

        const handleScroll = () => {
            checkScroll();
            // Once user scrolls, remove the "initial" force-show state
            if (isInitial.value) {
                isInitial.value = false;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!gridContainerRef.value) return;
            const rect = gridContainerRef.value.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;

            // Define "bottom area" as the last 120px (approx last row + padding)
            const bottomThreshold = height - 120;

            if (y > bottomThreshold) {
                isHoveringBottom.value = true;
            } else {
                isHoveringBottom.value = false;
            }
        };

        const handleMouseLeave = () => {
            isHoveringBottom.value = false;
        };

        const scrollDown = () => {
            if (!mainContentRef.value) return;
            const el = mainContentRef.value;
            el.scrollBy({ top: el.clientHeight * 0.7, behavior: 'smooth' });
        };

        // Check on mount and resize
        import('vue').then(({ onMounted, onUnmounted, nextTick, watch }) => {
            onMounted(() => {
                // Multiple checks to ensure layout is ready
                nextTick(checkScroll);
                setTimeout(checkScroll, 500);
                window.addEventListener('resize', checkScroll);
            });
            onUnmounted(() => {
                window.removeEventListener('resize', checkScroll);
            });
        });

        const handleLogoClick = (index: number) => {
            if (selectedLogo.value === index) {
                selectedLogo.value = null;
            } else {
                selectedLogo.value = index;
            }
            setTimeout(checkScroll, 650);
        };

        const closeDetail = () => {
            selectedLogo.value = null;
            setTimeout(checkScroll, 650);
        };

        return () => {
            const logoItems = props.logos;
            const selectedLogoData = selectedLogo.value !== null ? logoItems[selectedLogo.value] : null;

            // Cue is visible if we CAN scroll down AND (it's the initial state OR we are hovering the bottom)
            const showCue = canScrollDown.value && (isInitial.value || isHoveringBottom.value);

            return h('section', {
                class: ['logo-showcase', { 'has-selection': selectedLogo.value !== null }]
            }, [
                h('div', { class: 'showcase-wrapper' }, [
                    // Grid Container (Wrapper for scroll mask)
                    h('div', {
                        class: 'grid-container',
                        ref: gridContainerRef,
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave
                    }, [
                        h('div', {
                            class: 'main-content',
                            ref: mainContentRef,
                            onScroll: handleScroll
                        }, [
                            h('div', { class: 'logo-grid' },
                                logoItems.map((logo, index) => {
                                    return h('div', {
                                        class: 'logo-item',
                                        key: logo.id,
                                        onClick: () => handleLogoClick(index)
                                    }, [
                                        h('div', {
                                            class: ['logo-placeholder', {
                                                'is-active': activeIndex.value === index,
                                                'is-selected': selectedLogo.value === index
                                            }]
                                        }, [
                                            // Grid Image (Default)
                                            h('img', {
                                                class: 'logo-image logo-image-grid',
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
                                                    img.style.display = 'none';
                                                }
                                            }),
                                            // Preview Image (Hover)
                                            h('img', {
                                                class: 'logo-image logo-image-preview',
                                                alt: (logo.alt || logo.name) + ' Preview',
                                                loading: 'lazy',
                                                decoding: 'async',
                                                src: unique([
                                                    ...variantFromBasename(fileBaseFromPath(logo.previewSrc), ['sm', 'md', '']),
                                                    ...pickVariant(logo.id, 'preview', ['sm', 'md', '']),
                                                    ...originalCandidates(logo.id, 'preview'),
                                                    logo.previewSrc || '',
                                                ])[0],
                                                srcset: unique([
                                                    ...variantFromBasename(fileBaseFromPath(logo.previewSrc), ['sm', 'md']),
                                                    ...pickVariant(logo.id, 'preview', ['sm', 'md']),
                                                ]).map((u) => {
                                                    if (u.includes('-sm.')) return `${u} 320w`;
                                                    if (u.includes('-md.')) return `${u} 640w`;
                                                    return `${u} 1200w`;
                                                }).join(', '),
                                                sizes: '(min-width: 640px) 25vw, 50vw',
                                                'data-cand': JSON.stringify(
                                                    unique([
                                                        ...variantFromBasename(fileBaseFromPath(logo.previewSrc), ['md', '']),
                                                        ...pickVariant(logo.id, 'preview', ['md', '']),
                                                        ...originalCandidates(logo.id, 'preview'),
                                                        logo.previewSrc || '',
                                                    ]).slice(1)
                                                )
                                            })
                                        ])
                                    ])
                                })
                            )
                        ]),
                        // Scroll Indicator
                        h('div', {
                            class: ['scroll-indicator', { 'is-visible': showCue }],
                            onClick: scrollDown
                        }, [
                            h('span', { class: 'scroll-arrow' }, '↓')
                        ])
                    ]), // End grid-container

                    // Detail Panel
                    selectedLogoData ? h('div', { class: 'detail-panel' }, [
                        h('button', {
                            class: 'close-button',
                            onClick: closeDetail,
                            'aria-label': 'Close details'
                        }, '×'),
                        h('div', { class: 'detail-content' }, [
                            h('div', { class: 'detail-logo' }, [
                                h('img', {
                                    class: 'detail-logo-image',
                                    alt: selectedLogoData.alt || selectedLogoData.name,
                                    src: unique([
                                        ...variantFromBasename(fileBaseFromPath(selectedLogoData.previewSrc), ['md', 'lg', '']),
                                        ...pickVariant(selectedLogoData.id, 'preview', ['md', 'lg', '']),
                                        ...originalCandidates(selectedLogoData.id, 'preview'),
                                        selectedLogoData.previewSrc || '',
                                    ])[0],
                                    onError: (e: Event) => {
                                        const img = e.target as HTMLImageElement;
                                        const logoDiv = img.parentElement;
                                        if (logoDiv) {
                                            img.style.display = 'none';
                                            const textSpan = document.createElement('span');
                                            textSpan.className = 'detail-logo-text';
                                            textSpan.textContent = selectedLogoData.name;
                                            logoDiv.appendChild(textSpan);
                                        }
                                    }
                                })
                            ]),
                            h('div', { class: 'detail-info' }, [
                                h('h3', { class: 'detail-title' }, selectedLogoData.name),
                                h('p', { class: 'detail-description' }, selectedLogoData.description)
                            ])
                        ])
                    ]) : null
                ])
            ]);
        };
    }
});
