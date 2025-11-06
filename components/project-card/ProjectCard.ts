import { defineComponent, h, onMounted } from 'vue';

export default defineComponent({
  name: 'ProjectCard',
  setup() {
    const MAX_SHIFT = 6;

    onMounted(() => {
      const cards = Array.from(document.querySelectorAll('.project-card')) as HTMLElement[];
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

    // No visible UI needed; this component wires up interactions.
    return () => h('div');
  },
});


