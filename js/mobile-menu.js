/**
 * Mobile Menu Extension (MMX)
 * Enhanced mobile navigation overlay for Squarespace
 */

(function () {
  'use strict';

  const d = document;
  const $ = (sel, ctx = d) => ctx.querySelector(sel);
  const $$ = (sel, ctx = d) => Array.from(ctx.querySelectorAll(sel));

  function initMobileMenu() {
    // ---- Find a plausible mobile menu toggle in the header
    const header =
      $('header') || $('[role="banner"]') || d.body;
    const toggles = [
      'button[aria-controls*="Nav"]',
      'button[aria-expanded]',
      '.header-menu-toggle',
      '.Mobile-bar button',
      '.header-burger',
    ];
    let toggleBtn = null;
    for (const sel of toggles) {
      toggleBtn = $(sel, header);
      if (toggleBtn) break;
    }
    if (!toggleBtn) {
      // Fallback: don't crash if theme differs
      console.warn('[MMX] No mobile toggle button found.');
      return;
    }

    // ---- Collect nav links from the header (top-level)
    let links = $$('.header a[href]:not([href^="#"])', header);
    if (!links.length) links = $$('nav a[href]:not([href^="#"])', header);
    // Deduplicate by pathname+hash
    const uniq = new Map();
    links.forEach((a) => {
      try {
        const u = new URL(a.href, location.origin);
        const key = u.pathname + (u.hash || '');
        if (!uniq.has(key)) uniq.set(key, a);
      } catch (e) {
        // ignore invalid URLs
      }
    });
    const navLinks = Array.from(uniq.values());
    if (!navLinks.length) {
      console.warn('[MMX] No header links found to clone.');
      return;
    }

    // ---- Brand label (prefer site title, otherwise document.title)
    const siteTitle = $(
      '.site-title, .header-title, .Header-title',
      header
    );
    const brandText =
      (siteTitle && siteTitle.textContent.trim()) ||
      (document.title || '').replace(/\s*\|.*$/, '');

    // ---- Build overlay
    const overlay = d.createElement('div');
    overlay.className = 'mmx-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="mmx-inner" role="dialog" aria-modal="true" aria-label="Site navigation">
        <button class="mmx-close" aria-label="Close menu">✕</button>
        <div class="mmx-brand">${brandText || ''}</div>
        <nav class="mmx-nav" role="navigation"></nav>
      </div>
    `;
    d.body.appendChild(overlay);

    const navEl = $('.mmx-nav', overlay);
    navLinks.forEach((a) => {
      const clone = d.createElement('a');
      clone.href = a.href;
      clone.textContent =
        a.textContent.trim() || a.getAttribute('aria-label') || a.href;
      navEl.appendChild(clone);
    });

    const closeBtn = $('.mmx-close', overlay);

    // ---- Open/close helpers
    const open = () => {
      overlay.classList.add('open');
      d.documentElement.classList.add('mmx-locked', 'mmx-open');
      d.body.classList.add('mmx-locked', 'mmx-open');
      overlay.setAttribute('aria-hidden', 'false');
      // focus first link
      const firstLink = $('.mmx-nav a', overlay);
      (firstLink || closeBtn).focus({ preventScroll: true });
    };
    const close = () => {
      overlay.classList.remove('open');
      d.documentElement.classList.remove('mmx-locked', 'mmx-open');
      d.body.classList.remove('mmx-locked', 'mmx-open');
      overlay.setAttribute('aria-hidden', 'true');
      // return focus to toggle
      if (toggleBtn) toggleBtn.focus({ preventScroll: true });
    };

    // ---- Wire up toggle
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (overlay.classList.contains('open')) close();
      else open();
    });

    // Close behaviors
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(); // click outside inner
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });

    // Close on nav click
    overlay.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      // Internal links: let navigation proceed; overlay will disappear on unload
      close();
    });

    // Safety: close overlay on resize to desktop
    const mq = window.matchMedia('(min-width: 901px)');
    mq.addEventListener('change', () => {
      if (mq.matches) close();
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();

