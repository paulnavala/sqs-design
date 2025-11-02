/**
 * Utility Functions
 * Reusable utilities for reveal-on-scroll, mobile viewport fixes, etc.
 */

(function () {
  'use strict';

  /**
   * Reveal-on-scroll utility
   * Adds 'is-inview' class when elements enter viewport
   */
  function initRevealOnScroll() {
    const targets = [
      document.querySelector('#elegant-footer'),
      document.querySelector('.proto-showcase.split'),
    ].filter(Boolean);

    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('is-inview');
            else e.target.classList.remove('is-inview');
          });
        },
        { threshold: 0.12 }
      );
      targets.forEach((t) => io.observe(t));
    } else {
      // Fallback: just show everything if IO unsupported
      targets.forEach((t) => t && t.classList.add('is-inview'));
    }
  }

  /**
   * Safer mobile 100vh (address bar aware)
   * Sets CSS custom property --vh for accurate viewport height
   */
  function initMobileViewportFix() {
    const setVH = () => {
      document.documentElement.style.setProperty(
        '--vh',
        window.innerHeight * 0.01 + 'px'
      );
    };
    setVH();
    window.addEventListener('resize', setVH);
  }

  // Initialize all utilities on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRevealOnScroll();
      initMobileViewportFix();
    });
  } else {
    initRevealOnScroll();
    initMobileViewportFix();
  }
})();

