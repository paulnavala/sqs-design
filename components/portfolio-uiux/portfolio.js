/**
 * Portfolio/Projects Page Component
 * 
 * Complete portfolio showcase system with dynamic project rendering,
 * category filtering, lazy-loaded Figma embeds, and fullscreen modal views.
 * 
 * Features:
 * - Dynamic project card rendering from HTML data
 * - Category-based filtering system
 * - Lazy loading for Figma iframe embeds
 * - Scroll reveal animations
 * - Fullscreen modal for prototypes
 * - Keyboard accessibility (focus trap, Escape to close)
 * - Live project count updates
 * - AJAX navigation support (waits for section to load)
 * 
 * HTML Structure Required:
 * <section id="portfolio-uiux">
 *   <div id="projects-list" data-mount></div>
 *   <template id="project-card-template">...</template>
 *   <ul id="projects-data" hidden>
 *     <li data-id="..." data-title="..." ...></li>
 *   </ul>
 * </section>
 * 
 * Data Format:
 * Projects defined in <ul id="projects-data"> with data attributes:
 * - data-id: Unique identifier
 * - data-title: Project title
 * - data-description: Project description
 * - data-figma: Figma prototype URL
 * - data-case: Case study link
 * - data-badges: Pipe-separated badges
 * - data-categories: Pipe-separated categories (for filtering)
 * - data-year: Year
 * - data-accent: Custom accent color
 * 
 * @module portfolio
 */

