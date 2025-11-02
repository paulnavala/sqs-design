# Component Syntax Reference

Generated: 02/11/2025, 23:31:26

Quick reference for using components in Squarespace Code Blocks.

## Quick Copy Table

<table>
  <thead>
    <tr>
      <th>Component Name</th>
      <th>Syntax</th>
      <th>Copy Code</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Fortune Peach</td>
      <td><code class="copyable" data-copy="fortune-peach">fortune-peach <span class="copy-icon">📋</span></code></td>
      <td><code class="copyable" data-copy="&lt;div data-component=&quot;fortune-peach&quot;&gt;&lt;/div&gt;">&lt;div data-component=&quot;fortune-peach&quot;&gt;&lt;/div&gt; <span class="copy-icon">📋</span></code></td>
    </tr>
    <tr>
      <td>Portfolio Uiux</td>
      <td><code class="copyable" data-copy="portfolio-uiux">portfolio-uiux <span class="copy-icon">📋</span></code></td>
      <td><code class="copyable" data-copy="&lt;div data-component=&quot;portfolio-uiux&quot;&gt;&lt;/div&gt;">&lt;div data-component=&quot;portfolio-uiux&quot;&gt;&lt;/div&gt; <span class="copy-icon">📋</span></code></td>
    </tr>
    <tr>
      <td>Twin Gallery</td>
      <td><code class="copyable" data-copy="twin-gallery">twin-gallery <span class="copy-icon">📋</span></code></td>
      <td><code class="copyable" data-copy="&lt;div data-component=&quot;twin-gallery&quot;&gt;&lt;/div&gt;">&lt;div data-component=&quot;twin-gallery&quot;&gt;&lt;/div&gt; <span class="copy-icon">📋</span></code></td>
    </tr>
  </tbody>
</table>

<p><em>💡 Click any code cell to copy it to your clipboard</em></p>

---

## Component Loader Syntax

All components use the same simple syntax with the `data-component` attribute:

```html
<div data-component="COMPONENT-NAME"></div>
```

---

## Available Components

### Fortune Peach

**Description:** Interactive fortune reveal widget with cracking animation and particle effects.

**Syntax:**

```html
<div data-component="fortune-peach"></div>
```

---

### Portfolio Uiux

**Description:** Modern portfolio showcase with filtering, Figma embeds, intro/CTA cards, and fullscreen modal views.

**Syntax:**

```html
<div data-component="portfolio-uiux"></div>
```

---

### Twin Gallery

**Description:** Clickable image gallery with two panels and optional guidelines section.

**Syntax:**

```html
<div data-component="twin-gallery"></div>
```

---

## Quick Copy-Paste List

### All Components at Once:

```html
<div data-component="fortune-peach"></div>
<div data-component="portfolio-uiux"></div>
<div data-component="twin-gallery"></div>
```

## Usage Notes

- Make sure the **Component Loader** is set up (it's included in the Global JS Loader)
- Just paste the `<div data-component="..."></div>` syntax in any Code Block
- Components automatically load from GitHub Pages
- Updates are automatic - change component on GitHub, Squarespace updates instantly

---

> **Note:** This file is auto-generated. Run `npm run generate-loaders` to regenerate.

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const copyableElements = document.querySelectorAll('.copyable');
    
    copyableElements.forEach(element => {
      element.style.cursor = 'pointer';
      element.style.userSelect = 'none';
      element.title = 'Click to copy';
      
      element.addEventListener('click', function() {
        // getAttribute automatically decodes HTML entities
        const textToCopy = this.getAttribute('data-copy');
        
        // Use modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const copyIcon = this.querySelector('.copy-icon');
            const originalIcon = copyIcon ? copyIcon.textContent : '';
            if (copyIcon) {
              copyIcon.textContent = '✓';
              copyIcon.style.color = '#28a745';
            }
            
            setTimeout(() => {
              if (copyIcon) {
                copyIcon.textContent = originalIcon;
                copyIcon.style.color = '';
              }
            }, 1500);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          
          try {
            document.execCommand('copy');
            const copyIcon = this.querySelector('.copy-icon');
            const originalIcon = copyIcon ? copyIcon.textContent : '';
            if (copyIcon) {
              copyIcon.textContent = '✓';
              copyIcon.style.color = '#28a745';
            }
            
            setTimeout(() => {
              if (copyIcon) {
                copyIcon.textContent = originalIcon;
                copyIcon.style.color = '';
              }
            }, 1500);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
          
          document.body.removeChild(textarea);
        }
      });
    });
  });
</script>

<style>
  .copyable {
    transition: color 0.2s ease;
  }
  
  .copyable:hover {
    opacity: 0.8;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  
  table th,
  table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  table code {
    background-color: #f1f3f5;
    padding: 4px 8px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    display: inline-block;
    position: relative;
  }
  
  .copy-icon {
    margin-left: 6px;
    font-size: 0.85em;
    opacity: 0.7;
    transition: all 0.2s ease;
  }
  
  .copyable:hover .copy-icon {
    opacity: 1;
    transform: scale(1.1);
  }
</style>
