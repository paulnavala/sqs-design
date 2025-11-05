/**
 * Mobile Menu Extension (MMX)
 *
 * Enhanced mobile navigation overlay for Squarespace themes.
 * Automatically detects mobile menu toggle and creates an accessible
 * overlay menu with keyboard navigation support.
 *
 * Features:
 * - Auto-detects mobile menu toggle button
 * - Creates accessible overlay menu
 * - Keyboard navigation (Escape to close, focus management)
 * - Closes on window resize to desktop
 * - Touch-friendly interactions
 * - Prevents body scroll when menu is open
 *
 * Browser Support:
 * - Modern browsers with ES6+ support
 * - Gracefully degrades if toggle button not found
 *
 * CSS Dependency:
 * - Requires .mmx-overlay, .mmx-inner, .mmx-nav classes
 * - Styles defined in mobile-menu.css
 *
 * @module mobile-menu
 */

(function () {
  'use strict';

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const d = document;

  /**
   * Query selector shorthand
   * @param {string} sel - CSS selector
   * @param {Element} ctx - Context element (default: document)
   * @returns {Element|null} Found element or null
   */
  const $ = (sel, ctx = d) => ctx.querySelector(sel);

  /**
   * Query selector all (returns array)
   * @param {string} sel - CSS selector
   * @param {Element} ctx - Context element (default: document)
   * @returns {Array<Element>} Array of found elements
   */
  const $$ = (sel, ctx = d) => Array.from(ctx.querySelectorAll(sel));

  // ============================================================================
  // Main Initialization
  // ============================================================================

  /**
   * Initialize mobile menu extension
   *
   * Finds mobile menu toggle, collects navigation links, and creates
   * an accessible overlay menu with full keyboard support.
   *
   * @function initMobileMenu
   * @returns {void}
   */
  function initMobileMenu() {
    // ========================================================================
    // Step 1: Find Mobile Menu Toggle Button
    // ========================================================================

    // Try multiple selectors for different Squarespace themes
    const header = $('header') || $('[role="banner"]') || d.body;
    const toggles = [
      'button[aria-controls*="Nav"]', // Standard Squarespace
      'button[aria-expanded]', // Accessible toggle
      '.header-menu-toggle', // Common class name
      '.Mobile-bar button', // Mobile bar variant
      '.header-burger', // Burger menu variant
    ];

    let toggleBtn = null;
    for (const sel of toggles) {
      toggleBtn = $(sel, header);
      if (toggleBtn) break; // Found a toggle button
    }

    // Exit gracefully if no toggle found (theme might not have mobile menu)
    if (!toggleBtn) {
      console.warn('[MMX] No mobile toggle button found. Menu extension disabled.');
      return;
    }

    // ========================================================================
    // Step 2: Collect Navigation Links
    // ========================================================================

    // Get navigation links from header (top-level only)
    let links = $$('.header a[href]:not([href^="#"])', header);
    if (!links.length) {
      // Fallback: try generic nav selector
      links = $$('nav a[href]:not([href^="#"])', header);
    }

    // Deduplicate links by pathname+hash (avoid duplicate menu items)
    const uniq = new Map();
    links.forEach((a) => {
      try {
        const u = new URL(a.href, location.origin);
        const key = u.pathname + (u.hash || '');
        if (!uniq.has(key)) {
          uniq.set(key, a);
        }
      } catch (e) {
        // Skip invalid URLs (mailto:, tel:, etc.)
      }
    });

    const navLinks = Array.from(uniq.values());
    if (!navLinks.length) {
      console.warn('[MMX] No header links found to clone.');
      return;
    }

    // ========================================================================
    // Step 3: Get Brand/Logo Text
    // ========================================================================

    // Try multiple selectors for site title
    const siteTitle = $('.site-title, .header-title, .Header-title', header);
    const brandText =
      (siteTitle && siteTitle.textContent.trim()) || (document.title || '').replace(/\s*\|.*$/, ''); // Remove page suffix

    // ========================================================================
    // Step 4: Build Overlay Menu
    // ========================================================================

    const overlay = d.createElement('div');
    overlay.className = 'mmx-overlay';
    overlay.setAttribute('aria-hidden', 'true'); // Hidden by default

    // Build overlay HTML structure
    overlay.innerHTML = `
      <div class="mmx-inner" role="dialog" aria-modal="true" aria-label="Site navigation">
        <button class="mmx-close" aria-label="Close menu">✕</button>
        <div class="mmx-brand">${brandText || ''}</div>
        <nav class="mmx-nav" role="navigation"></nav>
      </div>
    `;

    d.body.appendChild(overlay);

    // Populate navigation with links
    const navEl = $('.mmx-nav', overlay);
    navLinks.forEach((a) => {
      const clone = d.createElement('a');
      clone.href = a.href;
      // Use text content, aria-label, or href as fallback
      clone.textContent = a.textContent.trim() || a.getAttribute('aria-label') || a.href;
      navEl.appendChild(clone);
    });

    // Get close button reference
    const closeBtn = $('.mmx-close', overlay);

    // ========================================================================
    // Step 5: Open/Close Functions
    // ========================================================================

    /**
     * Open mobile menu overlay
     *
     * Shows overlay, locks body scroll, manages focus,
     * and updates ARIA attributes.
     */
    const open = () => {
      overlay.classList.add('open');

      // Prevent body scroll when menu is open
      d.documentElement.classList.add('mmx-locked', 'mmx-open');
      d.body.classList.add('mmx-locked', 'mmx-open');

      // Update ARIA for screen readers
      overlay.setAttribute('aria-hidden', 'false');

      // Focus management: focus first link or close button
      const firstLink = $('.mmx-nav a', overlay);
      (firstLink || closeBtn).focus({ preventScroll: true });
    };

    /**
     * Close mobile menu overlay
     *
     * Hides overlay, restores body scroll, returns focus
     * to toggle button, and updates ARIA attributes.
     */
    const close = () => {
      overlay.classList.remove('open');

      // Restore body scroll
      d.documentElement.classList.remove('mmx-locked', 'mmx-open');
      d.body.classList.remove('mmx-locked', 'mmx-open');

      // Update ARIA for screen readers
      overlay.setAttribute('aria-hidden', 'true');

      // Return focus to toggle button for keyboard navigation
      if (toggleBtn) {
        toggleBtn.focus({ preventScroll: true });
      }
    };

    // ========================================================================
    // Step 6: Event Listeners
    // ========================================================================

    // Toggle button: open/close menu
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (overlay.classList.contains('open')) {
        close();
      } else {
        open();
      }
    });

    // Close button: close menu
    closeBtn.addEventListener('click', close);

    // Click outside (backdrop): close menu
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        // Clicked on backdrop, not inner content
        close();
      }
    });

    // Escape key: close menu
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        close();
      }
    });

    // Close menu when navigation link is clicked
    overlay.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      // Internal links: close menu (navigation will proceed)
      // External links: close menu after delay if needed
      close();
    });

    // ========================================================================
    // Step 7: Responsive Behavior
    // ========================================================================

    /**
     * Close overlay when window resizes to desktop width
     *
     * Prevents menu from staying open when switching to desktop view.
     */
    const mq = window.matchMedia('(min-width: 901px)');
    mq.addEventListener('change', () => {
      if (mq.matches && overlay.classList.contains('open')) {
        // Resized to desktop, close menu
        close();
      }
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
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    // DOM already ready, initialize immediately
    initMobileMenu();
  }
})();
