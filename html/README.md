# Twin Gallery for Squarespace

## Quick Start

### Option 1: Complete HTML File (Recommended)
Use `twin-gallery-loader.html` - it contains everything you need:
1. CSS link from GitHub Pages
2. HTML structure for the gallery
3. JavaScript link from GitHub Pages

**In Squarespace:**
- Add a Code Block
- Copy the entire content of `twin-gallery-loader.html`
- Paste into the code block
- Update image URLs and links as needed

### Option 2: JavaScript Loader
Use `twin-gallery-loader.js` if you prefer to load assets separately:

**In Squarespace:**
1. Add a Code Block
2. Add this script tag:
   ```html
   <script src="https://assets.peachless.design/twin-gallery-loader.js"></script>
   ```
3. Add the HTML structure (without CSS/JS links):
   ```html
   <div class="twin-gallery">
     <a href="/projects/graphic-design" class="panel left">
       <img src="YOUR_IMAGE_URL" alt="Graphic Design">
     </a>
     <a href="/projects/ui-ux" class="panel right">
       <img src="YOUR_IMAGE_URL" alt="UI/UX">
     </a>
   </div>

   <div class="guidelines-wrapper">
     <a href="/projects/guidelines" class="guidelines-panel">
       <img src="YOUR_IMAGE_URL" alt="Guidelines">
     </a>
   </div>
   ```

## GitHub Pages Setup

Make sure your repository is configured for GitHub Pages and your domain (assets.peachless.design) is set up correctly.

All CSS and JS files should be accessible at:
- `https://assets.peachless.design/css/twin-gallery.css`
- `https://assets.peachless.design/js/twin-gallery.js`

