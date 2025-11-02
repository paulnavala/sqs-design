/**
 * Project Card Component
 * Parallax mouse movement effect on project cards
 */

(function () {
  'use strict';

  function initProjectCards() {
    document.querySelectorAll('.project-card').forEach((card) => {
      const maxShift = 6; // smaller = subtler motion

      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        card.style.setProperty('--bg-x', x * maxShift + 'px');
        card.style.setProperty('--bg-y', y * maxShift + 'px');
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--bg-x', '0px');
        card.style.setProperty('--bg-y', '0px');
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectCards);
  } else {
    initProjectCards();
  }
})();

