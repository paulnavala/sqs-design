/**
 * Portfolio/Projects Page Component
 * Dynamic project rendering, filtering, and modal functionality
 */

(function () {
  'use strict';

  const SECTION_ID = 'portfolio-uiux';

  // Wait until the section exists (handles AJAX-y loads)
  function whenAvailable(selector, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      (function check() {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        if (performance.now() - start > timeoutMs)
          return reject(new Error('Timeout ' + selector));
        requestAnimationFrame(check);
      })();
    });
  }

  // Boot on several signals (Squarespace varies)
  ['mercury:load', 'sqs:pageLoaded', 'DOMContentLoaded'].forEach((evt) =>
    document.addEventListener(evt, initOnce)
  );
  window.addEventListener('load', initOnce);

  async function initOnce() {
    const root = await whenAvailable('#' + SECTION_ID).catch(() => null);
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    // DOM hooks (some may be missing — we guard everything)
    const list = root.querySelector('#projects-list');
    const tpl = root.querySelector('#project-card-template');
    const countEl = root.querySelector('[data-count]');
    const pills = root.querySelector('.portfolio__filters');

    // Create modal if missing
    let modal = root.querySelector('#portfolio-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'portfolio-modal';
      modal.id = 'portfolio-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'portfolio-modal-title');
      modal.hidden = true;
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
    const iframe = modal.querySelector('.portfolio-modal__iframe');
    const titleEl = modal.querySelector('.portfolio-modal__title');
    const openLink = modal.querySelector('.portfolio-modal__open');
    const backdrop = modal.querySelector('.portfolio-modal__backdrop');
    const closeBtns = modal.querySelectorAll('[data-close]');

    // Helpers
    const qs = (s, el = document) => el.querySelector(s);
    const qsa = (s, el = document) => [...el.querySelectorAll(s)];
    const slug = (s = '') =>
      String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const figmaToEmbed = (url) =>
      url
        ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
            url
          )}`
        : '';
    const splitList = (v) =>
      (Array.isArray(v) ? v : String(v || ''))
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean);

    // Read data from <ul id="projects-data"> rows
    function readDataItems() {
      const bag = root.querySelector('#projects-data');
      if (!bag) return [];
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

    // Observers
    const iframeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const frame = e.target;
          const dataSrc = frame.getAttribute('data-src');
          if (dataSrc && !frame.src) frame.src = dataSrc;
          iframeObserver.unobserve(frame);
        });
      },
      { rootMargin: '200px 0px', threshold: 0.1 }
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle('is-inview', e.isIntersecting);
          if (e.isIntersecting) revealObserver.unobserve(e.target);
        });
      },
      { rootMargin: '100px 0px', threshold: 0.2 }
    );

    function render(projects) {
      if (!tpl || !list) return;
      list.innerHTML = '';
      const frag = document.createDocumentFragment();

      projects.forEach((p) => {
        const node = tpl.content.cloneNode(true);
        const section = qs('.project', node);
        const title = qs('.project__title', node);
        const sub = qs('.project__sub', node);
        const badgeEl = qs('.badge', node);
        const capName = qs('.project__cap-name', node);
        const yearEl = qs('.project__year', node);
        const caseA = qs('[data-internal-link]', node);
        const frame = qs('.project__iframe', node);

        title.textContent = p.title;
        sub.textContent = p.description || '';
        badgeEl.textContent = (p.badges || []).join(' • ');
        capName.textContent = p.title;
        yearEl.textContent = p.year;
        if (caseA && p.caseStudyHref) caseA.href = p.caseStudyHref;

        if (p.accent) section.style.setProperty('--accent', p.accent);
        section.dataset.categories = (p.categories || [])
          .map(slug)
          .join(' ');

        frame.setAttribute('data-src', figmaToEmbed(p.figmaUrl));
        frame.title = `${p.title} (interactive Figma)`;

        iframeObserver.observe(frame);
        revealObserver.observe(section);
        section.setAttribute('aria-label', p.title);

        frag.appendChild(node);
      });

      list.appendChild(frag);
      updateCount();
    }

    function updateCount() {
      if (!countEl) return;
      const total = qsa('.project', list).filter(
        (el) => el.style.display !== 'none'
      ).length;
      countEl.textContent = String(total);
    }

    // Filters
    function setActivePill(v) {
      if (!pills) return;
      qsa('.pill', pills).forEach((btn) => {
        const isActive =
          btn.dataset.filter === v ||
          (v === 'all' && btn.dataset.filter === 'all');
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
    function applyFilter(v) {
      const val = slug(v || 'all');
      qsa('.project', list).forEach((card) => {
        if (val === 'all') {
          card.style.display = '';
          return;
        }
        const cats = (card.dataset.categories || '').split(' ');
        card.style.display = cats.includes(val) ? '' : 'none';
      });
      setActivePill(val);
      updateCount();
    }
    if (pills) {
      pills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill');
        if (!btn) return;
        applyFilter(btn.dataset.filter || 'all');
      });
    }

    // Modal (robust; only runs if modal exists)
    let lastTrigger = null;
    const FOCUSABLE =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    function isVisible(el) {
      const s = window.getComputedStyle(el);
      return (
        s.visibility !== 'hidden' &&
        s.display !== 'none' &&
        el.offsetParent !== null
      );
    }
    function trapFocus(container) {
      function loop(e) {
        if (e.key !== 'Tab') return;
        const items = [...container.querySelectorAll(FOCUSABLE)].filter(isVisible);
        if (!items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
      container.addEventListener('keydown', loop);
      container._focusLoop = loop;
    }
    function releaseFocus() {
      if (modal._focusLoop) {
        modal.removeEventListener('keydown', modal._focusLoop);
        modal._focusLoop = null;
      }
    }
    function getCardDataFromTrigger(el) {
      const card = el.closest('.project');
      if (!card) return {};
      const t =
        card.querySelector('.project__title')?.textContent?.trim() ||
        'Prototype';
      const f = card.querySelector('.project__iframe');
      const src = f?.getAttribute('data-src') || f?.getAttribute('src') || '';
      return { title: t, src };
    }
    function openModalFrom(trigger) {
      const refs = { titleEl, openLink, iframe };
      if (!refs.titleEl || !refs.openLink || !refs.iframe) return;
      const { title, src } = getCardDataFromTrigger(trigger);
      if (!src) return;
      titleEl.textContent = title;
      openLink.href = src;
      modal.classList.add('is-loading');
      modal.hidden = false;
      document.documentElement.classList.add('no-scroll');
      root.classList.add('no-scroll');
      iframe.src = src;
      const onLoad = () => {
        modal.classList.remove('is-loading');
        iframe.removeEventListener('load', onLoad);
      };
      iframe.addEventListener('load', onLoad);
      setTimeout(() => modal.classList.remove('is-loading'), 6000);
      lastTrigger = trigger;
      trapFocus(modal);
      modal.querySelector('.portfolio-modal__close')?.focus();
    }
    function closeModal() {
      modal.hidden = true;
      modal.classList.remove('is-loading');
      if (iframe) iframe.src = 'about:blank';
      document.documentElement.classList.remove('no-scroll');
      root.classList.remove('no-scroll');
      releaseFocus();
      if (lastTrigger && document.body.contains(lastTrigger))
        lastTrigger.focus();
      lastTrigger = null;
    }
    root.addEventListener('click', (e) => {
      const op = e.target.closest('[data-action="open-modal"]');
      if (op) {
        e.preventDefault();
        openModalFrom(op);
      }
    });
    backdrop?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
    closeBtns.forEach((b) => b.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (!modal.hidden && e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });

    // Load & render
    const projects = readDataItems();
    if (!projects.length) {
      // Safety: still show seed so you can see something even if data list is missing
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
    applyFilter('all');
  }
})();

