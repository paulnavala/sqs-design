import { createApp } from 'vue';
import LogoShowcase from './LogoShowcase';
import './logo-showcase.css';

// Fetch logos data from JSON file
async function fetchLogos() {
    try {
        const response = await fetch('https://assets.peachless.design/data/logos.json');
        if (!response.ok) {
            // Fallback to local path if CDN fails
            const localResponse = await fetch('/data/logos.json');
            if (!localResponse.ok) throw new Error('Failed to fetch logos');
            const data = await localResponse.json();
            return data.logos || [];
        }
        const data = await response.json();
        return data.logos || [];
    } catch (error) {
        console.warn('Failed to load logos data:', error);
        // Return empty array as fallback
        return [];
    }
}

// Initialize logo showcase components
async function initLogoShowcase() {
    const containers = document.querySelectorAll('[data-component="logo-showcase"]');

    if (containers.length === 0) {
        return;
    }

    // Fetch logos once
    const logos = await fetchLogos();

    containers.forEach((container) => {
        // Skip if already initialized
        if (container.hasAttribute('data-logo-showcase-initialized')) {
            return;
        }

        container.setAttribute('data-logo-showcase-initialized', 'true');

        const app = createApp(LogoShowcase, {
            logos: logos
        });
        app.mount(container);
    });
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        // DOM not ready yet, wait for it
        document.addEventListener('DOMContentLoaded', initLogoShowcase);
    } else {
        // DOM is already ready, initialize immediately
        initLogoShowcase();
    }

    // Support for dynamic loading (e.g., via Squarespace code blocks loaded after page load)
    // Run initialization again after a short delay to catch any late-loaded elements
    setTimeout(initLogoShowcase, 100);
    setTimeout(initLogoShowcase, 500);
    setTimeout(initLogoShowcase, 1000);

    // Also expose as global function for manual initialization
    (window as any).initLogoShowcase = initLogoShowcase;
}
