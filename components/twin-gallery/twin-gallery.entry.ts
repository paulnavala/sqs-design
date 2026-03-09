import './twin-gallery.css';
import { isTouchDevice, rafThrottle, isReducedMotion } from '../_shared/dom';

// Touch feedback duration
const TAP_FOCUS_DURATION = 900;

// Track tap timers without expando properties on DOM nodes
const tapTimers = new WeakMap<Element, number>();

function initTwinGallery(): void {
  const galleries = document.querySelectorAll<HTMLElement>('.twin-gallery');
  if (galleries.length === 0) return;
  if (isReducedMotion()) return;

  galleries.forEach((gallery) => {
    if (gallery.hasAttribute('data-twin-initialized')) return;
    gallery.setAttribute('data-twin-initialized', 'true');

    const left = gallery.querySelector<HTMLElement>('.panel.left');
    const right = gallery.querySelector<HTMLElement>('.panel.right');
    if (!left || !right) return;

    left.addEventListener('mouseenter', () => {
      gallery.classList.add('hover-left');
      gallery.classList.remove('hover-right');
    });
    right.addEventListener('mouseenter', () => {
      gallery.classList.add('hover-right');
      gallery.classList.remove('hover-left');
    });
    gallery.addEventListener('mouseleave', () => {
      gallery.classList.remove('hover-left', 'hover-right');
    });
  });
}

function initMobileTouchBehavior(): void {
  const gallery = document.querySelector<HTMLElement>('.twin-gallery');
  if (!gallery) return;
  if (gallery.hasAttribute('data-twin-touch-initialized')) return;
  gallery.setAttribute('data-twin-touch-initialized', 'true');
  const panels = Array.from(gallery.querySelectorAll<HTMLElement>('.panel'));
  if (!isTouchDevice()) return;
  if (isReducedMotion()) return;
  gallery.classList.add('touch-mode');

  panels.forEach((panel) => {
    panel.addEventListener(
      'touchstart',
      () => {
        panel.classList.add('tap-focus');
        const prev = tapTimers.get(panel);
        if (prev) clearTimeout(prev);
        tapTimers.set(panel, window.setTimeout(() => {
          panel.classList.remove('tap-focus');
        }, TAP_FOCUS_DURATION));
      },
      { passive: true }
    );
  });

  let lastX: number | null = null;
  let rafPending = false;
  let pendingX: number = 0;
  const onMove = rafThrottle((ev: PointerEvent) => {
    pendingX = ev.clientX;
    if (lastX === null) {
      lastX = pendingX;
      return;
    }
    const dir = pendingX > lastX ? 'hover-right' : 'hover-left';
    gallery.classList.toggle('hover-right', dir === 'hover-right');
    gallery.classList.toggle('hover-left', dir === 'hover-left');
    lastX = pendingX;
  });
  gallery.addEventListener('pointermove', onMove, { passive: true });
}

function initGuidelinesPanel(): void {
  const guidelinesWrapper = document.querySelector<HTMLElement>('.guidelines-wrapper');
  if (!guidelinesWrapper) return;
  if (guidelinesWrapper.hasAttribute('data-guidelines-touch-initialized')) return;
  guidelinesWrapper.setAttribute('data-guidelines-touch-initialized', 'true');
  const guidelinesPanel = guidelinesWrapper.querySelector<HTMLElement>('.guidelines-panel');
  if (!guidelinesPanel) return;
  if (!isTouchDevice()) return;
  if (isReducedMotion()) return;
  guidelinesWrapper.classList.add('touch-mode');

  guidelinesPanel.addEventListener(
    'touchstart',
    () => {
      guidelinesPanel.classList.add('tap-focus');
      const prev = tapTimers.get(guidelinesPanel);
      if (prev) clearTimeout(prev);
      tapTimers.set(guidelinesPanel, window.setTimeout(() => {
        guidelinesPanel.classList.remove('tap-focus');
      }, TAP_FOCUS_DURATION));
    },
    { passive: true }
  );
}

function initializeAll(): void {
  initTwinGallery();
  initMobileTouchBehavior();
  initGuidelinesPanel();
}

// Auto-init on standard and Squarespace events
['mercury:load', 'sqs:pageLoaded', 'DOMContentLoaded'].forEach((evt) =>
  document.addEventListener(evt, initializeAll as any)
);
window.addEventListener('load', initializeAll);

// Expose global API for manual re-init (parity with legacy)
// @ts-ignore
window.initTwinGallery = initializeAll;
