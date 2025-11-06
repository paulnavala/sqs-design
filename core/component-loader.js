/**
 * Component Loader for Squarespace
 *
 * Dynamically loads component HTML from GitHub Pages and injects it into
 * the page. Supports both automatic loading via data-component attributes
 * and manual loading via the exposed loadComponent function.
 *
 * Architecture:
 * - Components are stored in components/[name]/[name]-loader.html
 * - Loaded from GitHub Pages CDN
 * - Automatically initialized after injection
 *
 * Usage Methods:
 *
 * 1. Auto-loading via data-component attribute (recommended):
 *    <div data-component="fortune-peach"></div>
 *
 * 2. Manual loading via JavaScript:
 *    <script>
 *      loadComponent('fortune-peach', document.getElementById('target'));
 *    </script>
 *
 * 3. Load into selector:
 *    loadComponent('fortune-peach', '#my-container');
 *
 * Events:
 * - componentLoaded: Dispatched when component is successfully loaded
 *   Event detail: { componentName, target }
 *
 * @module component-loader
 */

(function () {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  /** Base URL for GitHub Pages CDN */
  const BASE_URL = 'https://assets.peachless.design';

  /** Components directory path (relative to BASE_URL) */
  const COMPONENTS_DIR = '/components';

  // ============================================================================
  // Core Functions
  // ============================================================================

  /**
   * Load a component HTML file and inject it into the target element
   *
   * @param {string} componentName - Component name (with or without .html extension)
   * @param {HTMLElement|string|null} targetElement - Target element or CSS selector
   * @returns {void}
   *
   * @example
   * loadComponent('fortune-peach', document.getElementById('container'));
   * loadComponent('twin-gallery', '#gallery-container');
   * loadComponent('portfolio-uiux'); // Creates container automatically
   */
  function loadComponent(componentName, targetElement) {
    // Extract base component name (remove .html if present)
    const baseName = componentName.endsWith('.html')
      ? componentName.replace('-loader.html', '').replace('.html', '')
      : componentName;

    // Construct filename (assume loader HTML files)
    const filename = `${baseName}-loader.html`;

    // Construct full URL with component directory structure
    // Format: /components/[component-name]/[component-name]-loader.html
    const url = `${BASE_URL}${COMPONENTS_DIR}/${baseName}/${filename}`;

    // Resolve target element
    let target = targetElement;

    // If targetElement is a string, treat it as a CSS selector
    if (typeof targetElement === 'string') {
      target = document.querySelector(targetElement);
      if (!target) {
        console.warn(`Component Loader: Target element not found: ${targetElement}`);
      }
    }

    // If no target provided, create a container div
    if (!target) {
      target = document.createElement('div');
      target.className = 'component-container';

      // Try to insert after the script tag that called this function
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];

      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(target, currentScript.nextSibling);
      } else {
        // Fallback: append to body
        document.body.appendChild(target);
      }
    }

    // Fetch and inject component HTML
    fetch(url)
      .then((response) => {
        // Check for HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load component ${filename}`);
        }
        return response.text();
      })
      .then((html) => {
        // Clean HTML: remove comments for smaller payload
        const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').trim();

        // Inject into target element
        target.innerHTML = cleanHtml;

        // Dispatch custom event for other scripts to listen to
        const event = new CustomEvent('componentLoaded', {
          detail: {
            componentName: filename,
            target: target,
            url: url,
          },
        });

        // Dispatch on both target and document (for flexibility)
        target.dispatchEvent(event);
        document.dispatchEvent(event);

        // Manually trigger initialization for known components
        // This ensures components work even if event listeners aren't set up yet
        initializeKnownComponents();
      })
      .catch((error) => {
        // Log error for debugging
        console.error('Component Loader Error:', error);
        console.error(`Failed to load component from: ${url}`);

        // Show user-friendly error message in the target element
        target.innerHTML = `
          <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
            <strong>Error loading component:</strong> ${filename}<br>
            <small>Check browser console for details.</small>
          </div>
        `;
      });
  }

  /**
   * Initialize known components after injection
   *
   * Some components expose global initialization functions.
   * This ensures they're called after the HTML is injected.
   *
   * @private
   */
  function initializeKnownComponents() {
    // Fortune Peach component
    if (typeof window.initFortunePeach === 'function') {
      window.initFortunePeach();
    }

    // Twin Gallery component
    if (typeof window.initTwinGallery === 'function') {
      window.initTwinGallery();
    }

    // Legacy Fortune Logo Widget (backward compatibility)
    if (typeof window.initFortuneLogoWidget === 'function') {
      window.initFortuneLogoWidget();
    }

    // Portfolio UI/UX component
    if (typeof window.initPortfolioUIUX === 'function') {
      window.initPortfolioUIUX();
    }
  }

  /**
   * Auto-load components marked with data-component attribute
   *
   * Scans the DOM for elements with data-component attributes and
   * automatically loads the corresponding component HTML.
   *
   * This runs automatically on DOMContentLoaded, but can also be
   * called manually for dynamically added elements.
   *
   * @function autoLoadComponents
   * @returns {void}
   */
  function autoLoadComponents() {
    const componentElements = document.querySelectorAll('[data-component]');

    if (componentElements.length === 0) {
      return; // No components to load
    }

    componentElements.forEach((element) => {
      const componentName = element.getAttribute('data-component');

      if (componentName) {
        // Load component into this element
        loadComponent(componentName, element);
      }
    });
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize component loader when DOM is ready
   *
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoadComponents);
  } else {
    // DOM already ready, run immediately
    autoLoadComponents();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Expose loadComponent globally for manual use
   *
   * This allows components to be loaded programmatically:
   *
   * @example
   * window.loadComponent('portfolio-uiux', '#portfolio-container');
   */
  window.loadComponent = loadComponent;

  /**
   * Expose autoLoadComponents for re-scanning after dynamic content addition
   *
   * Useful when new elements with data-component are added via AJAX
   *
   * @example
   * // After adding new content via AJAX
   * window.autoLoadComponents();
   */
  window.autoLoadComponents = autoLoadComponents;
})();
