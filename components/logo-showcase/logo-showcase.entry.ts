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

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const containers = document.querySelectorAll('[data-component="logo-showcase"]');

        // Fetch logos once
        const logos = await fetchLogos();

        containers.forEach((container) => {
            const app = createApp(LogoShowcase, {
                logos: logos
            });
            app.mount(container);
        });
    });

    // Support for dynamic loading (e.g., via Squarespace code blocks)
    window.addEventListener('componentLoaded', async (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.component === 'logo-showcase') {
            const container = customEvent.detail.container;
            if (container) {
                const logos = await fetchLogos();
                const app = createApp(LogoShowcase, {
                    logos: logos
                });
                app.mount(container);
            }
        }
    });
}
