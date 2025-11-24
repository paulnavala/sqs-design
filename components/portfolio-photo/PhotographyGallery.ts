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
    const modalOpen = ref(false);
    const activeIndex = ref<number>(-1);
    const lastFocusEl = ref<HTMLElement | null>(null);
    let lastScrollY = 0;
    const modalRatio = ref<number>(1);



    const visibleCount = computed<number>(() => normalizedItems.value.length);

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

    const masonryItems = computed<Array<{ item: GalleryItem; originalIndex: number }>>(() => {
      const base = normalizedItems.value.slice(0, masonryLoadedCount.value);
      const cols = Math.max(1, colCount.value || 3);
      if (cols === 1) {
        return base.map((item, idx) => ({ item, originalIndex: idx }));
      }
      const reordered: Array<{ item: GalleryItem; originalIndex: number }> = [];
      for (let c = 0; c < cols; c++) {
        for (let i = c; i < base.length; i += cols) {
          reordered.push({ item: base[i], originalIndex: i });
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

    function variantCandidates(id: string, variant: 'after' | 'before' | 'thumb', sizes: Array<'sm' | 'md' | 'lg' | ''> = ['sm', 'md', 'lg', '']): string[] {
      const varBase = 'https://assets.peachless.design/assets/photography/variants/';
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

    function variantFromBasename(base: string, sizes: Array<'sm' | 'md' | 'lg' | ''> = ['sm', 'md', 'lg', '']): string[] {
      const varBase = 'https://assets.peachless.design/assets/photography/variants/';
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
      const baseA = 'https://assets.peachless.design/assets/photography/';
      const baseB = 'https://assets.peachless.design/assets/photography/originals/';
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

    function pickVariant(id: string, variant: 'after' | 'before' | 'thumb', preferred: Array<'sm' | 'md' | 'lg' | ''>) {
      return unique(variantCandidates(id, variant, preferred));
    }

    type GalleryItem = PhotoItem & {
      categorySlugs: string[];
      categoryLabels: string[];
      // Pre-calculated URLs
      src: string;
      srcset: string;
      candidates: string;
      modalAfter: string;
      modalBefore: string;
    };

    const normalizedItems = computed<GalleryItem[]>(() =>
      (props.items || []).map((it) => {
        const labels = (it.categories || []).filter(Boolean);
        const slugs = labels.map((c) => slug(c)).filter(Boolean);

        // Pre-calculate masonry image props
        const masonrySrc = unique([
          it.thumb || '',
          ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['sm', 'md', 'lg', '']),
          ...pickVariant(it.id, 'after', ['sm', 'md', 'lg', '']),
          ...originalCandidates(it.id, 'after'),
          it.afterSrc || '',
        ])[0];

        const masonrySrcset = unique([
          ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['sm', 'md', 'lg']),
          ...pickVariant(it.id, 'after', ['sm', 'md', 'lg']),
        ]).map((u) => {
          if (u.includes('-sm.')) return `${u} 640w`;
          if (u.includes('-md.')) return `${u} 1200w`;
          if (u.includes('-lg.')) return `${u} 1920w`;
          return `${u} 2560w`;
        }).join(', ');

        const candidates = JSON.stringify(
          unique([
            it.thumb || '',
            ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['md', 'lg', '']),
            ...pickVariant(it.id, 'after', ['md', 'lg', '']),
            ...originalCandidates(it.id, 'after'),
            it.afterSrc || '',
          ]).slice(1)
        );

        // Pre-calculate modal image props
        const modalAfter = unique([
          ...variantFromBasename(fileBaseFromPath(it.afterSrc), ['lg', 'md', '', 'sm']),
          ...pickVariant(it.id, 'after', ['lg', 'md', '', 'sm']),
          ...originalCandidates(it.id, 'after'),
          it.afterSrc,
        ])[0];

        const modalBefore = it.beforeSrc ? unique([
          ...variantFromBasename(fileBaseFromPath(it.beforeSrc), ['lg', 'md', '', 'sm']),
          ...pickVariant(it.id, 'before', ['lg', 'md', '', 'sm']),
          ...originalCandidates(it.id, 'before'),
          it.beforeSrc,
        ])[0] : '';

        return {
          ...(it as PhotoItem),
          categoryLabels: labels,
          categorySlugs: slugs,
          src: masonrySrc,
          srcset: masonrySrcset,
          candidates,
          modalAfter,
          modalBefore
        } as GalleryItem;
      })
    );

    function resetMasonryLoad() {
      masonryLoadedCount.value = masonryBatchSize;
    }

    async function openModal(index: number) {
      modalRatio.value = 1;
      lastScrollY = window.scrollY;
      lastFocusEl.value = (document.activeElement as HTMLElement) || null;
      activeIndex.value = index;
      modalOpen.value = true; // Open immediately

      void nextTick(() => {
        const closeBtn = document.querySelector('.pg-modal__close') as HTMLButtonElement | null;
        if (closeBtn) closeBtn.focus();
      });

      // Calculate aspect ratio in background
      try {
        const item = normalizedItems.value[index];
        if (!item) return;
        const urls = [item.modalAfter, item.modalBefore].filter(Boolean) as string[];
        if (urls.length === 0) return;

        const dims: Array<{ w: number; h: number }> = [];
        await Promise.all(
          urls.map((src) => {
            return new Promise<void>((resolve) => {
              const img = new Image();
              (img as any).decoding = 'async';
              img.onload = () => {
                if (img.naturalWidth && img.naturalHeight) {
                  dims.push({ w: img.naturalWidth, h: img.naturalHeight });
                }
                resolve();
              };
              img.onerror = () => resolve();
              img.src = src;
            });
          })
        );

        if (dims.length > 0) {
          const small = dims.reduce((a, b) => (a.w * a.h <= b.w * b.h ? a : b));
          modalRatio.value = small.w / small.h;
        }
      } catch {
        // keep default
      }
    }

    function closeModal() {
      modalOpen.value = false;
      modalRatio.value = 1;
      activeIndex.value = -1;
      // Restore scroll and focus
      requestAnimationFrame(() => {
        window.scrollTo({ top: lastScrollY });
        if (lastFocusEl.value) lastFocusEl.value.focus({ preventScroll: true });
      });
    }

    type ScrollLockState = { applied: boolean; overflow: string; paddingRight: string };
    const scrollLockState: ScrollLockState = { applied: false, overflow: '', paddingRight: '' };

    watch(modalOpen, (open) => {
      const body = document.body;
      if (!body) return;
      if (open) {
        if (!scrollLockState.applied) {
          scrollLockState.overflow = body.style.overflow || '';
          scrollLockState.paddingRight = body.style.paddingRight || '';
        }
        const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
        body.style.overflow = 'hidden';
        if (scrollbar > 0) {
          body.style.paddingRight = `${scrollbar}px`;
        } else {
          body.style.removeProperty('padding-right');
        }
        scrollLockState.applied = true;
      } else if (scrollLockState.applied) {
        if (scrollLockState.overflow) body.style.overflow = scrollLockState.overflow;
        else body.style.removeProperty('overflow');
        if (scrollLockState.paddingRight) body.style.paddingRight = scrollLockState.paddingRight;
        else body.style.removeProperty('padding-right');
        scrollLockState.applied = false;
      }
    });

    function nextPhoto() {
      if (activeIndex.value < 0) return;
      activeIndex.value = (activeIndex.value + 1) % normalizedItems.value.length;
      modalRatio.value = 1;
      openModal(activeIndex.value);
    }

    function prevPhoto() {
      if (activeIndex.value < 0) return;
      activeIndex.value = (activeIndex.value - 1 + normalizedItems.value.length) % normalizedItems.value.length;
      modalRatio.value = 1;
      openModal(activeIndex.value);
    }

    function onKeydown(e: KeyboardEvent) {
      if (!modalOpen.value) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPhoto();
      }
    }

    // Reveal observer
    let revealObserver: IntersectionObserver | null = null;

    onMounted(() => {
      computeColCount();
      let resizeTimer: any = null;
      const onResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(computeColCount, 100);
      };
      window.addEventListener('resize', onResize);

      // Setup reveal observer
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('is-visible');
              revealObserver?.unobserve(e.target);
            }
          });
        },
        { rootMargin: '100px 0px', threshold: 0.1 }
      );

      // ESC to close modal
      window.addEventListener('keydown', onKeydown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('resize', computeColCount);
      if (revealObserver) revealObserver.disconnect();
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
              if (masonryLoadedCount.value < normalizedItems.value.length) {
                loading = true;
                masonryLoadedCount.value = Math.min(masonryLoadedCount.value + masonryBatchSize, normalizedItems.value.length);
                lastLoadTs = now;
                // Prefetch next 3 thumbnails
                const nextStart = masonryLoadedCount.value;
                const nextItems = normalizedItems.value.slice(nextStart, nextStart + 3);
                const schedulePrefetch = (cb: () => void) => {
                  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
                    window.requestIdleCallback(cb);
                  } else {
                    setTimeout(cb, 0);
                  }
                };
                schedulePrefetch(() => {
                  nextItems.forEach((n) => {
                    const src = n.src;
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
    }

    return () => {
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
          const ratio = (hashToRange(it.item.id + 'r', 0.85, 1.35)).toFixed(2); // aspect ratio variety
          return h('article', {
            key: it.item.id + '-' + idx,
            class: 'pg-masonry__item',
            role: 'listitem',
            'aria-label': it.item.title,
            style: `--m-ratio:${ratio};`,
            onVnodeMounted: (v: any) => {
              if (revealObserver && v.el) revealObserver.observe(v.el as HTMLElement);
            }
          }, [
            h('div', {
              class: 'pg-masonry__media',
              role: 'button',
              tabindex: 0,
              'aria-label': `Open ${it.item.title} in fullscreen`,
              onVnodeMounted: (v: any) => {
                const el = v.el as HTMLElement;
                // mark as loading to show skeleton until image load
                el.classList.add('is-loading');
              },
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(it.originalIndex);
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
                if (!moved) openModal(it.originalIndex);
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
                alt: it.item.alt || it.item.title,
                decoding: 'async',
                src: it.item.src,
                srcset: it.item.srcset,
                sizes: '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 92vw',
                'data-cand': it.item.candidates,
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
                  } catch { }
                  img.style.opacity = '0.6';
                },
              }),
              h('div', { class: 'pg-masonry__title' }, it.item.title),
              h('button', {
                class: 'pg-masonry__fs',
                type: 'button',
                'aria-label': `Open ${it.item.title} fullscreen`,
                onClick: (ev: MouseEvent) => {
                  ev.stopPropagation();
                  openModal(it.originalIndex);
                },
              }, '⤢'),
            ]),
          ]);
        }).concat([masonrySentinel])
      );

      // Modal
      const active = activeIndex.value >= 0 ? normalizedItems.value[activeIndex.value] : null;
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
                      afterSrc: active.modalAfter,
                      beforeSrc: active.modalBefore,
                      alt: active.alt || active.title,
                      initialSplit: 0.75,
                    })
                    : h('img', {
                      class: 'pg-modal__img',
                      'data-single': '',
                      alt: active.alt || active.title,
                      src: active.modalAfter,
                    }),
                ]
                : []
            ),
          ]),
        ]
      );

      return h('div', { ref: root }, [masonry, modal]);
    };
  },
});


