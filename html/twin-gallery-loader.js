/**
 * Twin Gallery Loader for Squarespace
 * Dynamically loads CSS and JS from GitHub Pages
 * 
 * Usage in Squarespace:
 * Add this single script tag to a Code Block:
 * <script src="https://assets.peachless.design/twin-gallery-loader.js"></script>
 */

(function() {
  'use strict';
  
  const BASE_URL = 'https://assets.peachless.design';
  
  // Function to load CSS
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  
  // Function to load JS
  function loadJS(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }
  
  // Load CSS
  loadCSS(BASE_URL + '/css/twin-gallery.css');
  
  // Load JS
  loadJS(BASE_URL + '/js/twin-gallery.js');
})();