(function () {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  /** ID of the portfolio section container */
  const SECTION_ID = 'portfolio-uiux';

  /** Timeout for waiting for section to appear (ms) */
  const SECTION_TIMEOUT = 8000;

  /** Selector for focusable elements in modal */
  const FOCUSABLE_SELECTOR = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Wait until element is available in DOM
   * 
   * Handles Squarespace AJAX navigation where sections load dynamically.
   * Polls for element existence using requestAnimationFrame.
   * 
   * @param {string} selector - CSS selector
   * @param {number} timeoutMs - Maximum wait time (default: 8000ms)
   * @returns {Promise<Element>} Promise resolving to found element
   * @throws {Error} If timeout exceeded
   */
  function whenAvailable(selector, timeoutMs = SECTION_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      
      (function check() {
        const el = document.querySelector(selector);
        if (el) {
          return resolve(el);
        }
        
        // Check timeout
        if (performance.now() - start > timeoutMs) {
          return reject(new Error('Timeout waiting for: ' + selector));
        }
        
        // Check again on next frame
        requestAnimationFrame(check);
      })();
    });
  }

  /**
   * Query selector shorthand
   * 
   * @param {string} sel - CSS selector
   * @param {Element} el - Context element (default: document)
   * @returns {Element|null} Found element or null
   */
  const qs = (sel, el = document) => el.querySelector(sel);

  /**
   * Query selector all (returns array)
   * 
   * @param {string} sel - CSS selector
   * @param {Element} el - Context element (default: document)
   * @returns {Array<Element>} Array of found elements
   */
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  /**
   * Convert string to URL-friendly slug
   * 
   * Converts: "Design System" → "design-system"
   * 
   * @param {string} s - String to slugify
   * @returns {string} Slugified string
   */
  const slug = (s = '') =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  /**
   * Convert Figma URL to embed URL
   * 
   * @param {string} url - Figma prototype URL
   * @returns {string} Figma embed URL or empty string
   */
  const figmaToEmbed = (url) =>
    url
      ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`
      : '';

  /**
   * Split list string into array
   * 
   * Handles pipe (|) or comma (,) separated values.
   * Example: "prototype|cern" → ["prototype", "cern"]
   * 
   * @param {string|Array} v - List string or array
   * @returns {Array<string>} Array of trimmed, non-empty values
   */
  const splitList = (v) =>
    (Array.isArray(v) ? v : String(v || ''))
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize portfolio component on multiple events
   * 
   * Squarespace fires different events depending on page load type.
   * We listen to all possible events to ensure initialization works
   * in all scenarios (initial load, AJAX navigation, etc.).
   */
  ['mercury:load', 'sqs:pageLoaded', 'DOMContentLoaded'].forEach((evt) =>
    document.addEventListener(evt, initOnce)
  );
  window.addEventListener('load', initOnce);

  /**
   * Main initialization function
   * 
   * Sets up all portfolio functionality:
   * - Waits for section to be available
   * - Reads project data
   * - Renders project cards
   * - Sets up filtering
   * - Initializes modal
   * - Sets up observers for lazy loading
   * 
   * @async
   * @function initOnce
   * @returns {Promise<void>}
   */
  async function initOnce() {
    // Wait for portfolio section to be available (handles AJAX loads)
    const root = await whenAvailable('#' + SECTION_ID).catch(() => null);
    
    // Exit if section not found or already initialized
    if (!root || root.dataset.initialized === 'true') {
      return;
    }
    
    // Mark as initialized to prevent double-initialization
    root.dataset.initialized = 'true';

    // ========================================================================
    // DOM Element References
    // ========================================================================
    
    // Get required DOM elements (all may not exist - we guard everything)
    const list = root.querySelector('#projects-list');        // Projects container
    const tpl = root.querySelector('#project-card-template'); // Card template
    const countEl = root.querySelector('[data-count]');       // Live count display
    const pills = root.querySelector('.portfolio__filters');  // Filter buttons

    // ========================================================================
    // Modal Setup
    // ========================================================================
    
    /**
     * Create modal if it doesn't exist in HTML
     * 
     * The modal can be defined in HTML or created dynamically here.
     * This ensures the modal always exists even if HTML is missing it.
     */
    let modal = root.querySelector('#portfolio-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'portfolio-modal';
      modal.id = 'portfolio-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'portfolio-modal-title');
      modal.hidden = true;
      
      // Build modal HTML structure
      modal.innerHTML = `
        <div class="portfolio-modal__backdrop" data-close></div>
        <div class="portfolio-modal__dialog" role="document">
          <header class="portfolio-modal__header">
            <h3 id="portfolio-modal-title" class="portfolio-modal__title"></h3>
            <div class="portfolio-modal__actions">
              <a class="portfolio-modal__open" href="#" target="_blank" rel="noopener">Open in new tab</a>
              <button class="portfolio-modal__close" type="button" aria-label="Close fullscreen" data-close>✕</button>
            </div>
          </header>
          <div class="portfolio-modal__body">
            <div class="portfolio-modal__frame">
              <div class="portfolio-modal__spinner" aria-hidden="true"></div>
              <iframe class="portfolio-modal__iframe" title="Project (fullscreen)" loading="lazy" allow="fullscreen; clipboard-write" allowfullscreen></iframe>
            </div>
          </div>
          <p class="portfolio-modal__fallback" hidden>
            Couldn't load the embedded prototype.
            <a class="portfolio-modal__open" href="#" target="_blank" rel="noopener">Open in a new tab</a>.
          </p>
        </div>`;
      
      root.appendChild(modal);
    }
    
    // Get modal child elements
    const iframe = modal.querySelector('.portfolio-modal__iframe');
    const titleEl = modal.querySelector('.portfolio-modal__title');
    const openLink = modal.querySelector('.portfolio-modal__open');
    const backdrop = modal.querySelector('.portfolio-modal__backdrop');
    const closeBtns = modal.querySelectorAll('[data-close]');

    // ========================================================================
    // Data Reading
    // ========================================================================
    
    /**
     * Read project data from HTML data attributes
     * 
     * Scans <ul id="projects-data"> for <li> elements with data attributes
     * and converts them to JavaScript objects.
     * 
     * @function readDataItems
     * @returns {Array<Object>} Array of project objects
     */
    function readDataItems() {
      const bag = root.querySelector('#projects-data');
      if (!bag) {
        return []; // No data found, return empty array
      }
      
      return [...bag.querySelectorAll('li')].map((li) => ({
        id: li.dataset.id || '',
        title: li.dataset.title || 'Untitled Project',
        description: li.dataset.description || '',
        figmaUrl: li.dataset.figma || '',
        caseStudyHref: li.dataset.case || '#',
        badges: splitList(li.dataset.badges),
        categories: splitList(li.dataset.categories),
        year: Number(li.dataset.year) || new Date().getFullYear(),
        accent: li.dataset.accent || null,
      }));
    }

    // ========================================================================
    // Intersection Observers
    // ========================================================================
    
    /**
     * Lazy load Figma iframes when they enter viewport
     * 
     * Uses IntersectionObserver to detect when iframe is near viewport
     * and loads the src from data-src attribute. Improves page load performance.
     */
    const iframeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) {
            return; // Not visible yet, skip
          }
          
          const frame = e.target;
          const dataSrc = frame.getAttribute('data-src');
          
          // Load iframe if not already loaded
          if (dataSrc && !frame.src) {
            frame.src = dataSrc;
          }
          
          // Unobserve after loading (one-time load)
          iframeObserver.unobserve(frame);
        });
      },
      {
        rootMargin: '200px 0px',  // Start loading 200px before entering viewport
        threshold: 0.1             // Trigger when 10% visible
      }
    );

    /**
     * Reveal animation observer
     * 
     * Adds 'is-inview' class when project cards enter viewport
     * to trigger CSS reveal animations.
     */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // Toggle is-inview class based on visibility
          e.target.classList.toggle('is-inview', e.isIntersecting);
          
          // Unobserve after triggering (one-time animation)
          if (e.isIntersecting) {
            revealObserver.unobserve(e.target);
          }
        });
      },
      {
        rootMargin: '100px 0px',  // Trigger slightly before entering viewport
        threshold: 0.2             // Trigger when 20% visible
      }
    );

    // ========================================================================
    // Rendering Functions
    // ========================================================================
    
    /**
     * Render project cards from data
     * 
     * Clones the template for each project, populates it with data,
     * and appends to the projects list. Sets up lazy loading and
     * reveal animations.
     * 
     * @param {Array<Object>} projects - Array of project data objects
     * @returns {void}
     */
    function render(projects) {
      // Validate required elements
      if (!tpl || !list) {
        return; // Can't render without template or container
      }
      
      // Clear existing projects
      list.innerHTML = '';
      
      // Use document fragment for better performance
      const frag = document.createDocumentFragment();

      projects.forEach((p) => {
        // Clone template
        const node = tpl.content.cloneNode(true);
        
        // Get elements from cloned template
        const section = qs('.project', node);
        const title = qs('.project__title', node);
        const sub = qs('.project__sub', node);
        const badgeEl = qs('.badge', node);
        const capName = qs('.project__cap-name', node);
        const yearEl = qs('.project__year', node);
        const caseA = qs('[data-internal-link]', node);
        const frame = qs('.project__iframe', node);

        // Populate content
        title.textContent = p.title;
        sub.textContent = p.description || '';
        badgeEl.textContent = (p.badges || []).join(' • ');
        capName.textContent = p.title;
        yearEl.textContent = p.year;
        
        // Set case study link
        if (caseA && p.caseStudyHref) {
          caseA.href = p.caseStudyHref;
        }

        // Set custom accent color if provided
        if (p.accent) {
          section.style.setProperty('--accent', p.accent);
        }
        
        // Set categories for filtering (slugified)
        section.dataset.categories = (p.categories || [])
          .map(slug)
          .join(' ');

        // Set iframe source (lazy-loaded via data-src)
        frame.setAttribute('data-src', figmaToEmbed(p.figmaUrl));
        frame.title = `${p.title} (interactive Figma)`;

        // Set up observers
        iframeObserver.observe(frame);      // Lazy load iframe
        revealObserver.observe(section);    // Reveal animation
        
        // Accessibility
        section.setAttribute('aria-label', p.title);

        // Add to fragment
        frag.appendChild(node);
      });

      // Append all projects at once (better performance)
      list.appendChild(frag);
      
      // Update live count
      updateCount();
    }

    /**
     * Update live project count display
     * 
     * Counts visible (non-hidden) projects and updates the count element.
     * 
     * @function updateCount
     * @returns {void}
     */
    function updateCount() {
      if (!countEl) {
        return; // Count element not present
      }
      
      // Count only visible projects
      const total = qsa('.project', list).filter(
        (el) => el.style.display !== 'none'
      ).length;
      
      countEl.textContent = String(total);
    }

    // ========================================================================
    // Filtering System
    // ========================================================================
    
    /**
     * Update active filter pill state
     * 
     * Updates visual state and ARIA attributes for filter buttons
     * to indicate which filter is currently active.
     * 
     * @param {string} v - Filter value (category slug or 'all')
     * @returns {void}
     */
    function setActivePill(v) {
      if (!pills) {
        return; // Filter buttons not present
      }
      
      qsa('.pill', pills).forEach((btn) => {
        const isActive =
          btn.dataset.filter === v ||
          (v === 'all' && btn.dataset.filter === 'all');
        
        // Update visual state
        btn.classList.toggle('is-active', isActive);
        
        // Update ARIA for accessibility
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    /**
     * Apply filter to project cards
     * 
     * Shows/hides projects based on category filter.
     * Updates active pill state and live count.
     * 
     * @param {string} v - Filter value (category slug or 'all')
     * @returns {void}
     */
    function applyFilter(v) {
      const val = slug(v || 'all'); // Normalize to slug format
      
      qsa('.project', list).forEach((card) => {
        if (val === 'all') {
          // Show all projects
          card.style.display = '';
          return;
        }
        
        // Get card categories
        const cats = (card.dataset.categories || '').split(' ');
        
        // Show if category matches, hide otherwise
        card.style.display = cats.includes(val) ? '' : 'none';
      });
      
      // Update UI state
      setActivePill(val);
      updateCount();
    }

    /**
     * Set up filter button click handlers
     */
    if (pills) {
      pills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill');
        if (!btn) {
          return; // Click wasn't on a filter button
        }
        
        // Get filter value and apply
        applyFilter(btn.dataset.filter || 'all');
      });
    }

    // ========================================================================
    // Modal Functions
    // ========================================================================
    
    /** Track last element that triggered modal (for focus return) */
    let lastTrigger = null;

    /**
     * Check if element is visible
     * 
     * Used for focus trap to only include visible focusable elements.
     * 
     * @param {Element} el - Element to check
     * @returns {boolean} True if element is visible
     */
    function isVisible(el) {
      const s = window.getComputedStyle(el);
      return (
        s.visibility !== 'hidden' &&
        s.display !== 'none' &&
        el.offsetParent !== null
      );
    }

    /**
     * Trap focus within modal
     * 
     * Prevents focus from escaping modal when using Tab key.
     * Cycles focus between first and last focusable elements.
     * 
     * @param {Element} container - Modal container element
     * @returns {void}
     */
    function trapFocus(container) {
      function loop(e) {
        // Only handle Tab key
        if (e.key !== 'Tab') {
          return;
        }
        
        // Get all focusable, visible elements
        const items = [...container.querySelectorAll(FOCUSABLE_SELECTOR)]
          .filter(isVisible);
        
        if (!items.length) {
          return; // No focusable elements
        }
        
        const first = items[0];
        const last = items[items.length - 1];
        
        // Shift+Tab on first element: go to last
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
        // Tab on last element: go to first
        else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
      
      container.addEventListener('keydown', loop);
      
      // Store reference for cleanup
      container._focusLoop = loop;
    }

    /**
     * Release focus trap
     * 
     * Removes focus trap event listener when modal closes.
     * 
     * @function releaseFocus
     * @returns {void}
     */
    function releaseFocus() {
      if (modal._focusLoop) {
        modal.removeEventListener('keydown', modal._focusLoop);
        modal._focusLoop = null;
      }
    }

    /**
     * Extract project data from trigger element
     * 
     * Finds the project card containing the trigger element and
     * extracts title and Figma URL.
     * 
     * @param {Element} el - Trigger element (button/link)
     * @returns {Object} Object with title and src properties
     */
    function getCardDataFromTrigger(el) {
      const card = el.closest('.project');
      if (!card) {
        return {}; // Not in a project card
      }
      
      // Get title from card
      const title =
        card.querySelector('.project__title')?.textContent?.trim() ||
        'Prototype';
      
      // Get Figma URL from iframe
      const f = card.querySelector('.project__iframe');
      const src = f?.getAttribute('data-src') || f?.getAttribute('src') || '';
      
      return { title, src };
    }

    /**
     * Open modal and load prototype
     * 
     * Shows modal, loads Figma iframe, sets up focus trap,
     * and prevents body scroll.
     * 
     * @param {Element} trigger - Element that triggered modal
     * @returns {void}
     */
    function openModalFrom(trigger) {
      // Validate required elements
      const refs = { titleEl, openLink, iframe };
      if (!refs.titleEl || !refs.openLink || !refs.iframe) {
        return; // Required elements missing
      }
      
      // Get project data
      const { title, src } = getCardDataFromTrigger(trigger);
      if (!src) {
        return; // No source URL
      }
      
      // Update modal content
      titleEl.textContent = title;
      openLink.href = src;
      
      // Show loading state
      modal.classList.add('is-loading');
      modal.hidden = false;
      
      // Prevent body scroll
      document.documentElement.classList.add('no-scroll');
      root.classList.add('no-scroll');
      
      // Load iframe
      iframe.src = src;
      
      // Remove loading state when iframe loads
      const onLoad = () => {
        modal.classList.remove('is-loading');
        iframe.removeEventListener('load', onLoad);
      };
      iframe.addEventListener('load', onLoad);
      
      // Safety timeout: remove loading state after 6 seconds
      setTimeout(() => {
        modal.classList.remove('is-loading');
      }, 6000);
      
      // Store trigger for focus return
      lastTrigger = trigger;
      
      // Set up focus trap
      trapFocus(modal);
      
      // Focus close button (first focusable element)
      modal.querySelector('.portfolio-modal__close')?.focus();
    }

    /**
     * Close modal
     * 
     * Hides modal, clears iframe, restores body scroll,
     * releases focus trap, and returns focus to trigger.
     * 
     * @function closeModal
     * @returns {void}
     */
    function closeModal() {
      // Hide modal
      modal.hidden = true;
      modal.classList.remove('is-loading');
      
      // Clear iframe (privacy/performance)
      if (iframe) {
        iframe.src = 'about:blank';
      }
      
      // Restore body scroll
      document.documentElement.classList.remove('no-scroll');
      root.classList.remove('no-scroll');
      
      // Release focus trap
      releaseFocus();
      
      // Return focus to trigger element
      if (lastTrigger && document.body.contains(lastTrigger)) {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    /**
     * Set up modal event listeners
     */
    
    // Open modal on click
    root.addEventListener('click', (e) => {
      const op = e.target.closest('[data-action="open-modal"]');
      if (op) {
        e.preventDefault();
        openModalFrom(op);
      }
    });
    
    // Close on backdrop click
    backdrop?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
    
    // Close on close button click
    closeBtns.forEach((b) => b.addEventListener('click', closeModal));
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (!modal.hidden && e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });

    // ========================================================================
    // Initial Render
    // ========================================================================
    
    /**
     * Load and render projects
     * 
     * Reads project data and renders cards. Falls back to seed data
     * if no projects-data found (for development/testing).
     */
    const projects = readDataItems();
    
    if (!projects.length) {
      // Fallback: render seed data if no projects found
      console.warn(
        '[portfolio-uiux] No #projects-data found — rendering seed items.'
      );
      
      const seed = [
        {
          id: 'cern-01',
          title: 'CERN Prototype',
          description:
            "An interactive exploration of interface systems for CERN's design evolution.",
          figmaUrl:
            'https://www.figma.com/proto/OUowEnozqwEO4wIcu5qcxh/CERN?node-id=1-105&page-id=0%3A1&starting-point-node-id=1%3A105&scaling=scale-down-width&show-proto-sidebar=0',
          caseStudyHref: '/projects/cern',
          badges: ['Prototype', 'Figma'],
          categories: ['prototype', 'cern'],
          year: new Date().getFullYear(),
          accent: null,
        },
      ];
      
      render(seed);
    } else {
      render(projects);
    }
    
    // Apply default filter (show all)
    applyFilter('all');
  }
})();
