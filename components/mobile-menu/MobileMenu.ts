import { defineComponent, h, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { trapFocus } from '../_shared/dom';

type LinkItem = { href: string; text: string };

export default defineComponent({
  name: 'MobileMenu',
  setup() {
    const isOpen = ref(false);
    const brand = ref('');
    const links = ref<LinkItem[]>([]);
    const panelRef = ref<HTMLElement | null>(null);
    let cleanupTrap: null | (() => void) = null;
    let toggleBtn: HTMLElement | null = null;
    let mq: MediaQueryList | null = null;

    function close() { isOpen.value = false; }
    function open() { isOpen.value = true; }

    function gather() {
      const d = document;
      const header = (d.querySelector('header') || d.querySelector('[role="banner"]') || d.body) as HTMLElement;
      let aList = Array.from(header.querySelectorAll('a[href]:not([href^="#"])')) as HTMLAnchorElement[];
      if (!aList.length) aList = Array.from(d.querySelectorAll('nav a[href]:not([href^="#"])')) as HTMLAnchorElement[];
      const uniq = new Map<string, HTMLAnchorElement>();
      aList.forEach((a) => {
        try {
          const u = new URL(a.href, location.origin);
          const key = u.pathname + (u.hash || '');
          if (!uniq.has(key)) uniq.set(key, a);
        } catch {}
      });
      links.value = Array.from(uniq.values()).map((a) => ({
        href: a.href,
        text: a.textContent?.trim() || a.getAttribute('aria-label') || a.href,
      }));
      const siteTitle = header.querySelector('.site-title, .header-title, .Header-title') as HTMLElement | null;
      brand.value = (siteTitle?.textContent?.trim() || document.title || '').replace(/\s*\|.*$/, '');
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen.value) { e.preventDefault(); close(); }
    };

    onMounted(() => {
      const d = document;
      const header = (d.querySelector('header') || d.querySelector('[role="banner"]') || d.body) as HTMLElement;
      const toggleSelectors = [
        'button[aria-controls*="Nav"]',
        'button[aria-expanded]',
        '.header-menu-toggle',
        '.Mobile-bar button',
        '.header-burger',
      ];
      for (const sel of toggleSelectors) {
        const candidate = header.querySelector(sel) as HTMLElement | null;
        if (candidate) { toggleBtn = candidate; break; }
      }
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          isOpen.value ? close() : open();
        });
      }
      gather();
      mq = window.matchMedia('(min-width: 901px)');
      const onChange = () => { if (mq && mq.matches && isOpen.value) close(); };
      mq.addEventListener?.('change', onChange);
      document.addEventListener('keydown', onEsc);
      onUnmounted(() => {
        if (mq) mq.removeEventListener?.('change', onChange as any);
      });
    });

    watch(isOpen, async (openNow) => {
      const d = document;
      if (openNow) {
        d.documentElement.classList.add('mmx-locked', 'mmx-open');
        d.body.classList.add('mmx-locked', 'mmx-open');
        await nextTick();
        if (panelRef.value) {
          cleanupTrap = trapFocus(panelRef.value, 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
          const first = panelRef.value.querySelector('a,button') as HTMLElement | null;
          first?.focus({ preventScroll: true } as any);
        }
      } else {
        d.documentElement.classList.remove('mmx-locked', 'mmx-open');
        d.body.classList.remove('mmx-locked', 'mmx-open');
        if (cleanupTrap) { cleanupTrap(); cleanupTrap = null; }
        toggleBtn?.focus?.({ preventScroll: true } as any);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', onEsc);
    });

    return () => {
      if (!isOpen.value) return h('div');
      return h('div', { class: 'tw-fixed tw-inset-0 tw-z-[9999]', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': String(!isOpen.value) }, [
        h('div', { class: 'tw-absolute tw-inset-0 tw-bg-black/60', onClick: () => close() }),
        h('div', {
          ref: (el: any) => (panelRef.value = el as HTMLElement),
          class: 'tw-relative tw-mx-auto tw-mt-10 tw-w-[min(92vw,680px)] tw-rounded-2xl tw-bg-white tw-text-gray-900 tw-shadow-2xl tw-p-6 tw-flex tw-flex-col tw-gap-4',
          role: 'document',
          'aria-label': 'Site navigation',
        }, [
          h('button', {
            class: 'tw-self-end tw-rounded-md tw-border tw-border-gray-200 tw-px-3 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-50',
            type: 'button',
            'aria-label': 'Close menu',
            onClick: () => close(),
          }, '✕'),
          h('div', { class: 'tw-text-lg tw-font-semibold tw-text-gray-900' }, brand.value),
          h('nav', { class: 'tw-flex tw-flex-col tw-gap-3' }, links.value.map((l) =>
            h('a', { href: l.href, class: 'tw-text-base tw-text-gray-900 tw-no-underline hover:tw-underline', onClick: () => close() }, l.text)
          )),
        ]),
      ]);
    };
  },
});


