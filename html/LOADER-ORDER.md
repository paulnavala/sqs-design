# Loader Order and Dependencies

## Recommended Load Order

The three loaders should be loaded in this specific order for best results:

### 1. Global CSS Loader (Header) 
**Location:** Settings → Advanced → Code Injection → **Header**

```html
<script src="https://assets.peachless.design/js/global-css-loader.js"></script>
```

**Why Header?** CSS should load early so styles are available when components render.

### 2. Global JS Loader (Footer)
**Location:** Settings → Advanced → Code Injection → **Footer**

```html
<script src="https://assets.peachless.design/js/global-js-loader.js"></script>
```

**Why Footer?** JavaScript should load after the DOM is ready. This loads:
- `utilities.js` (first - dependencies)
- `component-loader.js` (early - for dynamic loading)
- All other component JS files

### 3. Component Loader (Already Included!)
**Status:** ✅ **Already included in Global JS Loader**

The `component-loader.js` is automatically loaded by the Global JS Loader, so you don't need to add it separately!

## Complete Setup (Copy This)

### Header Section:
```html
<script src="https://assets.peachless.design/js/global-css-loader.js"></script>
```

### Footer Section:
```html
<script src="https://assets.peachless.design/js/global-js-loader.js"></script>
```

That's it! The component-loader is included in the global JS loader.

## Why This Order?

1. **CSS First (Header)** - Ensures styles are loaded before any HTML renders
2. **JS Second (Footer)** - Scripts run after DOM is ready, and component-loader is included
3. **Component Loader Auto-Runs** - When it finds `[data-component]` attributes, it injects HTML and triggers component initialization

## What Happens

1. **Page loads** → CSS loader runs (Header)
2. **DOM ready** → JS loader runs (Footer)
3. **Component loader runs** → Finds `[data-component]` elements
4. **HTML injected** → Component JS detects and initializes automatically

## Important Notes

- ✅ CSS loader MUST be in Header (or very early)
- ✅ JS loader MUST be in Footer (or after DOM ready)
- ✅ Component loader is already in the JS loader - don't add it separately
- ⚠️ If you add component-loader separately, put it AFTER the global JS loader

## Troubleshooting

### Components not styling correctly?
- Make sure CSS loader is in the **Header** section
- Check that CSS files are loading (Network tab in DevTools)

### Components not initializing?
- Make sure JS loader is in the **Footer** section  
- Check that component JS files are loading (Network tab)
- Verify component HTML was injected (inspect element)

### Timing Issues?
- If components load before scripts, they'll still work (scripts re-initialize)
- The component-loader triggers initialization after injection

