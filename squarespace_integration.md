# Squarespace Integration Guide: Guideline Page

This guide explains how to deploy the **Guideline Page** component to your Squarespace site.

## 1. Build the Component
Run the build command to generate the production-ready JavaScript and CSS files:
```bash
npm run build:vue
```
This will create the following files in the `dist-vue/` directory:
- `components/guideline-page/guideline-page.js`
- `components/guideline-page/guideline-page.css`

## 2. Upload Assets
You need to host the JS, CSS, and JSON data files.
1.  **Upload JS & CSS:** Upload `guideline-page.js` and `guideline-page.css` to your server or Squarespace file storage (Link in Bio / Custom CSS / etc).
2.  **Upload Data:** Upload `data/brand-guidelines.json` to `https://assets.peachless.design/data/brand-guidelines.json`.
    *   *Note: If you cannot host on that specific domain, update the URL in `components/guideline-page/guideline-page.entry.ts` (line 60) and rebuild.*

## 3. Add to Squarespace Page
1.  Go to the Squarespace page where you want the component.
2.  Add a **Code Block**.
3.  Paste the following HTML code:

```html
<!-- Guideline Page Component Container -->
<div data-component="guideline-page"></div>

<!-- Load Component Styles -->
<link rel="stylesheet" href="https://your-cdn-url.com/components/guideline-page/guideline-page.css">

<!-- Load Component Script -->
<script src="https://your-cdn-url.com/components/guideline-page/guideline-page.js"></script>

<script>
    // Optional: Manually trigger initialization if needed
    if (window.initGuidelinePage) {
        window.initGuidelinePage();
    }
</script>
```

**Important:** Replace `https://your-cdn-url.com/...` with the actual URL where you uploaded the JS and CSS files.

## 4. Customization
You can override the title and subtitle directly in the HTML:
```html
<div data-component="guideline-page" 
     data-title="My Brand" 
     data-subtitle="Visual Identity System">
</div>
```
