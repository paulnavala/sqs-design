/**
 * Tagline Component
 * 
 * Cinematic typewriter effect that displays text character-by-character
 * with a glowing animation. Features a blinking caret and smooth fade-out.
 * 
 * Features:
 * - Character-by-character typewriter animation
 * - Glowing effect on each new character
 * - Blinking caret indicator
 * - Two-line text sequence
 * - Automatic looping
 * - Configurable timing
 * 
 * HTML Structure Required:
 * <div class="tagline">
 *   <div class="text"></div>
 *   <span class="caret"></span>
 * </div>
 * 
 * CSS Dependencies:
 * - .tagline, .tagline .text, .tagline .caret classes
 * - @keyframes glow, blink animations
 * - .tagline.fade class for fade-out
 * 
 * @module tagline
 */

(function () {
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Animation timing constants (in milliseconds)
   */
  const TIMING = {
    typeSpeed: 65,              // Base typing speed per character
    typeVariance: 25,            // Random variance for natural feel
    waitBetweenLines: 2000,      // Pause between line 1 and line 2
    holdAfterLine2: 5000,        // Hold tagline visible after completion
    fadeDuration: 2500,          // Fade-out duration
    waitBeforeRestart: 20000      // Pause before restarting loop
  };

  /**
   * Tagline text content
   */
  const TEXT = {
    line1: 'Every pixel tells a story.',
    line2: ' Let the world know yours.'
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Async sleep/delay function
   * 
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>} Promise that resolves after delay
   */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ============================================================================
  // Animation Functions
  // ============================================================================

  /**
   * Create a character span with glow animation
   * 
   * @param {string} ch - Character to display (or space)
   * @returns {HTMLSpanElement} Span element with character and animation
   */
  function makeCharSpan(ch) {
    const span = document.createElement('span');
    // Use non-breaking space for regular spaces
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.animation = 'glow 0.6s ease';
    return span;
  }

  /**
   * Clear glow animation from previous character
   * 
   * Removes the glow effect from the last character to maintain
   * visual clarity (only new characters glow).
   * 
   * @param {HTMLElement} textEl - Text container element
   */
  function clearPreviousGlow(textEl) {
    const last = textEl.lastElementChild;
    if (last) {
      last.style.animation = 'none';
      last.style.textShadow = 'none';
    }
  }

  /**
   * Type text character-by-character with glow effect
   * 
   * @param {string} text - Text to type
   * @param {number} baseSpeed - Base typing speed (ms per character)
   * @param {HTMLElement} textEl - Text container element
   * @returns {Promise<void>} Promise that resolves when typing is complete
   */
  async function typeText(text, baseSpeed, textEl) {
    for (let i = 0; i < text.length; i++) {
      // Clear previous character's glow
      clearPreviousGlow(textEl);
      
      // Add new character with glow
      const span = makeCharSpan(text[i]);
      textEl.appendChild(span);
      
      // Random variance for natural typing feel
      const variance = Math.random() * TIMING.typeVariance - (TIMING.typeVariance / 2);
      const delay = Math.max(20, baseSpeed + variance);
      
      await sleep(delay);
    }
    
    // Clear glow from last character
    clearPreviousGlow(textEl);
  }

  /**
   * Reset tagline to initial state
   * 
   * @param {HTMLElement} tag - Tagline container element
   * @param {HTMLElement} textEl - Text container element
   * @param {HTMLElement} caretEl - Caret element
   */
  function resetTagline(tag, textEl, caretEl) {
    // Reset container state
    tag.classList.remove('fade');
    textEl.innerHTML = '';
    
    // Reset caret to visible, blinking state
    caretEl.classList.remove('exit', 'fade-in');
    caretEl.style.display = 'inline-block';
    caretEl.style.opacity = '1';
    caretEl.style.transform = 'translateX(0)';
    caretEl.style.animation = 'blink 1s ease-in-out infinite';
  }

  /**
   * Hide caret instantly (no fade)
   * 
   * @param {HTMLElement} caretEl - Caret element
   */
  function hideCaret(caretEl) {
    caretEl.style.animation = 'none';
    caretEl.style.opacity = '0';
    caretEl.style.display = 'none';
  }

  /**
   * Run the complete tagline animation sequence
   * 
   * Loops infinitely with the following sequence:
   * 1. Reset to initial state
   * 2. Type first line
   * 3. Wait
   * 4. Type second line
   * 5. Hide caret
   * 6. Hold visible
   * 7. Fade out
   * 8. Wait before restart
   * 
   * @param {HTMLElement} tag - Tagline container element
   * @param {HTMLElement} textEl - Text container element
   * @param {HTMLElement} caretEl - Caret element
   */
  async function runSequence(tag, textEl, caretEl) {
    while (true) {
      // Reset to initial state
      resetTagline(tag, textEl, caretEl);

      // Type first line
      await typeText(TEXT.line1, TIMING.typeSpeed, textEl);

      // Wait before second line
      await sleep(TIMING.waitBetweenLines);

      // Type second line
      await typeText(TEXT.line2, TIMING.typeSpeed, textEl);

      // Hide caret instantly
      hideCaret(caretEl);

      // Hold full tagline visible
      await sleep(TIMING.holdAfterLine2);

      // Fade tagline text in place
      tag.classList.add('fade');
      await sleep(TIMING.fadeDuration);

      // Pause before restarting loop
      await sleep(TIMING.waitBeforeRestart);
    }
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize tagline component
   * 
   * Finds tagline element and starts the animation sequence.
   * Exits gracefully if required elements are not found.
   * 
   * @function initTagline
   * @returns {void}
   */
  function initTagline() {
    const tag = document.querySelector('.tagline');
    if (!tag) {
      return; // Tagline not present, exit gracefully
    }

    const textEl = tag.querySelector('.text');
    const caretEl = tag.querySelector('.caret');

    if (!textEl || !caretEl) {
      console.warn('Tagline component: Missing required elements (.text or .caret)');
      return;
    }

    // Start animation sequence
    runSequence(tag, textEl, caretEl);
  }

  /**
   * Initialize when DOM is ready
   * 
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTagline);
  } else {
    // DOM already ready, initialize immediately
    initTagline();
  }
})();
