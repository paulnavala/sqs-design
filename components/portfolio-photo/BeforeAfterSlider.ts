import { defineComponent, h, onMounted, onBeforeUnmount, PropType, ref } from 'vue';

export default defineComponent({
  name: 'BeforeAfterSlider',
  props: {
    afterSrc: { type: String, required: true },
    beforeSrc: { type: String, required: true },
    alt: { type: String, default: '' },
    initialSplit: { type: Number as PropType<number>, default: 0.5 }, // 0..1
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const handleEl = ref<HTMLElement | null>(null);
    const split = ref(Math.min(1, Math.max(0, props.initialSplit)));
    let dragging = false;

    function setSplitFromClientX(clientX: number) {
      const el = root.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(rect.right, Math.max(rect.left, clientX));
      const ratio = (x - rect.left) / rect.width;
      split.value = Math.min(1, Math.max(0, ratio));
      positionHandle();
    }

    function positionHandle() {
      const el = root.value;
      const h = handleEl.value;
      if (!el || !h) return;
      const rect = el.getBoundingClientRect();
      const left = rect.width * split.value;
      h.style.left = left + 'px';
    }

    function onDown(e: MouseEvent | TouchEvent) {
      dragging = true;
      document.body.style.userSelect = 'none';
      if (e instanceof TouchEvent) {
        setSplitFromClientX(e.touches[0].clientX);
      } else {
        setSplitFromClientX(e.clientX);
      }
      window.addEventListener('mousemove', onMove as any);
      window.addEventListener('mouseup', onUp as any);
      window.addEventListener('touchmove', onMove as any, { passive: false });
      window.addEventListener('touchend', onUp as any);
      e.preventDefault();
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging) return;
      if (e instanceof TouchEvent) {
        setSplitFromClientX(e.touches[0].clientX);
      } else {
        setSplitFromClientX(e.clientX);
      }
      e.preventDefault();
    }

    function onUp() {
      dragging = false;
      document.body.style.removeProperty('user-select');
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', onUp as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', onUp as any);
    }

    onMounted(() => {
      positionHandle();
      const el = root.value;
      if (el) {
        el.addEventListener('mousedown', onDown as any);
        el.addEventListener('touchstart', onDown as any, { passive: false });
      }
      window.addEventListener('resize', positionHandle);
    });

    onBeforeUnmount(() => {
      const el = root.value;
      if (el) {
        el.removeEventListener('mousedown', onDown as any);
        el.removeEventListener('touchstart', onDown as any);
      }
      window.removeEventListener('resize', positionHandle);
    });

    return () =>
      h(
        'div',
        { ref: root, class: 'pg-ba', style: 'position:relative' },
        [
          // After image (base)
          h('img', {
            class: 'pg-ba__after',
            alt: props.alt,
            src: props.afterSrc,
          }),
          // Before image clipped to split
          h('img', {
            class: 'pg-ba__before',
            alt: props.alt,
            src: props.beforeSrc,
            style: `clip-path: inset(0 ${Math.max(0, Math.min(100, (1 - split.value) * 100))}% 0 0)`
          }),
          // Visual handle
          h('div', { ref: handleEl, class: 'pg-ba__handle', style: 'left:50%' }),
        ]
      );
  },
});


