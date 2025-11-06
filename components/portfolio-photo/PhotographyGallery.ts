import { defineComponent, h, PropType, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import BeforeAfterSlider from './BeforeAfterSlider';

export type PhotoItem = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  year: number;
  afterSrc: string;
  beforeSrc?: string;
  thumb?: string;
  alt: string;
  accent?: string | null;
};

function slug(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default defineComponent({
  name: 'PhotographyGallery',
  props: {
    items: { type: Array as PropType<PhotoItem[]>, default: () => [] },
    title: { type: String, default: 'Selected Photography' },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const activeFilter = ref<string>('all');
    const modalOpen = ref(false);
    const activeIndex = ref<number>(-1);
    const lastFocusEl = ref<HTMLElement | null>(null);
    let lastScrollY = 0;
    const modalRatio = ref<number>(1);

    type GalleryItem = PhotoItem & { categorySlugs: string[]; categoryLabels: string[] };
    const normalizedItems = computed<GalleryItem[]>(() =>
      (props.items || []).map((it) => {
        const labels = (it.categories || []).filter(Boolean);
        const slugs = labels.map((c) => slug(c)).filter(Boolean);
        return { ...(it as PhotoItem), categoryLabels: labels, categorySlugs: slugs } as GalleryItem;
      })
    );

    const categories = computed<{ slug: string; label: string }[]>(() => {
      const map = new Map<string, string>();
      normalizedItems.value.forEach((i) => {
        (i.categorySlugs || []).forEach((s, idx) => {
          if (!map.has(s)) map.set(s, i.categoryLabels[idx] || s);
        });
      });
      return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
    });

    const filteredItems = computed<GalleryItem[]>(() => {
      if (activeFilter.value === 'all') return normalizedItems.value;
      return normalizedItems.value.filter((i) => (i.categorySlugs || []).includes(activeFilter.value));
    });

    const visibleCount = computed<number>(() => filteredItems.value.length);

    // Masonry incremental loading (infinite scroll)
    const masonryBatchSize = 20;
    const masonryLoadedCount = ref<number>(masonryBatchSize);

    const colCount = ref<number>(3);
    function computeColCount() {
      try {
        const w = window.innerWidth || 1200;
        if (w < 600) colCount.value = 1;
        else if (w < 900) colCount.value = 2;
        else colCount.value = 3;
      } catch {
        colCount.value = 3;
      }
    }

    const masonryItems = computed<GalleryItem[]>(() => {
      const base = filteredItems.value.slice(0, masonryLoadedCount.value);
      const cols = Math.max(1, colCount.value || 3);
      if (cols === 1) return base;
      const reordered: GalleryItem[] = [];
      for (let c = 0; c < cols; c++) {
        for (let i = c; i < base.length; i += cols) {
          reordered.push(base[i]);
        }
      }
      return reordered;
    });

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

    function variantCandidates(id: string, variant: 'after' | 'before' | 'thumb', sizes: Array<'sm' | 'md' | 'lg' | ''> = ['sm','md','lg','']): string[] {
      const varBase = '/assets/photography/variants/';
      const s = slug(id);
      const bases = unique([s, s.replace(/-/g, '_'), s.replace(/_/g, '-')]);
      const v = variant === 'thumb' ? 'after' : variant;
      const namePatterns: string[] = [];
      bases.forEach((b) => {
        sizes.forEach((sz) => {
          const suf = sz ? `-${sz}` : '';
          namePatterns.push(`${b}_${v}${suf}`);
          namePatterns.push(`${b}-${v}${suf}`);
        });
      });
      const exts = ['.webp', '.jpg', '.jpeg', '.png'];
      const urls: string[] = [];
      namePatterns.forEach((n) => {
        exts.forEach((ext) => urls.push(varBase + n + ext));
      });
      return urls;
    }

    function variantFromBasename(base: string, sizes: Array<'sm'|'md'|'lg'|''> = ['sm','md','lg','']): string[] {
      const varBase = '/assets/photography/variants/';
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

    function originalCandidates(id: string, variant: 'after' | 'before'): string[] {
      const baseA = '/assets/photography/';
      const baseB = '/assets/photography/originals/';
      const s = slug(id);
      const bases = unique([s, s.replace(/-/g, '_'), s.replace(/_/g, '-')]);
      const v = variant;
      const namePatterns: string[] = [];
      bases.forEach((b) => {
        namePatterns.push(`${b}_${v}`);
        namePatterns.push(`${b}-${v}`);
      });
      const exts = ['.jpg', '.jpeg', '.png', '.webp'];
      const urls: string[] = [];
      namePatterns.forEach((n) => {
        exts.forEach((ext) => {
          urls.push(baseB + n + ext);
          urls.push(baseA + n + ext);
        });
      });
      return urls;
    }

    function pickVariant(id: string, variant: 'after' | 'before' | 'thumb', preferred: Array<'sm'|'md'|'lg'|''>) {
      return unique(variantCandidates(id, variant, preferred));
    }

    function resetMasonryLoad() {
      masonryLoadedCount.value = masonryBatchSize;
    }

    function openModal(index: number) {
      lastScrollY = window.scrollY;
      lastFocusEl.value = (document.activeElement as HTMLElement) || null;
      activeIndex.value = index;
      modalOpen.value = true;
      // Preload both images to compute a common modal ratio based on the smaller resolution
      try {
        const item = filteredItems.value[index];
        if (!item) return;
        const urls = [item.afterSrc, item.beforeSrc || ''].filter(Boolean) as string[];
        if (urls.length === 0) return;
        const dims: Array<{ w: number; h: number }> = [];
        let remaining = urls.length;
        urls.forEach((src) => {
          const img = new Image();
          (img as any).decoding = 'async';
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              dims.push({ w: img.naturalWidth, h: img.naturalHeight });
            }
            remaining -= 1;
            if (remaining === 0 && dims.length > 0) {
              // Pick the smaller by pixel area, use its aspect ratio
              const small = dims.reduce((a, b) => (a.w * a.h <= b.w * b.h ? a : b));
              modalRatio.value = small.w / small.h;
            }
          };
          img.src = src;
        });
      } catch {}
      void nextTick(() => {
        const closeBtn = document.querySelector('.pg-modal__close') as HTMLButtonElement | null;
        if (closeBtn) closeBtn.focus();
      });
    }

    function closeModal() {
      modalOpen.value = false;
      activeIndex.value = -1;
      // Restore scroll and focus
      requestAnimationFrame(() => {
        window.scrollTo({ top: lastScrollY });
        if (lastFocusEl.value) lastFocusEl.value.focus({ preventScroll: true });
      });
    }

    watch(modalOpen, (open) => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.removeProperty('overflow');
      }
    });

    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && modalOpen.value) {
        e.preventDefault();
        closeModal();
      }
    }

    onMounted(() => {
      computeColCount();
      window.addEventListener('resize', computeColCount);
      // Reveal animation for cards
      const el = root.value;
      if (!el) return;
      const cards = Array.from(el.querySelectorAll('.pg-card')) as HTMLElement[];
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('is-visible');
              obs.unobserve(e.target);
            }
          });
        },
        { rootMargin: '100px 0px', threshold: 0.2 }
      );
      cards.forEach((c) => obs.observe(c));

      // ESC to close modal
      window.addEventListener('keydown', onKeydown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('resize', computeColCount);
    });

    // Ensure cards re-appear on filter change (immediate reveal)
    watch(filteredItems, async () => {
      resetMasonryLoad();
      await nextTick();
      const el = root.value;
      if (!el) return;
      const cards = Array.from(el.querySelectorAll('.pg-card, .pg-masonry__item')) as HTMLElement[];
      cards.forEach((c) => c.classList.add('is-visible'));
      // Reset active index if out of range
      if (activeIndex.value >= filteredItems.value.length) activeIndex.value = -1;
      // Scroll top of masonry
      const mason = el.querySelector('.pg-masonry') as HTMLElement | null;
      if (mason) mason.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Masonry infinite loader
    function attachMasonryInfinite(container: HTMLElement, sentinel: HTMLElement) {
      let loading = false;
      let lastLoadTs = 0;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load next batch
              const now = Date.now();
              if (loading || now - lastLoadTs < 250) return;
              if (masonryLoadedCount.value < filteredItems.value.length) {
                loading = true;
                masonryLoadedCount.value = Math.min(masonryLoadedCount.value + masonryBatchSize, filteredItems.value.length);
                lastLoadTs = now;
                // Prefetch next 3 thumbnails
                const nextStart = masonryLoadedCount.value;
                const nextItems = filteredItems.value.slice(nextStart, nextStart + 3);
                requestIdleCallback?.(() => {
                  nextItems.forEach((n) => {
                    const src = n.thumb || n.afterSrc;
                    if (src) {
                      const im = new Image();
                      (im as any).decoding = 'async';
                      im.src = src;
                    }
                  });
                });
                setTimeout(() => (loading = false), 10);
              }
            }
          });
        },
        { root: null, rootMargin: '800px 0px', threshold: 0 }
      );
      io.observe(sentinel);

      // Reveal observer for masonry items
      const reveal = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('is-visible');
              reveal.unobserve(e.target);
            }
          });
        },
        { rootMargin: '120px 0px', threshold: 0.1 }
      );
      Array.from(container.querySelectorAll('.pg-masonry__item')).forEach((it) =>
        reveal.observe(it as HTMLElement)
      );
    }

    return () => {
      // Header
      const header = h('header', { class: 'pg__header', role: 'region', 'aria-labelledby': 'pg-title' }, [
        h('div', { class: 'pg__header-inner' }, [
          h('h2', { id: 'pg-title', class: 'pg__title' }, props.title),
          h('span', { class: 'pg__count', 'data-count': '', role: 'status', 'aria-live': 'polite' }, String(visibleCount.value)),
        ]),
      ]);

      // Filters (pills)
      const pills = [
        h(
          'button',
          {
            class: 'pg-pill' + (activeFilter.value === 'all' ? ' is-active' : ''),
            'data-filter': 'all',
            'aria-pressed': String(activeFilter.value === 'all'),
            onClick: () => (activeFilter.value = 'all'),
          },
          'All'
        ),
        ...categories.value.map((cat) =>
          h(
            'button',
            {
              class: 'pg-pill' + (activeFilter.value === cat.slug ? ' is-active' : ''),
              'data-filter': cat.slug,
              'aria-pressed': String(activeFilter.value === cat.slug),
              onClick: () => (activeFilter.value = cat.slug),
            },
            cat.label
          )
        ),
      ];
      const filters = h('nav', { class: 'pg__filters', 'aria-label': 'Photo filters' }, pills);

      // Masonry
      const masonrySentinel = h('div', {
        class: 'pg-masonry__sentinel',
        onVnodeMounted: (v: any) => {
          const container = (v.el as HTMLElement).parentElement as HTMLElement | null;
          if (container) attachMasonryInfinite(container, v.el as HTMLElement);
        },
      });

      // Slight randomization to desynchronize columns: offset + pad
      function hashToRange(id: string, min: number, max: number): number {
        let h = 0;
        for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
        const r = (h % 1000) / 1000;
        return min + r * (max - min);
      }

      const masonry = h('section', { class: 'pg-masonry', role: 'list', 'aria-label': 'Masonry gallery' },
        masonryItems.value.map((it, idx) => {
          const ratio = (hashToRange(it.id + 'r', 0.85, 1.35)).toFixed(2); // aspect ratio variety
          return h('article', { key: it.id + '-' + idx, class: 'pg-masonry__item', role: 'listitem', 'aria-label': it.title, style: `--m-ratio:${ratio};` }, [
            h('div', {
              class: 'pg-masonry__media',
              role: 'button',
              tabindex: 0,
              'aria-label': `Open ${it.title} in fullscreen`,
              onVnodeMounted: (v: any) => {
                const el = v.el as HTMLElement;
                // mark as loading to show skeleton until image load
                el.classList.add('is-loading');
              },
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(idx);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  const rootEl = root.value;
                  if (!rootEl) return;
                  const list = Array.from(rootEl.querySelectorAll('.pg-masonry__media')) as HTMLElement[];
                  const current = e.currentTarget as HTMLElement;
                  const i = list.indexOf(current);
                  if (i === -1) return;
                  if (e.key === 'ArrowRight' && i < list.length - 1) list[i + 1].focus();
                  if (e.key === 'ArrowLeft' && i > 0) list[i - 1].focus();
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    const r = current.getBoundingClientRect();
                    const targetY = r.top + (e.key === 'ArrowDown' ? r.height + 8 : -8);
                    let best = i;
                    let bestDist = Number.POSITIVE_INFINITY;
                    list.forEach((el, idx2) => {
                      if (idx2 === i) return;
                      const rr = el.getBoundingClientRect();
                      const dy = rr.top - targetY;
                      if ((e.key === 'ArrowDown' && dy >= 0) || (e.key === 'ArrowUp' && dy <= 0)) {
                        const dist = Math.abs(dy) + Math.abs(rr.left - r.left);
                        if (dist < bestDist) {
                          bestDist = dist;
                          best = idx2;
                        }
                      }
                    });
                    if (best !== i) list[best].focus();
                  }
                }
              },
              onMousedown: (ev: MouseEvent) => {
                const el = ev.currentTarget as HTMLElement;
                el.dataset.startX = String(ev.clientX);
                el.dataset.startY = String(ev.clientY);
                el.dataset.moved = '0';
              },
              onMousemove: (ev: MouseEvent) => {
                const el = ev.currentTarget as HTMLElement;
                if (!el.dataset.startX) return;
                const dx = Math.abs(ev.clientX - Number(el.dataset.startX));
                const dy = Math.abs(ev.clientY - Number(el.dataset.startY));
                if (dx + dy > 6) el.dataset.moved = '1';
              },
              onMouseup: (ev: MouseEvent) => {
                const el = ev.currentTarget as HTMLElement;
                const moved = el.dataset.moved === '1';
                el.dataset.startX = '';
                el.dataset.startY = '';
                el.dataset.moved = '';
                if (!moved) openModal(idx);
              },
              onClick: (ev: MouseEvent) => {
                // Guard against some browsers firing click after mouseup drag
                const el = ev.currentTarget as HTMLElement;
                if (el.dataset.moved === '1') {
                  ev.preventDefault();
                  ev.stopPropagation();
                }
              },
            }, [
              h('div', { class: 'pg-skel' }),
              h('img', {
                class: 'pg-masonry__img',
                alt: it.alt || it.title,
                loading: 'lazy',
                decoding: 'async',
                src: unique([
                  it.thumb || '',
                  ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['sm','md','lg','']),
                  ...pickVariant(it.id, 'after', ['sm','md','lg','']),
                  ...originalCandidates(it.id, 'after'),
                  it.afterSrc || '',
                ])[0],
                srcset: unique([
                  ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['sm','md','lg']),
                  ...pickVariant(it.id, 'after', ['sm','md','lg']),
                ]).map((u) => {
                  if (u.includes('-sm.')) return `${u} 640w`;
                  if (u.includes('-md.')) return `${u} 1200w`;
                  if (u.includes('-lg.')) return `${u} 1920w`;
                  return `${u} 2560w`;
                }).join(', '),
                sizes: '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 92vw',
                'data-cand': JSON.stringify(
                  unique([
                    it.thumb || '',
                    ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['md','lg','']),
                    ...pickVariant(it.id, 'after', ['md','lg','']),
                    ...originalCandidates(it.id, 'after'),
                    it.afterSrc || '',
                  ]).slice(1)
                ),
                onLoad: (e: Event) => {
                  const img = e.target as HTMLImageElement;
                  const media = img.parentElement as HTMLElement | null;
                  if (img && media) {
                    media.classList.remove('is-loading');
                    if (img.naturalWidth && img.naturalHeight) {
                      const r = (img.naturalWidth / img.naturalHeight).toFixed(2);
                      media.style.setProperty('--m-ratio', r);
                    }
                  }
                },
                onError: (e: Event) => {
                  const img = e.target as HTMLImageElement;
                  const media = img.parentElement as HTMLElement | null;
                  if (media) media.classList.remove('is-loading');
                  try {
                    const list = JSON.parse(img.getAttribute('data-cand') || '[]') as string[];
                    const next = list.shift();
                    if (next) {
                      img.setAttribute('data-cand', JSON.stringify(list));
                      img.src = next;
                      return;
                    }
                  } catch {}
                  img.style.opacity = '0.6';
                },
              }),
              h('div', { class: 'pg-masonry__title' }, it.title),
              h('button', {
                class: 'pg-masonry__fs',
                type: 'button',
                'aria-label': `Open ${it.title} fullscreen`,
                onClick: (ev: MouseEvent) => {
                  ev.stopPropagation();
                  openModal(idx);
                },
              }, '⤢'),
            ]),
          ]);
        }).concat([masonrySentinel])
      );

      // Modal
      const active = activeIndex.value >= 0 ? filteredItems.value[activeIndex.value] : null;
      const modal = h(
        'div',
        { class: 'pg-modal', 'data-modal': '', hidden: !modalOpen.value, 'aria-hidden': String(!modalOpen.value), role: 'dialog', 'aria-label': 'Photo fullscreen' },
        [
          h('div', { class: 'pg-modal__backdrop', 'data-close': '', onClick: closeModal }),
          h('div', { class: 'pg-modal__content', role: 'document' }, [
            h('button', { class: 'pg-modal__close', type: 'button', 'aria-label': 'Close', 'data-close': '', onClick: closeModal }, '\u00d7'),
            h(
              'div',
              { class: 'pg-modal__view', 'data-view': '', style: `--m-ratio: ${modalRatio.value || 1}` },
              active
                ? [
                    active.beforeSrc
                      ? h(BeforeAfterSlider, {
                          afterSrc: unique([
                            ...variantFromBasename(fileBaseFromPath(active.afterSrc), ['lg','md','', 'sm']),
                            ...pickVariant(active.id, 'after', ['lg','md','', 'sm']),
                            ...originalCandidates(active.id, 'after'),
                            active.afterSrc,
                          ])[0],
                          beforeSrc: unique([
                            ...variantFromBasename(fileBaseFromPath(active.beforeSrc), ['lg','md','', 'sm']),
                            ...pickVariant(active.id, 'before', ['lg','md','', 'sm']),
                            ...originalCandidates(active.id, 'before'),
                            active.beforeSrc,
                          ])[0],
                          alt: active.alt || active.title,
                          initialSplit: 0.75,
                        })
                      : h('img', {
                          class: 'pg-modal__img',
                          'data-single': '',
                          alt: active.alt || active.title,
                          src: unique([
                            ...variantFromBasename(fileBaseFromPath(active.afterSrc), ['lg','md','', 'sm']),
                            ...pickVariant(active.id, 'after', ['lg','md','', 'sm']),
                            ...originalCandidates(active.id, 'after'),
                            active.afterSrc,
                          ])[0],
                          onLoad: (e: Event) => {
                            const img = e.target as HTMLImageElement;
                            if (img.naturalWidth && img.naturalHeight) {
                              modalRatio.value = img.naturalWidth / img.naturalHeight;
                            }
                          },
                        }),
                  ]
                : []
            ),
            h('figcaption', { class: 'pg-modal__cap' }, active ? `${active.title}${active.description ? ' — ' + active.description : ''}` : ''),
          ]),
        ]
      );

      return h('div', { ref: root }, [header, filters, masonry, modal]);
    };

  },
});


