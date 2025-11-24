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

    const handleStyle = {
      left: `${posX.value}px`,
    };

    const imgStyle = {
      width: `${width.value}px`,
      height: 'auto',
    };

    return h(
      'figure',
      {
        ref: root,
        class: 'image-compare',
        onMousemove: (e: MouseEvent) => onMouseMove(e),
        onTouchstart: (e: TouchEvent) => { e.preventDefault(); onMouseMove(e, true); },
        onTouchmove: (e: TouchEvent) => { e.preventDefault(); onMouseMove(e, true); },
        onClick: (e: MouseEvent) => onMouseMove(e, true),
      },
      [
        // After image wrapper (clipped)
        h(
          'div',
          {
            class: 'image-compare-wrapper',
            style: wrapperStyle,
          },
          [
            h('img', {
              ref: afterImg,
              src: props.afterSrc,
              alt: props.alt,
              style: imgStyle,
              draggable: false,
            }),
          ]
        ),
        // Before image (full width)
        h('img', {
          ref: beforeImg,
          src: props.beforeSrc,
          alt: props.alt,
          style: imgStyle,
          draggable: false,
        }),
        // Handle
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
