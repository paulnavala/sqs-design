import { defineComponent, h, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'PrototypeShowcase',
  props: {
    figmaUrl: { type: String, default: '' },
    title: { type: String, default: 'Prototype' },
  },
  setup(props) {
    const isInView = ref(false);
    const isLoading = ref(true);
    const showFallback = ref(false);
    const frameRef = ref<HTMLIFrameElement | null>(null);

    onMounted(() => {
      const container = (frameRef.value?.parentElement?.parentElement || document.body) as Element;
      if ('IntersectionObserver' in window && container) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              isInView.value = true;
              io.disconnect();
            }
          });
        }, { threshold: 0.15 });
        io.observe(container);
      } else {
        isInView.value = true;
      }

      // Fallback timer if iframe doesn't load
      const timer = setTimeout(() => {
        if (isLoading.value) showFallback.value = true;
      }, 4000);

      frameRef.value?.addEventListener('load', () => {
        isLoading.value = false;
        showFallback.value = false;
        clearTimeout(timer);
      });
    });

    function openNewTab() {
      if (typeof (window as any).plausible === 'function') {
        (window as any).plausible('Prototype – View Fullscreen');
      }
      if (props.figmaUrl) window.open(props.figmaUrl, '_blank', 'noopener');
    }

    return () => h('section', { class: 'tw-grid tw-gap-3 tw-items-start tw-text-gray-900' }, [
      h('div', {
        class: 'tw-relative tw-w-full tw-rounded-2xl tw-overflow-hidden tw-bg-gray-100 tw-border tw-border-gray-200 tw-shadow-xl',
        style: 'padding-bottom:71.1%'
      }, [
        h('iframe', {
          ref: (el: any) => (frameRef.value = el as HTMLIFrameElement),
          class: 'tw-absolute tw-inset-0 tw-w-full tw-h-full tw-border-0',
          title: props.title,
          loading: 'lazy',
          allow: 'fullscreen; clipboard-write',
          allowFullscreen: true,
          src: isInView.value && props.figmaUrl ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(props.figmaUrl)}` : undefined,
        } as any),
        // Chip
        h('button', {
          class: 'tw-absolute tw-right-3 tw-bottom-3 tw-inline-flex tw-items-center tw-gap-2 tw-text-white tw-text-sm tw-px-3 tw-py-2 tw-rounded-full tw-border tw-border-white/30 tw-bg-black/45 hover:tw-bg-black/60 tw-shadow-lg',
          type: 'button',
          onClick: openNewTab,
        }, ['Open fullscreen', h('span', { class: 'tw-text-base' }, '↗')]),
        // Spinner overlay
        isLoading.value ? h('div', { class: 'tw-absolute tw-inset-0 tw-grid tw-place-items-center tw-pointer-events-none' }, [
          h('div', { class: 'tw-w-7 tw-h-7 tw-rounded-full tw-border-2 tw-border-black/20 tw-border-t-gray-600', style: 'animation: ps-spin 0.9s linear infinite' }),
        ]) : null,
        // Fallback text
        showFallback.value ? h('p', { class: 'tw-absolute tw-inset-x-0 tw-bottom-2 tw-text-center tw-text-gray-600 tw-text-sm tw-pointer-events-none' }, `Couldn't load the embedded prototype.`) : null,
        h('style', `@keyframes ps-spin{to{transform:rotate(360deg)}}`),
      ]),
    ]);
  },
});


