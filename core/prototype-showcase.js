/**
 * Prototype Showcase Component
 *
 * Handles Figma prototype embeds with reveal animations and fallback
 * handling for failed loads. Includes automatic year updates and
 * analytics tracking for user interactions.
 *
 * Features:
 * - Scroll reveal animation using IntersectionObserver
 * - Automatic year update in captions
 * - Fallback UI if iframe fails to load
 * - Analytics tracking for CTA clicks
 * - Graceful degradation for older browsers
 *
 * HTML Structure Required:
 * <section class="proto-showcase split">
 *   <iframe class="figma-prototype" ...></iframe>
 *   <div class="figma-fallback" hidden>...</div>
 *   <span id="year-proto"></span>
 *   <button class="proto-btn">...</button>
 * </section>
 *
 * CSS Dependencies:
 * - .proto-showcase, .proto-showcase.is-inview classes
 * - Reveal animation handled via CSS transitions
 *
 * @module prototype-showcase
 */

(function () {
  'use strict';

  /**
   * Initialize prototype showcase component
   *
   * Sets up scroll reveal, year display, iframe fallback,
   * and analytics tracking.
   *
   * @function initPrototypeShowcase
   * @returns {void}
   */
  function initPrototypeShowcase() {
    const section = document.querySelector('.proto-showcase.split');
    if (!section) {
      return; // Component not present, exit gracefully
    }

    // Get component elements
    const iframe = section.querySelector('.figma-prototype');
    const fallback = section.querySelector('.figma-fallback');
    const btn = section.querySelector('.proto-btn');
    const year = document.getElementById('year-proto');

    // ========================================================================
    // Year Display Update
    // ========================================================================

    /**
     * Update year in caption to current year
     *
     * Automatically displays the current year in the prototype caption.
     * No need to manually update each year.
     */
    if (year) {
      year.textContent = new Date().getFullYear();
    }

    // ========================================================================
    // Scroll Reveal Animation
    // ========================================================================

    /**
     * Reveal animation when section enters viewport
     *
     * Uses IntersectionObserver for efficient scroll detection.
     * Adds 'is-inview' class to trigger CSS animations.
     */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Section is visible, trigger reveal animation
              section.classList.add('is-inview');
              // Unobserve after triggering (one-time animation)
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.15 } // Trigger when 15% of section is visible
      );
      io.observe(section);
    } else {
      // Fallback: show immediately if IntersectionObserver not supported
      section.classList.add('is-inview');
    }

    // ========================================================================
    // Iframe Fallback Handling
    // ========================================================================

    /**
     * Show fallback UI if iframe fails to load
     *
     * Sets a timeout to show fallback message if iframe doesn't
     * load within 4 seconds. Clears timeout if iframe loads successfully.
     */
    if (iframe && fallback) {
      const timer = setTimeout(() => {
        // Iframe didn't load in time, show fallback
        fallback.hidden = false;
      }, 4000); // 4 second timeout

      // Clear timeout if iframe loads successfully
      iframe.addEventListener('load', () => {
        clearTimeout(timer);
      });
    }

    // ========================================================================
    // Analytics Tracking
    // ========================================================================

    /**
     * Track CTA button clicks for analytics
     *
     * Supports Plausible Analytics (plausible.io) by default.
     * Can be extended for other analytics platforms.
     */
    if (btn) {
      btn.addEventListener('click', () => {
        // Plausible Analytics
        if (typeof window.plausible === 'function') {
          window.plausible('Prototype – View Fullscreen');
        }

        // Google Analytics 4 example (commented out)
        // if (typeof gtag === 'function') {
        //   gtag('event', 'prototype_fullscreen', { label: 'CERN' });
        // }

        // Universal Analytics example (commented out)
        // if (typeof ga === 'function') {
        //   ga('send', 'event', 'Prototype', 'View Fullscreen', 'CERN');
        // }
      });
    }
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize when DOM is ready
   *
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrototypeShowcase);
  } else {
    // DOM already ready, initialize immediately
    initPrototypeShowcase();
  }
})();
