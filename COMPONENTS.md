# Components Documentation

This directory contains organized CSS and JavaScript components extracted from the Squarespace legacy files.

## CSS Components

### `css/header.css`
Squarespace header logo centering styles.
- Centers logo using absolute positioning
- Responsive adjustments for mobile

### `css/twin-gallery.css`
Clickable panels with contrast pop effect.
- Two-column grid layout
- Hover effects with image dimming and highlighting
- Ken Burns animation
- Touch-friendly mobile behavior

### `css/elegant-footer.css`
Light footer with white background and black text.
- Grid-based layout
- Animated gradient border
- Newsletter signup
- Social links
- Scroll reveal animation

### `css/project-cards.css`
Elegant project cards with image backgrounds.
- Hover effects with background image reveal
- Parallax mouse movement support
- Responsive grid layout

### `css/prototype-showcase.css`
Two-column editorial prototype showcase with Figma embeds.
- Sticky prototype frame on desktop
- Reveal animations
- Proto button with image background on hover
- Figma embed styling

### `css/tagline.css`
Cinematic typewriter effect with soft caret fade.
- Animated caret with fade effects
- Glow animations for typed characters
- Smooth fade-out transitions

### `css/mobile-menu.css`
Enhanced mobile navigation overlay styles.
- Full-screen overlay menu
- Slide-in animation
- Focus trap for accessibility

### `css/portfolio.css`
Portfolio/projects page styling.
- Filter pills
- Project grid layout
- Modal for fullscreen prototypes
- Loading states

## JavaScript Components

### `js/twin-gallery.js`
Twin gallery hover interactions and mobile touch behavior.
- Panel highlight on hover
- Touch-friendly tap feedback
- Pointer-based sweep detection

### `js/elegant-footer.js`
Footer intersection observer for scroll reveal.
- Adds `is-inview` class when footer enters viewport
- Fallback for browsers without IntersectionObserver

### `js/project-card.js`
Project card parallax mouse movement effect.
- Tracks mouse position relative to card
- Applies CSS custom properties for parallax effect

### `js/prototype-showcase.js`
Figma prototype showcase functionality.
- Auto-updates year in caption
- Reveal animation on scroll
- Fallback handling if iframe fails to load
- Analytics tracking on CTA clicks

### `js/tagline.js`
Cinematic typewriter effect implementation.
- Types out two lines of text
- Character-by-character animation with glow
- Caret fade effects
- Loop sequence with timing controls

### `js/mobile-menu.js`
Mobile Menu Extension (MMX) for Squarespace.
- Auto-detects mobile menu toggle button
- Clones navigation links from header
- Builds overlay menu dynamically
- Keyboard navigation and focus management
- Closes on desktop resize

### `js/portfolio.js`
Portfolio/projects page functionality.
- Reads project data from HTML list
- Renders project cards dynamically
- Category filtering system
- Fullscreen modal for prototypes
- Lazy loading with IntersectionObserver
- Focus trap in modal

### `js/utilities.js`
Reusable utility functions.
- Reveal-on-scroll for multiple elements
- Mobile viewport height fix (address bar aware)
- Sets CSS custom property `--vh`

## Usage

Each component is self-contained and initializes on `DOMContentLoaded`. Simply include the CSS and JS files you need:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/header.css">
<link rel="stylesheet" href="css/twin-gallery.css">
<link rel="stylesheet" href="css/elegant-footer.css">

<!-- JavaScript -->
<script src="js/twin-gallery.js"></script>
<script src="js/elegant-footer.js"></script>
```

## Notes

- All components use IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
- Components check for `DOMContentLoaded` before initializing
- IntersectionObserver is used with fallbacks for older browsers
- Accessibility features included (ARIA attributes, keyboard navigation, focus management)
- Reduced motion preferences are respected where applicable

