/**
 * Twin Gallery Component
 * 
 * Side-by-side image gallery with hover effects and touch interactions.
 * Highlights the hovered/tapped panel while dimming the other.
 * 
 * Features:
 * - Hover highlight effects on desktop
 * - Touch feedback on mobile devices
 * - Pointer-based direction detection
 * - Guidelines panel touch support
 * - Passive event listeners for performance
 * 
 * HTML Structure Required:
 * <div class="twin-gallery">
 *   <div class="panel left">...</div>
 *   <div class="panel right">...</div>
 * </div>
 * 
 * Optional:
 * <div class="guidelines-wrapper">
 *   <div class="guidelines-panel">...</div>
 * </div>
 * 
 * CSS Dependencies:
 * - .twin-gallery, .panel, .hover-left, .hover-right classes
 * - .touch-mode, .tap-focus classes for touch devices
 * - Hover and touch animations defined in CSS
 * 
 * @module twin-gallery
 */

(function () {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Touch feedback duration (in milliseconds)
   * 
   * How long the tap-focus highlight remains visible after touch.
   * 
   * @constant {number}
   */
  const TAP_FOCUS_DURATION = 900;

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Detect if device supports touch
   * 
   * Checks both CSS media query and JavaScript API for touch support.
   * 
   * @returns {boolean} True if device supports touch
   */
  function isTouchDevice() {
    return window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  }

  // ============================================================================
  // Desktop Hover Interactions
  // ============================================================================

  /**
   * Initialize hover interactions for desktop
   * 
   * Adds mouseenter/mouseleave handlers to highlight panels on hover.
   * Works with multiple galleries on the same page.
   * 
   * @function initTwinGallery
   * @returns {void}
   */
  function initTwinGallery() {
    const galleries = document.querySelectorAll('.twin-gallery');
    
    if (galleries.length === 0) {
      return; // No galleries found, exit gracefully
    }

    galleries.forEach(function (gallery) {
      const left = gallery.querySelector('.panel.left');
      const right = gallery.querySelector('.panel.right');

      // Validate required elements
      if (!left || !right) {
        return; // Skip this gallery if panels missing
      }

      /**
       * Highlight left panel on hover
       * 
       * Adds hover-left class and removes hover-right to ensure
       * only one panel is highlighted at a time.
       */
      left.addEventListener('mouseenter', () => {
        gallery.classList.add('hover-left');
        gallery.classList.remove('hover-right');
      });

      /**
       * Highlight right panel on hover
       */
      right.addEventListener('mouseenter', () => {
        gallery.classList.add('hover-right');
        gallery.classList.remove('hover-left');
      });

      /**
       * Remove highlight when mouse leaves gallery
       * 
       * Returns both panels to default state.
       */
      gallery.addEventListener('mouseleave', () => {
        gallery.classList.remove('hover-left', 'hover-right');
      });
    });
  }

  // ============================================================================
  // Mobile Touch Interactions
  // ============================================================================

  /**
   * Initialize touch behavior for mobile devices
   * 
   * Provides visual feedback on touch and enables pointer-based
   * direction detection for swipe-like interactions.
   * 
   * @function initMobileTouchBehavior
   * @returns {void}
   */
  function initMobileTouchBehavior() {
    const gallery = document.querySelector('.twin-gallery');
    if (!gallery) {
      return; // Gallery not present, exit gracefully
    }

    const panels = Array.from(gallery.querySelectorAll('.panel'));

    // Only apply touch behavior on touch devices
    if (!isTouchDevice()) {
      return;
    }

    // Add touch-mode class to disable hover effects
    gallery.classList.add('touch-mode');

    /**
     * Provide tap highlight feedback
     * 
     * Adds visual feedback when user taps a panel on touch devices.
     * Uses passive listeners for better scroll performance.
     */
    panels.forEach((panel) => {
      panel.addEventListener(
        'touchstart',
        () => {
          // Add tap-focus class for visual feedback
          panel.classList.add('tap-focus');
          
          // Clear any existing timer
          clearTimeout(panel._tapTimer);
          
          // Remove highlight after duration
          panel._tapTimer = setTimeout(() => {
            panel.classList.remove('tap-focus');
          }, TAP_FOCUS_DURATION);
        },
        { passive: true } // Passive for better scroll performance
      );
    });

    /**
     * Pointer-based direction detection
     * 
     * Detects left/right movement of pointer/finger and highlights
     * the corresponding panel. Creates a swipe-like interaction.
     */
    let lastX = null;
    gallery.addEventListener(
      'pointermove',
      (ev) => {
        // Initialize lastX on first move
        if (lastX === null) {
          lastX = ev.clientX;
          return;
        }

        // Determine direction based on pointer movement
        const dir = ev.clientX > lastX ? 'hover-right' : 'hover-left';
        
        // Update gallery classes based on direction
        gallery.classList.toggle('hover-right', dir === 'hover-right');
        gallery.classList.toggle('hover-left', dir === 'hover-left');
        
        // Update lastX for next comparison
        lastX = ev.clientX;
      },
      { passive: true } // Passive for better scroll performance
    );
  }

  // ============================================================================
  // Guidelines Panel (Optional)
  // ============================================================================

  /**
   * Initialize touch behavior for guidelines panel
   * 
   * Adds touch feedback to the guidelines panel if present.
   * Separate function for modularity and optional feature support.
   * 
   * @function initGuidelinesPanel
   * @returns {void}
   */
  function initGuidelinesPanel() {
    const guidelinesWrapper = document.querySelector('.guidelines-wrapper');
    if (!guidelinesWrapper) {
      return; // Guidelines panel not present, exit gracefully
    }

    const guidelinesPanel = guidelinesWrapper.querySelector('.guidelines-panel');
    if (!guidelinesPanel) {
      return;
    }

    // Only apply touch behavior on touch devices
    if (!isTouchDevice()) {
      return;
    }

    // Add touch-mode class
    guidelinesWrapper.classList.add('touch-mode');

    /**
     * Provide tap highlight feedback for guidelines panel
     */
    guidelinesPanel.addEventListener(
      'touchstart',
      () => {
        guidelinesPanel.classList.add('tap-focus');
        
        // Clear any existing timer
        clearTimeout(guidelinesPanel._tapTimer);
        
        // Remove highlight after duration
        guidelinesPanel._tapTimer = setTimeout(() => {
          guidelinesPanel.classList.remove('tap-focus');
        }, TAP_FOCUS_DURATION);
      },
      { passive: true } // Passive for better scroll performance
    );
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize all gallery features
   * 
   * Initializes hover interactions, touch behavior, and guidelines panel
   * support. All features are independent and can work separately.
   */
  function initializeAll() {
    initTwinGallery();
    initMobileTouchBehavior();
    initGuidelinesPanel();
  }

  /**
   * Initialize when DOM is ready
   * 
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    // DOM already ready, initialize immediately
    initializeAll();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Expose initialization function globally
   * 
   * Allows manual re-initialization if galleries are added dynamically.
   */
  window.initTwinGallery = initializeAll;
})();
