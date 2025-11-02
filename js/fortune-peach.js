/**
 * Fortune Peach Component
 * Handles fortune reveal with cracking animation and particle effects
 */

(function(){
  'use strict';

  function initFortuneLogoWidget() {
    const stage = document.getElementById('flwStage');
    if (!stage) return;

    const logoBtn = document.getElementById('flwLogoBtn');
    const tapBtn = document.getElementById('flwTap');
    const cracking = document.getElementById('flwCracking');
    const revealed = document.getElementById('flwRevealed');
    const again = document.getElementById('flwAgain');
    const quoteEl = document.getElementById('flwQuote');
    const ballsEl = document.getElementById('flwBalls');
    const particles = document.getElementById('flwParticles');

    if (!logoBtn || !tapBtn || !cracking || !revealed || !again || !quoteEl || !ballsEl || !particles) return;

    // Collection of fortunes
    const fortunes = [
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

    function randomFortune(){
      const q = fortunes[Math.floor(Math.random()*fortunes.length)];
      const nums = new Set();
      while(nums.size < 6) nums.add(1 + Math.floor(Math.random()*70));
      return { quote: q, lucky: Array.from(nums).sort((a,b)=>a-b) };
    }

    function setStage(name){
      stage.classList.remove('flw-stage--unopened','flw-stage--cracking','flw-stage--revealed');
      stage.classList.add('flw-stage--' + name);
      cracking.hidden = name !== 'cracking';
      revealed.hidden = name !== 'revealed';
    }

    function spawnParticles(){
      particles.innerHTML = '';
      const count = 20;
      const box = particles.getBoundingClientRect();
      for(let i=0;i<count;i++){
        const d = document.createElement('span');
        d.className = 'flw-p animate';
        // initial position at center
        d.style.left = (box.width/2) + 'px';
        d.style.top = (box.height/2) + 'px';
        // random directions
        const dx = (Math.random() - 0.5) * 220;
        const dy = (Math.random() - 0.5) * 220;
        d.style.setProperty('--dx', dx + 'px');
        d.style.setProperty('--dy', dy + 'px');
        // random delay
        d.style.animationDelay = (0.3 + Math.random()*0.3) + 's';
        particles.appendChild(d);
      }
      // cleanup after animation
      setTimeout(()=>{ particles.innerHTML = ''; }, 1500);
    }

    function crack(){
      const pick = randomFortune();
      // transition to "cracking" state
      setStage('cracking');
      spawnParticles();
      // after 1.5s => revealed
      setTimeout(()=>{
        quoteEl.textContent = '"' + pick.quote + '"';
        ballsEl.innerHTML = '';
        pick.lucky.forEach((n, idx)=>{
          const b = document.createElement('span');
          b.className = 'flw-ball';
          b.style.animationDelay = (0.1 * idx + 0.2) + 's';
          b.textContent = n;
          ballsEl.appendChild(b);
        });
        setStage('revealed');
      }, 1500);
    }

    function reset(){
      setStage('unopened');
    }

    logoBtn.addEventListener('click', crack);
    tapBtn.addEventListener('click', crack);
    again.addEventListener('click', reset);

    // Keyboard accessibility
    logoBtn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        crack();
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFortuneLogoWidget);
  } else {
    initFortuneLogoWidget();
  }

  // Also allow manual initialization
  window.initFortuneLogoWidget = initFortuneLogoWidget;
})();
