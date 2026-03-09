/**
 * Global JavaScript Loader for Squarespace
 * Load all JavaScript files from GitHub Pages
 *
 * Note: utilities.js loads first, then component-loader.js, then remaining scripts in parallel
 * Auto-generated - Run 'node scripts/generate-loaders.js' to regenerate.
 */

(function() {
  'use strict';

  const BASE_URL = 'https://assets.peachless.design';

  // Scripts that must load sequentially first (in order)
  const PRIORITY_FILES = [
    '/core/utilities.js',
    '/core/component-loader.js'
  ];

  // Remaining scripts that can load in parallel (independent IIFEs)
  const PARALLEL_FILES = [
    '/core/elegant-footer.js',
    '/core/mobile-menu.js',
    '/core/project-card.js',
    '/core/prototype-showcase.js',
    '/core/tagline.js',
    '/components/contact-form/contact-form.js',
    '/components/fortune-peach/fortune-peach.js',
    '/components/guideline-page/guideline-page.js',
    '/components/logo-showcase/logo-showcase.js',
    '/components/portfolio-photo/portfolio-photo.js',
    '/components/portfolio-uiux/portfolio.js',
    '/components/project-cards/project-cards.js',
    '/components/tagline/tagline.js',
    '/components/twin-gallery/twin-gallery.js'
  ];

  // Function to load a single JS file, returns a Promise
  function loadJS(src) {
    return new Promise(function(resolve) {
      // Check if already loaded
      var existing = document.querySelector('script[src*="' + src + '"]');
      if (existing) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = BASE_URL + src;
      script.onload = resolve;
      script.onerror = function() {
        console.warn('Failed to load:', src);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // Load priority scripts sequentially, then remaining in parallel
  function startLoading() {
    var chain = Promise.resolve();

    // Load priority scripts in order
    PRIORITY_FILES.forEach(function(src) {
      chain = chain.then(function() {
        return loadJS(src);
      });
    });

    // Then load all remaining scripts in parallel
    chain.then(function() {
      PARALLEL_FILES.forEach(function(src) {
        loadJS(src);
      });
    });
  }

  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoading);
  } else {
    startLoading();
  }
})();
