# Component Loader Usage

Instead of copying and pasting component HTML every time, you can use the **Component Loader** to dynamically load components from GitHub Pages.

## Benefits

- ✅ **Update once, update everywhere** - Change the component on GitHub, and all Squarespace pages update automatically
- ✅ **No more copy/paste** - Just paste a small script tag once
- ✅ **Easy to use** - Simple attribute-based loading

## Method 1: Using data-component Attribute (Recommended)

In a Squarespace Code Block, add:

```html
<script src="https://assets.peachless.design/js/component-loader.js"></script>
<div data-component="fortune-peach-loader"></div>
```

The component will automatically load into the `<div>` element.

### Example: Fortune Peach Component

```html
<script src="https://assets.peachless.design/js/component-loader.js"></script>
<div data-component="fortune-peach-loader"></div>
```

### Example: Twin Gallery Component

```html
<script src="https://assets.peachless.design/js/component-loader.js"></script>
<div data-component="twin-gallery-loader"></div>
```

## Method 2: Using JavaScript Function

You can also call the loader function directly:

```html
<script src="https://assets.peachless.design/js/component-loader.js"></script>
<script>
  loadComponent('fortune-peach-loader');
</script>
```

Or with a target element:

```html
<div id="my-component"></div>
<script src="https://assets.peachless.design/js/component-loader.js"></script>
<script>
  loadComponent('fortune-peach-loader', '#my-component');
</script>
```

## Available Components

Check `components-registry.json` or `components-registry.md` for the full list of available components.

Common components:
- `fortune-peach-loader` - Fortune Peach interactive widget
- `twin-gallery-loader` - Twin Gallery component
- `twin-gallery` - Twin Gallery (alternative version)

## Setup (One-Time)

**Good news:** The Component Loader is **already included** in the Global JS Loader! 

If you've already set up the Global JS Loader (see `SQUARESPACE-SETUP.md`), you're all set! The component-loader.js is automatically loaded.

**If you need to add it separately** (not recommended):
- Go to **Settings → Advanced → Code Injection**
- **Footer section:** Add: `<script src="https://assets.peachless.design/js/component-loader.js"></script>`
- **Important:** Add it AFTER the Global JS Loader

See [`LOADER-ORDER.md`](./LOADER-ORDER.md) for complete setup order.

2. **Use Components Anywhere:**
   - Add a **Code Block** on any page
   - Use the `data-component` attribute method above
   - Save

## How It Works

1. The loader script scans for `[data-component]` attributes
2. Fetches the component HTML from GitHub Pages
3. Injects it into the target element
4. Components update automatically when you push changes to GitHub

## Multiple Components on Same Page

You can use multiple components on the same page:

```html
<script src="https://assets.peachless.design/js/component-loader.js"></script>

<div data-component="fortune-peach-loader"></div>

<div data-component="twin-gallery-loader"></div>
```

## Notes

- The loader requires the **global CSS and JS loaders** to be set up in Squarespace Code Injection (Header/Footer)
- Component HTML is fetched from GitHub Pages, so updates are instant
- If a component fails to load, an error message will be displayed
- Components are loaded asynchronously

