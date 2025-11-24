import { defineComponent, h, onMounted, onBeforeUnmount, ref, PropType } from 'vue';

export default defineComponent({
  name: 'BeforeAfterSlider',
  props: {
    afterSrc: { type: String, required: true },
    beforeSrc: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const handleEl = ref<HTMLElement | null>(null);
    const afterImg = ref<HTMLImageElement | null>(null);
    const beforeImg = ref<HTMLImageElement | null>(null);

    const width = ref(0);
    const height = ref(0);
    const posX = ref(0);
    const pageX = ref(0);
    const isDragging = ref(false);
    const allowNextFrame = ref(true);
    const imagesLoaded = ref(false);
    let cachedRect: DOMRect | null = null;

    function onResize() {
      const el = root.value;
      if (!el) return;

      width.value = el.clientWidth;
      height.value = el.clientHeight;
      cachedRect = el.getBoundingClientRect();
      setInitialPosX();
    }

    function setInitialPosX() {
      posX.value = width.value * 0.25; // Start at 25%
    }

    function onMouseDown(e: MouseEvent) {
      e.preventDefault();
      isDragging.value = true;
    }

    function onMouseUp(e: Event) {
      isDragging.value = false;
    }

    function onMouseMove(e: MouseEvent | TouchEvent, forceUpdate = false) {
      const shouldUpdate = forceUpdate || isDragging.value;

      if (shouldUpdate && allowNextFrame.value) {
        allowNextFrame.value = false;

        if (window.TouchEvent && e instanceof TouchEvent) {
          pageX.value = e.touches[0]?.pageX || e.targetTouches[0]?.pageX || 0;
        } else {
          pageX.value = (e as MouseEvent).pageX;
        }

        requestAnimationFrame(updatePos);
      }
    }

    function updatePos() {
      const el = root.value;
      if (!el) return;

      const rect = cachedRect || el.getBoundingClientRect();
      let newPosX = pageX.value - rect.left;

      // Clamp to bounds
      newPosX = Math.max(0, Math.min(width.value, newPosX));

      // Edge snapping (3%)
      const snapThreshold = width.value * 0.03;
      if (newPosX < snapThreshold) newPosX = 0;
      if (newPosX > width.value - snapThreshold) newPosX = width.value;

      posX.value = newPosX;
      allowNextFrame.value = true;
    }

    function setupImageLoading() {
      let afterLoaded = false;
      let beforeLoaded = false;

      const checkBothLoaded = () => {
        if (afterLoaded && beforeLoaded) {
          imagesLoaded.value = true;
          // Fade in images
          if (afterImg.value) {
            afterImg.value.style.opacity = '1';
            afterImg.value.style.transition = 'opacity 0.3s ease';
          }
          if (beforeImg.value) {
            beforeImg.value.style.opacity = '1';
            beforeImg.value.style.transition = 'opacity 0.3s ease';
          }
          // Multiple resize calls to ensure proper layout
          onResize();
          setTimeout(onResize, 50);
          setTimeout(onResize, 150);
          setTimeout(onResize, 300);
        }
      };

      if (afterImg.value) {
        afterImg.value.style.opacity = '0';
        afterImg.value.style.display = 'block';
        if (afterImg.value.complete && afterImg.value.naturalWidth > 0) {
          afterLoaded = true;
          checkBothLoaded();
        } else {
          afterImg.value.addEventListener('load', () => {
            afterLoaded = true;
            checkBothLoaded();
          }, { once: true });
          afterImg.value.addEventListener('error', () => {
            console.error('After image failed to load');
            afterLoaded = true; // Continue anyway
            checkBothLoaded();
          }, { once: true });
        }
      }

      if (beforeImg.value) {
        beforeImg.value.style.opacity = '0';
        beforeImg.value.style.display = 'block';
        if (beforeImg.value.complete && beforeImg.value.naturalWidth > 0) {
          beforeLoaded = true;
          checkBothLoaded();
        } else {
          beforeImg.value.addEventListener('load', () => {
            beforeLoaded = true;
            checkBothLoaded();
          }, { once: true });
          beforeImg.value.addEventListener('error', () => {
            console.error('Before image failed to load');
            beforeLoaded = true; // Continue anyway
            checkBothLoaded();
          }, { once: true });
        }
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const step = width.value * (e.shiftKey ? 0.01 : 0.05);
      let newPosX = posX.value;

      if (e.key === 'ArrowLeft') {
        newPosX = Math.max(0, posX.value - step);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        newPosX = Math.min(width.value, posX.value + step);
        e.preventDefault();
      } else if (e.key === 'Home') {
        newPosX = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        newPosX = width.value;
        e.preventDefault();
      } else {
        return;
      }

      posX.value = newPosX;
    }

    onMounted(() => {
      const el = root.value;
      if (el) {
        el.addEventListener('keydown', onKeyDown);
      }
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('resize', onResize);

      setTimeout(() => {
        setupImageLoading();
        onResize();
      }, 50);

      // Additional resize calls to ensure proper layout after modal opens
      setTimeout(onResize, 100);
      setTimeout(onResize, 200);
      setTimeout(onResize, 500);
    });

    onBeforeUnmount(() => {
      const el = root.value;
      if (el) {
        el.removeEventListener('keydown', onKeyDown);
      }
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      cachedRect = null;
    });

    return () => {
      const wrapperStyle = {
        width: `${posX.value}px`,
      };

      const handleStyle = {
        left: `${posX.value}px`,
      };

      const imgStyle = {
        width: `${width.value}px`,
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      };

      return h(
        'figure',
        {
          ref: root,
          class: ['image-compare', { 'is-dragging': isDragging.value }],
          tabindex: 0,
          onMousemove: (e: MouseEvent) => onMouseMove(e),
          onTouchstart: (e: TouchEvent) => { onMouseMove(e, true); },
          onTouchmove: (e: TouchEvent) => {
            if (isDragging.value) e.preventDefault();
            onMouseMove(e, true);
          },
          onClick: (e: MouseEvent) => onMouseMove(e, true),
        },
        [
          // Before label (left side)
          h('div', { class: 'image-compare-label before' }, 'BEFORE'),
          // After label (right side)
          h('div', { class: 'image-compare-label after' }, 'AFTER'),
          h(
            'div',
            {
              class: 'image-compare-wrapper',
              style: wrapperStyle,
            },
            [
              h('img', {
                ref: beforeImg,
                src: props.beforeSrc,
                alt: props.alt,
                style: imgStyle,
                draggable: false,
              }),
            ]
          ),
          h('img', {
            ref: afterImg,
            src: props.afterSrc,
            alt: props.alt,
            style: imgStyle,
            draggable: false,
          }),
          h(
            'div',
            {
              ref: handleEl,
              class: 'image-compare-handle',
              style: handleStyle,
              onMousedown: onMouseDown,
            },
            [
              h('span', { class: 'image-compare-handle-icon left' }, '‹'),
              h('span', { class: 'image-compare-handle-icon right' }, '›'),
            ]
          ),
        ]
      );
    };
  },
});
