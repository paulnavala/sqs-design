import { defineComponent, h, onMounted, PropType } from 'vue';

type CardItem = {
  href: string;
  title: string;
  description: string;
  className?: string;
};

export default defineComponent({
  name: 'ProjectCards',
  props: {
    items: {
      type: Array as PropType<CardItem[]>,
      default: () => [],
    },
  },
  setup(props) {
    const MAX_SHIFT = 6;

    onMounted(() => {
      const root = document.querySelector('.projects-text-grid');
      if (!root) return;
      const cards = Array.from(root.querySelectorAll('.project-card')) as HTMLElement[];

      cards.forEach((card) => {
        function onMove(e: MouseEvent) {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          card.style.setProperty('--bg-x', `${x * MAX_SHIFT}px`);
          card.style.setProperty('--bg-y', `${y * MAX_SHIFT}px`);
        }
        function onLeave() {
          card.style.setProperty('--bg-x', '0px');
          card.style.setProperty('--bg-y', '0px');
        }
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      });
    });

    return () =>
      h(
        'div',
        { class: 'projects-text-grid' },
        props.items.map((it) =>
          h(
            'a',
            { href: it.href, class: `project-card${it.className ? ' ' + it.className : ''}` },
            [h('h2', it.title), h('p', it.description)]
          )
        )
      );
  },
});


