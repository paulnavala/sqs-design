import { defineComponent, h, ref, PropType, onMounted, onUnmounted, nextTick } from 'vue';

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
    const clean = base.replace(/\.[a-z0-9]+$/i, '');
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
        const selectedLogo = ref<number | null>(null);
        const focusedIndex = ref<number>(0);
        const mainContentRef = ref<HTMLElement | null>(null);
        const gridContainerRef = ref<HTMLElement | null>(null);
        const sectionRef = ref<HTMLElement | null>(null);
        const closeButtonRef = ref<HTMLButtonElement | null>(null);

        // State for scroll cue
        const canScrollDown = ref(false);
        const isHoveringBottom = ref(false);
        const isInitial = ref(true);
        
        // Loading states
        const loadedImages = ref<Set<string>>(new Set());

        const checkScroll = () => {
            if (!mainContentRef.value) return;
            const el = mainContentRef.value;
            canScrollDown.value = el.scrollHeight - el.scrollTop > el.clientHeight + 5;
        };

        const handleScroll = () => {
            checkScroll();
            if (isInitial.value) {
                isInitial.value = false;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!gridContainerRef.value) return;
            const rect = gridContainerRef.value.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;
            const bottomThreshold = height - 120;

            isHoveringBottom.value = y > bottomThreshold;
        };

        const handleMouseLeave = () => {
            isHoveringBottom.value = false;
        };

        const scrollDown = () => {
            if (!mainContentRef.value) return;
            const el = mainContentRef.value;
            el.scrollBy({ top: el.clientHeight * 0.7, behavior: 'smooth' });
        };

        const scrollToItem = (index: number) => {
            if (!mainContentRef.value) return;
            const items = mainContentRef.value.querySelectorAll('.logo-item');
            const item = items[index] as HTMLElement;
            if (item) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };

        const handleLogoClick = (index: number) => {
            if (selectedLogo.value === index) {
                selectedLogo.value = null;
            } else {
                selectedLogo.value = index;
                focusedIndex.value = index;
                // Focus the close button after panel opens
                nextTick(() => {
                    closeButtonRef.value?.focus();
                });
            }
            setTimeout(checkScroll, 650);
        };

        const closeDetail = () => {
            selectedLogo.value = null;
            focusedIndex.value = -1;
            setTimeout(checkScroll, 650);
            // Blur any focused element to remove highlight
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        };

        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            const logos = props.logos;
            if (!logos.length) return;

            // If detail panel is open, only handle Escape
            if (selectedLogo.value !== null) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDetail();
                }
                return;
            }

            const cols = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2;
            let newIndex = focusedIndex.value;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = Math.min(focusedIndex.value + 1, logos.length - 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = Math.max(focusedIndex.value - 1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = Math.min(focusedIndex.value + cols, logos.length - 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = Math.max(focusedIndex.value - cols, 0);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    handleLogoClick(focusedIndex.value);
                    return;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = logos.length - 1;
                    break;
                default:
                    return;
            }

            if (newIndex !== focusedIndex.value) {
                focusedIndex.value = newIndex;
                scrollToItem(newIndex);
                // Focus the new item
                nextTick(() => {
                    const items = mainContentRef.value?.querySelectorAll('.logo-placeholder');
                    const item = items?.[newIndex] as HTMLElement;
                    item?.focus();
                });
            }
        };

        // Handle click outside to close panel
        const handleClickOutside = (e: MouseEvent) => {
            if (selectedLogo.value === null) return;
            const target = e.target as HTMLElement;
            const panel = target.closest('.detail-panel');
            const card = target.closest('.logo-placeholder');
            if (!panel && !card) {
                closeDetail();
            }
        };

        // Image load handler
        const handleImageLoad = (id: string) => {
            loadedImages.value.add(id);
        };

        onMounted(() => {
            nextTick(checkScroll);
            setTimeout(checkScroll, 100);
            setTimeout(checkScroll, 300);
            setTimeout(checkScroll, 500);
            window.addEventListener('resize', checkScroll);
            document.addEventListener('keydown', handleKeyDown);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', checkScroll);
            document.removeEventListener('keydown', handleKeyDown);
        });

        return () => {
            const logoItems = props.logos;
            const selectedLogoData = selectedLogo.value !== null ? logoItems[selectedLogo.value] : null;
            const logoCount = logoItems.length;

            const showCue = canScrollDown.value && (isInitial.value || isHoveringBottom.value);

            // Section Title
            const sectionTitle = h('header', { class: 'ls-section-title' }, [
                h('h2', { class: 'ls-section-title__text' }, 'Logo design'),
                h('div', { class: 'ls-section-title__flourish', 'aria-hidden': 'true' }, [
                    h('span', { class: 'ls-section-title__flourish-icon' }),
                ]),
                h('span', { class: 'ls-section-title__sub' }, `${logoCount} selected works`),
            ]);

            return h('section', {
                class: ['logo-showcase', { 'has-selection': selectedLogo.value !== null }],
                ref: sectionRef,
                onClick: handleClickOutside,
                role: 'region',
                'aria-label': 'Logo design portfolio'
            }, [
                sectionTitle,
                h('div', { class: 'showcase-wrapper' }, [
                    // Grid Container
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
                            h('div', {
                                class: 'logo-grid',
                                role: 'grid',
                                'aria-label': 'Logo gallery'
                            },
                                logoItems.map((logo, index) => {
                                    const isSelected = selectedLogo.value === index;
                                    const isFocused = focusedIndex.value === index;
                                    const isLoaded = loadedImages.value.has(logo.id);

                                    return h('div', {
                                        class: 'logo-item',
                                        key: logo.id,
                                        role: 'gridcell'
                                    }, [
                                        h('div', {
                                            class: ['logo-placeholder', {
                                                'is-selected': isSelected,
                                                'is-focused': isFocused,
                                                'is-loaded': isLoaded
                                            }],
                                            tabindex: isFocused ? 0 : -1,
                                            role: 'button',
                                            'aria-pressed': isSelected,
                                            'aria-label': `${logo.name}. Click to view details`,
                                            onClick: (e: MouseEvent) => {
                                                e.stopPropagation();
                                                handleLogoClick(index);
                                            },
                                            onKeydown: (e: KeyboardEvent) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleLogoClick(index);
                                                }
                                            },
                                            onFocus: () => {
                                                focusedIndex.value = index;
                                            }
                                        }, [
                                            // Grid Image
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
                                                onLoad: () => handleImageLoad(logo.id),
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
                                                alt: '',
                                                'aria-hidden': 'true',
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
                            onClick: (e: MouseEvent) => {
                                e.stopPropagation();
                                scrollDown();
                            },
                            role: 'button',
                            'aria-label': 'Scroll down to see more logos',
                            tabindex: showCue ? 0 : -1
                        }, [
                            h('span', { class: 'scroll-arrow', 'aria-hidden': 'true' }, '↓')
                        ])
                    ]),

                    // Detail Panel
                    selectedLogoData ? h('aside', {
                        class: 'detail-panel',
                        role: 'dialog',
                        'aria-label': `Details for ${selectedLogoData.name}`,
                        'aria-modal': 'false'
                    }, [
                        h('div', { class: 'detail-content' }, [
                            h('div', { class: 'detail-logo' }, [
                                h('button', {
                                    class: 'close-button',
                                    ref: closeButtonRef,
                                    onClick: (e: MouseEvent) => {
                                        e.stopPropagation();
                                        closeDetail();
                                    },
                                    'aria-label': 'Close details panel'
                                }, '×'),
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
