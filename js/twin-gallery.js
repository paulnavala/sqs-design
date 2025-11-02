/**
 * Twin Gallery Component
 * Handles hover interactions and mobile touch behavior
 */

(function () {
  'use strict';

  function initTwinGallery() {
    document.querySelectorAll('.twin-gallery').forEach(function (gallery) {
      const left = gallery.querySelector('.panel.left');
      const right = gallery.querySelector('.panel.right');

      if (!left || !right) return;

      // When hovering left or right panel, move the highlight
      left.addEventListener('mouseenter', () => {
        gallery.classList.add('hover-left');
        gallery.classList.remove('hover-right');
      });
      right.addEventListener('mouseenter', () => {
        gallery.classList.add('hover-right');
        gallery.classList.remove('hover-left');
      });

      // Remove highlight when leaving gallery
      gallery.addEventListener('mouseleave', () => {
        gallery.classList.remove('hover-left', 'hover-right');
      });
    });
  }

  function initMobileTouchBehavior() {
    const gallery = document.querySelector('.twin-gallery');
    if (!gallery) return;

    const panels = Array.from(gallery.querySelectorAll('.panel'));

    // On touch devices, don't dim all images on "hover" (which can feel odd)
    const isTouch =
      window.matchMedia('(hover: none)').matches ||
      'ontouchstart' in window;

    if (isTouch) {
      // Prevent global hover-fade from firing visually
      gallery.classList.add('touch-mode');

      // Give a quick tap highlight to the tapped card
      panels.forEach((p) => {
        p.addEventListener(
          'touchstart',
          () => {
            p.classList.add('tap-focus');
            clearTimeout(p._tapTimer);
            p._tapTimer = setTimeout(() => p.classList.remove('tap-focus'), 900);
          },
          { passive: true }
        );
      });
    }

    // Optional: simple left/right sweep based on pointer
    let lastX = null;
    gallery.addEventListener(
      'pointermove',
      (ev) => {
        if (lastX === null) lastX = ev.clientX;
        const dir = ev.clientX > lastX ? 'hover-right' : 'hover-left';
        gallery.classList.toggle('hover-right', dir === 'hover-right');
        gallery.classList.toggle('hover-left', dir === 'hover-left');
        lastX = ev.clientX;
      },
      { passive: true }
    );
  }

  function initGuidelinesPanel() {
    const guidelinesWrapper = document.querySelector('.guidelines-wrapper');
    if (!guidelinesWrapper) return;

    const guidelinesPanel = guidelinesWrapper.querySelector('.guidelines-panel');
    if (!guidelinesPanel) return;

    // On touch devices, add touch mode class
    const isTouch =
      window.matchMedia('(hover: none)').matches ||
      'ontouchstart' in window;

    if (isTouch) {
      guidelinesWrapper.classList.add('touch-mode');

      // Give tap highlight feedback
      guidelinesPanel.addEventListener(
        'touchstart',
        () => {
          guidelinesPanel.classList.add('tap-focus');
          clearTimeout(guidelinesPanel._tapTimer);
          guidelinesPanel._tapTimer = setTimeout(() => {
            guidelinesPanel.classList.remove('tap-focus');
          }, 900);
        },
        { passive: true }
      );
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTwinGallery();
      initMobileTouchBehavior();
      initGuidelinesPanel();
    });
  } else {
    initTwinGallery();
    initMobileTouchBehavior();
    initGuidelinesPanel();
  }
})();

