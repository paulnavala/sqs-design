/**
 * Component Loader for Squarespace
 * Dynamically loads component HTML from GitHub Pages
 * 
 * Usage in Squarespace Code Block:
 * <script src="https://assets.peachless.design/js/component-loader.js"></script>
 * <div data-component="fortune-peach-loader"></div>
 * 
 * Or use the shorthand:
 * <script>
 *   loadComponent('fortune-peach-loader');
 * </script>
 */

(function() {
  'use strict';
  
  const BASE_URL = 'https://assets.peachless.design';
  const COMPONENTS_DIR = '/html';
  
  /**
   * Load a component HTML file and inject it into the target element
   */
  function loadComponent(componentName, targetElement) {
    // If componentName already includes .html, remove it
    const filename = componentName.endsWith('.html') 
      ? componentName 
      : componentName + '.html';
    
    const url = BASE_URL + COMPONENTS_DIR + '/' + filename;
    
    // If targetElement is a string, treat it as a selector
    let target = targetElement;
    if (typeof targetElement === 'string') {
      target = document.querySelector(targetElement);
    }
    
    // If no target provided, create a container
    if (!target) {
      target = document.createElement('div');
      // Find where to insert - look for the script tag that called this
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];
      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(target, currentScript);
      } else {
        document.body.appendChild(target);
      }
    }
    
    // Fetch and inject component HTML
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load component: ${filename}`);
        }
        return response.text();
      })
      .then(html => {
        // Remove HTML comments for cleaner injection
        const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').trim();
        target.innerHTML = cleanHtml;
        
        // Dispatch custom event when component is loaded
        target.dispatchEvent(new CustomEvent('componentLoaded', {
          detail: { componentName: filename, target: target }
        }));
      })
      .catch(error => {
        console.error('Error loading component:', error);
        target.innerHTML = `<p style="color: red; padding: 20px;">Error loading component: ${filename}</p>`;
      });
  }
  
  /**
   * Auto-load components marked with data-component attribute
   */
  function autoLoadComponents() {
    const componentElements = document.querySelectorAll('[data-component]');
    componentElements.forEach(element => {
      const componentName = element.getAttribute('data-component');
      if (componentName) {
        loadComponent(componentName, element);
      }
    });
  }
  
  // Auto-load components when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoadComponents);
  } else {
    autoLoadComponents();
  }
  
  // Expose loadComponent globally for manual use
  window.loadComponent = loadComponent;
  
})();

