# Squarespace Setup Guide

## How to Link Global Loaders in Squarespace

Follow these steps to add the global CSS and JavaScript loaders to your Squarespace site.

---

## Two Methods Available

### Method 1: Link by URL (Recommended) ⭐

Link directly to the loader files hosted on GitHub Pages. **Easier to update** - just regenerate and push to GitHub.

### Method 2: Copy/Paste Code

Copy the loader code directly into Squarespace. Requires re-pasting when files change.

---

## Method 1: Link by URL (Recommended)

### Step 1: Access Code Injection

1. Log into your Squarespace site
2. Go to **Settings** (gear icon in the left sidebar)
3. Click **Advanced**
4. Click **Code Injection**

You'll see two sections:
- **Header** - for CSS loader
- **Footer** - for JavaScript loader

### Step 2: Add CSS Loader Link to Header

In the **Header** field, paste this single line:

```html
<script src="https://assets.peachless.design/js/global-css-loader.js"></script>
```

Click **Save**.

**What this does:** Loads all CSS files from your GitHub Pages site sitewide.

### Step 3: Add JavaScript Loader Link to Footer

In the **Footer** field, paste this single line:

```html
<script src="https://assets.peachless.design/js/global-js-loader.js"></script>
```

Click **Save**.

**What this does:** Loads all JavaScript files from your GitHub Pages site sitewide.

---

## Method 2: Copy/Paste Code

### Step 1: Access Code Injection

1. Log into your Squarespace site
2. Go to **Settings** (gear icon in the left sidebar)
3. Click **Advanced**
4. Click **Code Injection**

You'll see two sections:
- **Header** - for CSS loader
- **Footer** - for JavaScript loader

### Step 2: Add CSS Loader to Header

1. Open the file `html/global-css-loader.html` on your computer
2. Select **ALL** the content (including the comment and the `<script>` tag)
3. Copy the entire content (Ctrl+C / Cmd+C)
4. In Squarespace Code Injection, paste into the **Header** field
5. Click **Save**

**What this does:** Loads all CSS files from your GitHub Pages site sitewide.

### Step 3: Add JavaScript Loader to Footer

1. Open the file `html/global-js-loader.html` on your computer
2. Select **ALL** the content (including the comment and the `<script>` tag)
3. Copy the entire content (Ctrl+C / Cmd+C)
4. In Squarespace Code Injection, paste into the **Footer** field
5. Click **Save**

**What this does:** Loads all JavaScript files from your GitHub Pages site sitewide.

---

## Visual Guide

```
Squarespace Admin
└── Settings
    └── Advanced
        └── Code Injection
            ├── Header: [Paste global-css-loader.html content here]
            └── Footer: [Paste global-js-loader.html content here]
```

---

## Important Notes

### ✅ Do This:
- Copy the **entire** content of each loader file
- Paste into the correct section (CSS in Header, JS in Footer)
- Click **Save** after pasting

### ❌ Don't Do This:
- Don't just copy the script tags without the comments
- Don't paste both loaders in the same field
- Don't forget to save after pasting

---

## Verification

After adding the loaders:

1. **Visit your live site** (not the editor)
2. **Open browser Developer Tools** (F12 or Right-click → Inspect)
3. **Go to the Network tab**
4. **Refresh the page**
5. **Look for requests** to `assets.peachless.design/css/` and `assets.peachless.design/js/`

You should see all your CSS and JS files loading from GitHub Pages.

---

## Troubleshooting

### Loaders Not Working?

1. **Check the BASE_URL:**
   - Make sure `BASE_URL` in the loader files matches your GitHub Pages domain
   - Default is: `https://assets.peachless.design`

2. **Verify GitHub Pages:**
   - Ensure your repository is published to GitHub Pages
   - Check that files are accessible at `https://assets.peachless.design/css/[filename].css`

3. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Common issues: CORS errors, 404 errors (file not found)

4. **Verify Code Injection:**
   - Make sure you saved after pasting
   - Check that the code is still there (sometimes Squarespace strips code)
   - Try re-pasting if needed

### Files Not Loading?

- **Check file paths:** Ensure your CSS/JS files are in the correct directories (`css/` and `js/`)
- **Run the generator:** Run `npm run generate-loaders` to update the file lists
- **Update Squarespace:** After regenerating loaders, copy the new content to Squarespace

---

## Alternative: Direct File Links

If you prefer to link files directly (not recommended for multiple files), you can add individual links in the Header:

```html
<link rel="stylesheet" href="https://assets.peachless.design/css/twin-gallery.css">
```

However, using the global loaders is recommended because:
- ✅ Automatically loads all files
- ✅ Easy to update (just regenerate and re-paste)
- ✅ Prevents duplicate loading
- ✅ Better performance

---

## Updating Loaders

### Method 1 (Linked): Automatic Updates ⭐

When you add new CSS or JS files:

1. Run `npm run generate-loaders` locally
2. Commit and push to GitHub
3. **That's it!** The loaders will automatically include new files

No need to update Squarespace - the linked files update automatically!

### Method 2 (Copy/Paste): Manual Updates

When you add new CSS or JS files:

1. Run `npm run generate-loaders` locally
2. Copy the updated loader content from the generated files
3. Replace the old code in Squarespace Code Injection
4. Save

The loaders will automatically include any new files you've added.

---

## Need Help?

- Check `html/README.md` for more information
- Verify your GitHub Pages setup
- Check the browser console for specific errors

