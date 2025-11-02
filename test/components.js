/**
 * Component Test Loader
 * Dynamically loads and displays all components from the registry
 */

(function() {
  'use strict';
  
  // Load component registry
  fetch('../html/components-registry.json')
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector('.test-container');
      
      // Create sections for each component
      data.components.forEach((component, index) => {
        const section = document.createElement('div');
        section.className = 'component-section';
        section.innerHTML = `
          <h2 class="component-title">${component.name}</h2>
          <div class="component-info">
            <strong>File:</strong> ${component.filename}<br>
            <strong>Description:</strong> ${component.description}
          </div>
          <div class="component-content" id="component-${index}"></div>
        `;
        
        container.appendChild(section);
        
        // Load component HTML
        fetch(`../html/${component.filename}`)
          .then(response => response.text())
          .then(html => {
            // Remove HTML comments and extract just the component
            const cleanHtml = html
              .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
              .trim();
            
            document.getElementById(`component-${index}`).innerHTML = cleanHtml;
          })
          .catch(err => {
            console.error(`Failed to load ${component.filename}:`, err);
            document.getElementById(`component-${index}`).innerHTML = 
              `<p style="color: red;">Error loading component</p>`;
          });
      });
    })
    .catch(err => {
      console.error('Failed to load component registry:', err);
    });
})();

