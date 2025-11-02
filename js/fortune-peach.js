/**
 * Fortune Peach Component
 * Handles fortune reveal interactions and reset functionality
 */

(function(){
  'use strict';

  function initFortunePeach() {
    const root  = document.getElementById('fortunePeach');
    if (!root) return;

    const svgBtn= document.getElementById('peachTrigger');
    const tryBtn= document.getElementById('tryAgain');
    const quote = document.getElementById('slipQuote');
    const nums  = document.getElementById('slipNums');

    if (!svgBtn || !tryBtn || !quote || !nums) return;

    const fortunes = [
      {quote:"The best time to plant a tree was 20 years ago. The second best time is now.",nums:[7,14,23,42,51,68]},
      {quote:"Your limitation—it's only your imagination.",nums:[3,18,27,36,49,63]},
      {quote:"Great things never come from comfort zones.",nums:[5,12,28,41,55,67]},
      {quote:"Success doesn't just find you. You have to go out and get it.",nums:[9,16,24,38,52,61]},
      {quote:"Everything you've ever wanted is on the other side of fear.",nums:[5,18,27,39,51,64]},
      {quote:"The best way to predict the future is to create it.",nums:[8,20,33,45,54,63]},
      {quote:"Act as if what you do makes a difference. It does.",nums:[1,11,24,36,48,61]}
    ];

    function randomFortune(){
      const f = fortunes[Math.floor(Math.random()*fortunes.length)];
      quote.textContent = `"${f.quote}"`;
      nums.textContent  = `Lucky numbers: ${f.nums.join(' · ')}`;
    }

    function reveal(){
      randomFortune();
      root.classList.add('revealed');
    }

    function reset(){
      root.classList.remove('revealed');
      svgBtn.focus({preventScroll:true});
    }

    svgBtn.addEventListener('click', reveal);
    svgBtn.addEventListener('keydown', (e)=>{ 
      if(e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        reveal(); 
      }
    });
    tryBtn.addEventListener('click', reset);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFortunePeach);
  } else {
    initFortunePeach();
  }

  // Also allow manual initialization
  window.initFortunePeach = initFortunePeach;
})();

