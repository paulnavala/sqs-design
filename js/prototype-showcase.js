/**
 * Prototype Showcase Component
 * Figma prototype showcase with reveal animation and fallback handling
 */

(function () {
  'use strict';

  function initPrototypeShowcase() {
    const section = document.querySelector('.proto-showcase.split');
    if (!section) return;

    const iframe = section.querySelector('.figma-prototype');
    const fallback = section.querySelector('.figma-fallback');
    const btn = section.querySelector('.proto-btn');
    const year = document.getElementById('year-proto');

    // auto year in caption
    if (year) {
      year.textContent = new Date().getFullYear();
    }

    // reveal animation
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              section.classList.add('is-inview');
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(section);
    } else {
      section.classList.add('is-inview');
    }

    // fallback if iframe fails to load
    if (iframe && fallback) {
      const timer = setTimeout(() => {
        fallback.hidden = false;
      }, 4000);
      iframe.addEventListener('load', () => clearTimeout(timer));
    }

    // analytics ping on CTA
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.plausible) {
          window.plausible('Prototype – View Fullscreen');
        }
        // Example alternative: gtag('event','prototype_fullscreen',{label:'CERN'});
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrototypeShowcase);
  } else {
    initPrototypeShowcase();
  }
})();

