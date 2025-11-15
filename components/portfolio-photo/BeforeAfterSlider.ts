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
    const afterImg = ref<HTMLImageElement | null>(null);
    const beforeImg = ref<HTMLImageElement | null>(null);
    const split = ref(Math.min(1, Math.max(0, props.initialSplit)));
    let dragging = false;
    let clickMoved = false;

    function setSplitFromClientX(clientX: number) {
      const el = root.value;
      if (!el) return;
      
      // Get the visible image bounds from CSS variables
      const baLeft = parseFloat(el.style.getPropertyValue('--ba-left') || '0');
      const baWidth = parseFloat(el.style.getPropertyValue('--ba-width') || el.getBoundingClientRect().width);
      const rect = el.getBoundingClientRect();
      
      // Calculate position relative to visible image area
      const x = Math.min(rect.left + baLeft + baWidth, Math.max(rect.left + baLeft, clientX));
      let ratio = (x - rect.left - baLeft) / baWidth;
      
      // Snap near edges for precise before/after views
      if (ratio < 0.06) ratio = 0;
      if (ratio > 0.94) ratio = 1;
      split.value = Math.min(1, Math.max(0, ratio));
      positionHandle();
    }

    function positionHandle() {
      const el = root.value;
      const h = handleEl.value;
      if (!el || !h) return;
      
      // Get the visible image bounds from CSS variables
      const baLeft = parseFloat(el.style.getPropertyValue('--ba-left') || '0');
      const baWidth = parseFloat(el.style.getPropertyValue('--ba-width') || el.getBoundingClientRect().width);
      
      // Position handle relative to visible image area
      const left = baLeft + (baWidth * split.value);
      h.style.left = left + 'px';
      h.style.transform = 'translateX(-1px)';
      
      // Update ARIA value
      el.setAttribute('aria-valuenow', String(Math.round(split.value * 100)));
      // Edge labels fade: hide when at 0% or 100%
      if (split.value <= 0 || split.value >= 1) {
        el.classList.add('is-edge');
      } else {
        el.classList.remove('is-edge');
      }
    }

    function onDown(e: MouseEvent | TouchEvent) {
      dragging = true;
      clickMoved = false;
      document.body.style.userSelect = 'none';
      root.value?.classList.add('is-dragging');
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
      clickMoved = true;
      if (e instanceof TouchEvent) {
        setSplitFromClientX(e.touches[0].clientX);
      } else {
        setSplitFromClientX(e.clientX);
      }
      e.preventDefault();
    }

    let idleTimer: number | undefined;
    function onUp() {
      dragging = false;
      document.body.style.removeProperty('user-select');
      if (idleTimer) clearTimeout(idleTimer);
      // Keep labels hidden briefly, then fade back
      idleTimer = window.setTimeout(() => {
        root.value?.classList.remove('is-dragging');
      }, 800);
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', onUp as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', onUp as any);
    }

    function onClick() {
      if (dragging || clickMoved) return;
      const target = split.value < 0.5 ? 1 : 0;
      split.value = target;
      positionHandle();
    }

    function onKeyDown(e: KeyboardEvent) {
      const step = e.shiftKey ? 0.01 : 0.05;
      if (e.key === 'ArrowLeft') {
        split.value = Math.max(0, split.value - step);
        positionHandle();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        split.value = Math.min(1, split.value + step);
        positionHandle();
        e.preventDefault();
      } else if (e.key === 'Home') {
        split.value = 0; positionHandle(); e.preventDefault();
      } else if (e.key === 'End') {
        split.value = 1; positionHandle(); e.preventDefault();
      }
    }

    function updateMetrics() {
      const el = root.value;
      const img = afterImg.value || beforeImg.value;
      if (!el || !img) return;
      
      const cr = el.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      
      // With object-fit: contain, calculate the actual visible image bounds
      // The image rect gives us the actual rendered size
      const top = Math.max(0, ir.top - cr.top);
      const height = Math.max(0, Math.min(cr.height, ir.height));
      const left = Math.max(0, ir.left - cr.left);
      const width = Math.max(0, Math.min(cr.width, ir.width));
      
      // Store metrics for handle positioning relative to visible image
      el.style.setProperty('--ba-top', `${top}px`);
      el.style.setProperty('--ba-height', `${height}px`);
      el.style.setProperty('--ba-left', `${left}px`);
      el.style.setProperty('--ba-width', `${width}px`);
      
      // Reposition handle after metrics update
      positionHandle();
    }

    onMounted(() => {
      const el = root.value;
      if (el) {
        el.addEventListener('mousedown', onDown as any);
        el.addEventListener('touchstart', onDown as any, { passive: false });
        el.addEventListener('click', onClick as any);
        el.addEventListener('keydown', onKeyDown as any);
      }
      window.addEventListener('resize', updateMetrics);
      
      // Set up image load listeners
      const setupImageListeners = () => {
        if (afterImg.value) {
          if (afterImg.value.complete) {
            updateMetrics();
          } else {
            afterImg.value.addEventListener('load', updateMetrics, { once: true });
          }
        }
        if (beforeImg.value) {
          if (beforeImg.value.complete) {
            updateMetrics();
          } else {
            beforeImg.value.addEventListener('load', updateMetrics, { once: true });
          }
        }
      };
      
      // Use nextTick to ensure refs are set
      setTimeout(() => {
        setupImageListeners();
        updateMetrics();
        positionHandle();
      }, 0);
    });

    onBeforeUnmount(() => {
      const el = root.value;
      if (el) {
        el.removeEventListener('mousedown', onDown as any);
        el.removeEventListener('touchstart', onDown as any);
        el.removeEventListener('click', onClick as any);
        el.removeEventListener('keydown', onKeyDown as any);
      }
      window.removeEventListener('resize', updateMetrics);
      afterImg.value?.removeEventListener('load', updateMetrics);
      beforeImg.value?.removeEventListener('load', updateMetrics);
    });

    return () =>
      h(
        'div',
        {
          ref: root,
          class: 'pg-ba',
          style: 'position:relative',
          tabindex: 0,
          role: 'slider',
          'aria-label': 'Before/After split',
          'aria-valuemin': '0',
          'aria-valuemax': '100',
          'aria-valuenow': String(Math.round(split.value * 100)),
        },
        [
          // Base: BEFORE image visible everywhere
          h('img', {
            class: 'pg-ba__before',
            alt: props.alt,
            src: props.beforeSrc,
            ref: beforeImg,
            draggable: false,
          }),
          // Overlay: AFTER image clipped to the left portion (so AFTER on the left)
          h('img', {
            class: 'pg-ba__after',
            alt: props.alt,
            src: props.afterSrc,
            ref: afterImg,
            draggable: false,
            style: `clip-path: inset(0 ${Math.max(0, Math.min(100, (1 - split.value) * 100))}% 0 0)`
          }),
          // Visual rail + handle clipped to image height
          h('div', { class: 'pg-ba__rail' }, [
            h('div', { ref: handleEl, class: 'pg-ba__handle' }),
          ]),
          // Labels (After on left, Before on right)
          h('div', { class: 'pg-ba__label pg-ba__label--left' }, 'After'),
          h('div', { class: 'pg-ba__label pg-ba__label--right' }, 'Before'),
        ]
      );
  },
});


