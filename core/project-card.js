/**
 * Project Card Component
 * 
 * Adds parallax mouse movement effect to project cards for enhanced
 * visual interest. The background shifts subtly based on mouse position
 * relative to the card.
 * 
 * Features:
 * - Parallax mouse movement effect
 * - Smooth CSS custom property updates
 * - Automatic reset on mouse leave
 * - Works with multiple cards on page
 * 
 * HTML Structure Required:
 * <div class="project-card">
 *   <!-- Card content -->
 * </div>
 * 
 * CSS Dependencies:
 * - .project-card class
 * - CSS custom properties: --bg-x, --bg-y
 * - Background image/positioning uses these properties for parallax
 * 
 * Example CSS:
 * .project-card {
 *   background-position: calc(50% + var(--bg-x, 0px)) calc(50% + var(--bg-y, 0px));
 *   transition: background-position 0.3s ease-out;
 * }
 * 
 * @module project-card
 */

(function () {
  'use strict';

  /**
   * Maximum parallax shift in pixels
   * 
   * Smaller values = subtler motion
   * Larger values = more dramatic effect
   * 
   * @constant {number}
   */
  const MAX_SHIFT = 6; // pixels

  /**
   * Initialize project card parallax effects
   * 
   * Sets up mouse movement tracking for all project cards on the page.
   * Calculates mouse position relative to card center and updates CSS
   * custom properties for parallax effect.
   * 
   * @function initProjectCards
   * @returns {void}
   */
  function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    if (cards.length === 0) {
      return; // No project cards found, exit gracefully
    }

    cards.forEach((card) => {
      /**
       * Handle mouse movement over card
       * 
       * Calculates normalized position (-1 to 1) relative to card center
       * and updates CSS custom properties for parallax effect.
       * 
       * @param {MouseEvent} e - Mouse event
       */
      card.addEventListener('mousemove', (e) => {
        // Get card bounding rectangle
        const rect = card.getBoundingClientRect();
        
        // Calculate normalized position (-1 to 1) relative to card center
        // x: -1 (left edge) to 1 (right edge)
        // y: -1 (top edge) to 1 (bottom edge)
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        
        // Update CSS custom properties for parallax
        // Multiply by MAX_SHIFT to get pixel offset
        card.style.setProperty('--bg-x', `${x * MAX_SHIFT}px`);
        card.style.setProperty('--bg-y', `${y * MAX_SHIFT}px`);
      });

      /**
       * Reset parallax on mouse leave
       * 
       * Returns background to center position when mouse leaves card.
       */
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--bg-x', '0px');
        card.style.setProperty('--bg-y', '0px');
      });
    });
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
    document.addEventListener('DOMContentLoaded', initProjectCards);
  } else {
    // DOM already ready, initialize immediately
    initProjectCards();
  }
})();
