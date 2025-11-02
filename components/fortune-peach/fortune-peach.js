/**
 * Fortune Peach Component
 * 
 * Interactive fortune cookie widget with three-state animation:
 * - Unopened: Initial state with floating peach
 * - Cracking: Animation transition with particle effects
 * - Revealed: Shows fortune text and lucky numbers
 * 
 * Features:
 * - Random fortune selection from predefined collection
 * - Lucky number generation (6 unique numbers)
 * - Particle explosion animation on reveal
 * - Smooth state transitions
 * - Keyboard accessibility (Enter/Space to activate)
 * - Reset functionality to reveal new fortunes
 * 
 * HTML Structure Required:
 * <div id="flwStage" class="flw-stage">
 *   <button id="flwLogoBtn">...</button>
 *   <button id="flwTap">...</button>
 *   <div id="flwCracking">...</div>
 *   <div id="flwRevealed">
 *     <p id="flwQuote"></p>
 *     <div id="flwBalls"></div>
 *     <button id="flwAgain">Try Again</button>
 *   </div>
 *   <div id="flwParticles"></div>
 * </div>
 * 
 * CSS Dependencies:
 * - .flw-stage, .flw-stage--unopened, .flw-stage--cracking, .flw-stage--revealed
 * - Particle and animation classes
 * 
 * @module fortune-peach
 */

