/**
 * Tagline Component
 * Cinematic typewriter effect with soft caret fade
 */

(function () {
  'use strict';

  function initTagline() {
    const tag = document.querySelector('.tagline');
    if (!tag) return;

    const textEl = tag.querySelector('.text');
    const caretEl = tag.querySelector('.caret');

    if (!textEl || !caretEl) return;

    const line1 = 'Every pixel tells a story.';
    const line2 = ' Let the world know yours.';

    // Timing (ms)
    const typeSpeed = 65;
    const typeVariance = 25;
    const waitBetweenLines = 2000; // pause between line 1 and 2
    const holdAfterLine2 = 5000; // hold tagline visible
    const fadeDuration = 2500; // fade-out of text
    const waitBeforeRestart = 20000; // pause before next loop

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function makeCharSpan(ch) {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animation = 'glow 0.6s ease';
      return span;
    }

    function clearPreviousGlow() {
      const last = textEl.lastElementChild;
      if (last) {
        last.style.animation = 'none';
        last.style.textShadow = 'none';
      }
    }

    async function typeText(text, baseSpeed) {
      for (let i = 0; i < text.length; i++) {
        clearPreviousGlow();
        const span = makeCharSpan(text[i]);
        textEl.appendChild(span);
        const variance = Math.random() * typeVariance - typeVariance / 2;
        await sleep(Math.max(20, baseSpeed + variance));
      }
      clearPreviousGlow();
    }

    async function runSequence() {
      while (true) {
        // Reset
        tag.classList.remove('fade');
        textEl.innerHTML = '';
        caretEl.classList.remove('exit', 'fade-in');
        caretEl.style.display = 'inline-block';
        caretEl.style.opacity = '1';
        caretEl.style.transform = 'translateX(0)';
        caretEl.style.animation = 'blink 1s ease-in-out infinite';

        // Type first line
        await typeText(line1, typeSpeed);

        // Wait before second line
        await sleep(waitBetweenLines);

        // Type second line
        await typeText(line2, typeSpeed);

        // Instantly hide caret (no fade)
        caretEl.style.animation = 'none';
        caretEl.style.opacity = '0';
        caretEl.style.display = 'none';

        // Hold full tagline
        await sleep(holdAfterLine2);

        // Fade tagline text in place
        tag.classList.add('fade');
        await sleep(fadeDuration);

        // Pause before restarting
        await sleep(waitBeforeRestart);
      }
    }

    runSequence();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTagline);
  } else {
    initTagline();
  }
})();

