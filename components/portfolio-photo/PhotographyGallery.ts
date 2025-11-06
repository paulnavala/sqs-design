import { defineComponent, h, PropType, ref, computed, onMounted, watch } from 'vue';
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

    const normalizedItems = computed<PhotoItem[]>(() =>
      (props.items || []).map((it) => ({
        ...it,
        categories: (it.categories || []).map((c) => slug(c)).filter(Boolean),
      }))
    );

    const categories = computed<string[]>(() => {
      const set = new Set<string>();
      normalizedItems.value.forEach((i) => (i.categories || []).forEach((c) => set.add(c)));
      return Array.from(set).sort();
    });

    const filteredItems = computed<PhotoItem[]>(() => {
      if (activeFilter.value === 'all') return normalizedItems.value;
      return normalizedItems.value.filter((i) => (i.categories || []).includes(activeFilter.value));
    });

    const visibleCount = computed<number>(() => filteredItems.value.length);

    function openModal(index: number) {
      activeIndex.value = index;
      modalOpen.value = true;
    }

    function closeModal() {
      modalOpen.value = false;
      activeIndex.value = -1;
    }

    watch(modalOpen, (open) => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.removeProperty('overflow');
      }
    });

    onMounted(() => {
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
    });

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
              class: 'pg-pill' + (activeFilter.value === cat ? ' is-active' : ''),
              'data-filter': cat,
              'aria-pressed': String(activeFilter.value === cat),
              onClick: () => (activeFilter.value = cat),
            },
            cat
          )
        ),
      ];
      const filters = h('nav', { class: 'pg__filters', 'aria-label': 'Photo filters' }, pills);

      // List of cards
      const list = h(
        'ul',
        { id: 'pg-list', class: 'pg__list', 'aria-live': 'polite' },
        filteredItems.value.map((it, idx) =>
          h('li', { key: it.id, class: 'pg-card', 'data-categories': (it.categories || []).join(' ') }, [
            h('div', { class: 'pg-card__content' }, [
              h('div', { class: 'pg-card__left' }, [
                h('h3', { class: 'pg-card__title' }, it.title),
                it.description ? h('p', { class: 'pg-card__desc' }, it.description) : null,
                h('div', { class: 'pg-card__meta' }, [h('span', { class: 'pg-card__year' }, String(it.year))]),
                h(
                  'button',
                  {
                    class: 'pg-card__btn btn--fullscreen',
                    type: 'button',
                    onClick: () => openModal(idx),
                  },
                  'View fullscreen'
                ),
              ]),
              h('div', { class: 'pg-card__right' }, [
                h('div', { class: 'pg-card__media' }, [
                  h('img', {
                    class: 'pg-card__img',
                    alt: it.alt || it.title,
                    loading: 'lazy',
                    src: it.thumb || it.afterSrc,
                    onClick: () => openModal(idx),
                    onLoad: (e: Event) => {
                      const img = e.target as HTMLImageElement;
                      const media = img.parentElement as HTMLElement | null;
                      if (img && media && img.naturalWidth && img.naturalHeight) {
                        const ratio = img.naturalWidth / img.naturalHeight;
                        media.style.setProperty('--pg-preview-ratio', String(ratio));
                      }
                    },
                  }),
                ]),
              ]),
            ]),
          ])
        )
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
              { class: 'pg-modal__view', 'data-view': '' },
              active
                ? [
                    active.beforeSrc
                      ? h(BeforeAfterSlider, {
                          afterSrc: active.afterSrc,
                          beforeSrc: active.beforeSrc,
                          alt: active.alt || active.title,
                          initialSplit: 0.5,
                        })
                      : h('img', { class: 'pg-modal__img', 'data-single': '', alt: active.alt || active.title, src: active.afterSrc }),
                  ]
                : []
            ),
            h('figcaption', { class: 'pg-modal__cap' }, active ? `${active.title}${active.description ? ' — ' + active.description : ''}` : ''),
          ]),
        ]
      );

      return h(
        'div',
        { ref: root },
        [header, filters, list, modal]
      );
    };
  },
});


