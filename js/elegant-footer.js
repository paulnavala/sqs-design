/**
 * Elegant Footer Component
 * Intersection observer for scroll reveal animation
 */

(function () {
  'use strict';

  function initFooter() {
    const el = document.getElementById('elegant-footer');
    if (!el) return;

    // If IntersectionObserver isn't supported, just show it
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-inview');
      return;
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            el.classList.add('is-inview');
            io.unobserve(el); // trigger once
          }
        });
      },
      { root: null, threshold: 0.12 }
    );

    io.observe(el);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();

