/**
 * Core Utilities Module
 *
 * Provides reusable utility functions used across multiple components:
 * - Reveal-on-scroll animations using IntersectionObserver
 * - Mobile viewport height fix for address bar aware layouts
 *
 * This module loads first (via global loader priority) as other components
 * may depend on these utilities.
 *
 * @module utilities
 */

(function () {
  'use strict';

  // Ensure Node-style globals for bundles that expect them (harmless in browser)
  // This helps IIFE bundles referencing process.env in legacy plugin code
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.process === 'undefined') {
        window.process = { env: {} };
      }
      if (typeof globalThis !== 'undefined' && typeof globalThis.process === 'undefined') {
        globalThis.process = window.process;
      }
    }
    // Also ensure a global var binding where possible
    // eslint-disable-next-line no-var
    var _p = window.process; // creates a function-scope var; not relied upon by others
  } catch (e) {}

  /**
   * Reveal-on-scroll utility
   *
   * Adds 'is-inview' class to elements when they enter the viewport.
   * Uses IntersectionObserver for efficient scroll detection.
   *
   * Elements targeted:
   * - #elegant-footer - Footer reveal animation
   * - .proto-showcase.split - Prototype showcase split animation
   *
   * @function initRevealOnScroll
   * @returns {void}
   */
  function initRevealOnScroll() {
    // Target elements for reveal animations
    const targets = [
      document.querySelector('#elegant-footer'),
      document.querySelector('.proto-showcase.split'),
    ].filter(Boolean); // Remove null/undefined elements

    // Check for IntersectionObserver support (modern browsers)
    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            // Toggle 'is-inview' class based on visibility
            if (e.isIntersecting) {
              e.target.classList.add('is-inview');
            } else {
              e.target.classList.remove('is-inview');
            }
          });
        },
        { threshold: 0.12 } // Trigger when 12% of element is visible
      );

      // Observe all target elements
      targets.forEach((t) => io.observe(t));
    } else {
      // Fallback: show elements immediately if IntersectionObserver unsupported
      // This ensures content is visible on older browsers
      targets.forEach((t) => {
        if (t) t.classList.add('is-inview');
      });
    }
  }

  /**
   * Mobile viewport height fix
   *
   * Sets CSS custom property --vh for accurate viewport height on mobile devices.
   * Addresses the issue where mobile browsers' address bar affects 100vh calculations.
   *
   * Usage in CSS:
   *   height: calc(var(--vh, 1vh) * 100);
   *
   * @function initMobileViewportFix
   * @returns {void}
   */
  function initMobileViewportFix() {
    /**
     * Calculate and set viewport height custom property
     * Called on initial load and window resize
     */
    const setVH = () => {
      // Calculate 1% of viewport height in pixels
      const vh = window.innerHeight * 0.01;

      // Set CSS custom property for use in stylesheets
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on window resize (handles address bar show/hide on mobile)
    window.addEventListener('resize', setVH);

    // Also update on orientation change (important for mobile)
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure accurate measurement after rotation
      setTimeout(setVH, 100);
    });
  }

  /**
   * Initialize all utilities when DOM is ready
   *
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      initRevealOnScroll();
      initMobileViewportFix();
    });
  } else {
    // DOM is already ready, initialize immediately
    initRevealOnScroll();
    initMobileViewportFix();
  }
})();