(function(){
  'use strict';

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Collection of fortune cookie messages
   * 
   * Randomly selected when user clicks to reveal fortune.
   * Can be customized with your own messages.
   * 
   * @constant {Array<string>}
   */
  const FORTUNES = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Success doesn't just find you. You have to go out and get it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Little by little, a little becomes a lot.",
    "The secret of getting ahead is getting started.",
    "Believe you can and you're halfway there.",
    "Opportunities don't happen. You create them.",
    "Everything you've ever wanted is on the other side of fear."
  ];

  /**
   * Lucky number generation settings
   */
  const LUCKY_NUMBERS = {
    count: 6,      // Number of lucky numbers to generate
    min: 1,        // Minimum number
    max: 70        // Maximum number
  };

  /**
   * Animation timing (in milliseconds)
   */
  const TIMING = {
    crackingDuration: 1500,      // Duration of cracking animation
    particleCleanup: 1500        // Time before cleaning up particles
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Generate random fortune and lucky numbers
   * 
   * @returns {Object} Object with quote (string) and lucky (Array<number>)
   */
  function randomFortune() {
    // Randomly select a fortune message
    const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    
    // Generate unique lucky numbers
    const nums = new Set();
    while (nums.size < LUCKY_NUMBERS.count) {
      nums.add(
        LUCKY_NUMBERS.min + 
        Math.floor(Math.random() * (LUCKY_NUMBERS.max - LUCKY_NUMBERS.min + 1))
      );
    }
    
    return {
      quote: quote,
      lucky: Array.from(nums).sort((a, b) => a - b) // Sorted ascending
    };
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Set animation stage (state)
   * 
   * Manages CSS classes to control which stage is visible:
   * - unopened: Initial state
   * - cracking: Transition animation
   * - revealed: Final state with fortune
   * 
   * @param {string} name - Stage name ('unopened', 'cracking', 'revealed')
   * @param {HTMLElement} stage - Stage container element
   * @param {HTMLElement} cracking - Cracking animation element
   * @param {HTMLElement} revealed - Revealed content element
   */
  function setStage(name, stage, cracking, revealed) {
    // Remove all stage classes
    stage.classList.remove('flw-stage--unopened', 'flw-stage--cracking', 'flw-stage--revealed');
    
    // Add current stage class
    stage.classList.add('flw-stage--' + name);
    
    // Show/hide elements based on stage
    cracking.hidden = name !== 'cracking';
    revealed.hidden = name !== 'revealed';
  }

  // ============================================================================
  // Animation Functions
  // ============================================================================

  /**
   * Spawn particle explosion effect
   * 
   * Creates animated particles that explode from the center of the peach
   * during the cracking animation.
   * 
   * @param {HTMLElement} particles - Particles container element
   */
  function spawnParticles(particles) {
    // Clear previous particles
    particles.innerHTML = '';
    
    const count = 20; // Number of particles to spawn
    const box = particles.getBoundingClientRect();
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'flw-p animate';
      
      // Position at center of container
      particle.style.left = (box.width / 2) + 'px';
      particle.style.top = (box.height / 2) + 'px';
      
      // Random direction for each particle
      const dx = (Math.random() - 0.5) * 220;
      const dy = (Math.random() - 0.5) * 220;
      
      // Set CSS custom properties for animation
      particle.style.setProperty('--dx', dx + 'px');
      particle.style.setProperty('--dy', dy + 'px');
      
      // Random delay for staggered effect
      particle.style.animationDelay = (0.3 + Math.random() * 0.3) + 's';
      
      particles.appendChild(particle);
    }
    
    // Cleanup particles after animation completes
    setTimeout(() => {
      particles.innerHTML = '';
    }, TIMING.particleCleanup);
  }

  /**
   * Create and display lucky number ball
   * 
   * @param {number} number - Lucky number to display
   * @param {number} index - Index for staggered animation delay
   * @param {HTMLElement} ballsEl - Container element for balls
   */
  function createLuckyBall(number, index, ballsEl) {
    const ball = document.createElement('span');
    ball.className = 'flw-ball';
    
    // Staggered animation delay (appears after reveal)
    ball.style.animationDelay = (0.1 * index + 0.2) + 's';
    
    // Set number text (explicitly convert to string)
    ball.textContent = String(number);
    
    // Ensure no spacing issues
    ball.style.margin = '0';
    ball.style.padding = '0';
    
    ballsEl.appendChild(ball);
  }

  /**
   * Start cracking animation and reveal fortune
   * 
   * Manages the complete reveal sequence:
   * 1. Generate random fortune and lucky numbers
   * 2. Transition to cracking state
   * 3. Spawn particles
   * 4. After delay, reveal fortune text and lucky numbers
   * 
   * @param {Object} elements - All required DOM elements
   */
  function crack(elements) {
    const { stage, cracking, revealed, quoteEl, ballsEl, particles } = elements;
    
    // Generate new random fortune
    const pick = randomFortune();
    
    // Transition to "cracking" state
    setStage('cracking', stage, cracking, revealed);
    
    // Spawn particle explosion
    spawnParticles(particles);
    
    // After cracking animation, reveal fortune
    setTimeout(() => {
      // Display fortune quote
      quoteEl.textContent = '"' + pick.quote + '"';
      
      // Clear previous lucky numbers
      ballsEl.innerHTML = '';
      
      // Create and display lucky number balls with staggered animation
      pick.lucky.forEach((number, index) => {
        createLuckyBall(number, index, ballsEl);
      });
      
      // Transition to "revealed" state
      setStage('revealed', stage, cracking, revealed);
    }, TIMING.crackingDuration);
  }

  /**
   * Reset to initial state
   * 
   * Allows user to try again and get a new fortune.
   * 
   * @param {Object} elements - All required DOM elements
   */
  function reset(elements) {
    const { stage, cracking, revealed } = elements;
    setStage('unopened', stage, cracking, revealed);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize Fortune Peach widget
   * 
   * Sets up event listeners and validates required elements.
   * Exits gracefully if elements are not found.
   * 
   * @function initFortuneLogoWidget
   * @returns {void}
   */
  function initFortuneLogoWidget() {
    // Get stage container
    const stage = document.getElementById('flwStage');
    if (!stage) {
      return; // Component not present, exit gracefully
    }

    // Get all required elements
    const logoBtn = document.getElementById('flwLogoBtn');
    const tapBtn = document.getElementById('flwTap');
    const cracking = document.getElementById('flwCracking');
    const revealed = document.getElementById('flwRevealed');
    const again = document.getElementById('flwAgain');
    const quoteEl = document.getElementById('flwQuote');
    const ballsEl = document.getElementById('flwBalls');
    const particles = document.getElementById('flwParticles');

    // Validate all required elements are present
    if (!logoBtn || !tapBtn || !cracking || !revealed || 
        !again || !quoteEl || !ballsEl || !particles) {
      console.warn('Fortune Peach: Missing required elements');
      return;
    }

    // Bundle elements for easy passing
    const elements = {
      stage,
      cracking,
      revealed,
      quoteEl,
      ballsEl,
      particles
    };

    // ========================================================================
    // Event Listeners
    // ========================================================================
    
    // Click handlers for reveal buttons
    logoBtn.addEventListener('click', () => crack(elements));
    tapBtn.addEventListener('click', () => crack(elements));
    
    // Reset button
    again.addEventListener('click', () => reset(elements));

    // ========================================================================
    // Keyboard Accessibility
    // ========================================================================
    
    /**
     * Support keyboard activation (Enter/Space)
     * 
     * Makes the component accessible for keyboard-only users.
     */
    logoBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        crack(elements);
      }
    });
  }

  /**
   * Initialize when DOM is ready
   * 
   * Supports both standard DOMContentLoaded and cases where script
   * loads after DOM is already ready (e.g., Squarespace AJAX navigation)
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFortuneLogoWidget);
  } else {
    // DOM already ready, initialize immediately
    initFortuneLogoWidget();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Expose initialization function globally
   * 
   * Allows manual initialization if component is loaded dynamically.
   * Also maintains backward compatibility with legacy name.
   */
  window.initFortuneLogoWidget = initFortuneLogoWidget;
  window.initFortunePeach = initFortuneLogoWidget; // Alias for consistency
})();
