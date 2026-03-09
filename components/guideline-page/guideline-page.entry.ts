import { createApp } from 'vue';
import GuidelinePage from './GuidelinePage';
import './guideline-page.css';

// Default Peachless brand data
const defaultBrands = [
    {
        id: 'peachless',
        name: 'Peachless',
        description: 'Personal brand guidelines and visual identity standards',
        logo: '/assets/guidelines/peachless/01-cover.svg',
        guidelines: [
            {
                name: 'Page 1',
                path: '/assets/guidelines/peachless/01-cover.svg'
            },
            {
                name: 'Page 2',
                path: '/assets/guidelines/peachless/02-logo-construction.svg'
            },
            {
                name: 'Page 3',
                path: '/assets/guidelines/peachless/03-clear-space.svg'
            },
            {
                name: 'Page 4',
                path: '/assets/guidelines/peachless/04-color-palette.svg'
            },
            {
                name: 'Page 5',
                path: '/assets/guidelines/peachless/05-typography.svg'
            },
            {
                name: 'Page 6',
                path: '/assets/guidelines/peachless/06-iconography.svg'
            },
            {
                name: 'Page 7',
                path: '/assets/guidelines/peachless/07-dos-and-donts.svg'
            },
            {
                name: 'Page 8',
                path: '/assets/guidelines/peachless/08-stationery.svg'
            },
            {
                name: 'Page 9',
                path: '/assets/guidelines/peachless/09-social-media.svg'
            },
            {
                name: 'Page 10',
                path: '/assets/guidelines/peachless/10-merchandise.svg'
            }
        ]
    }
];

// Fetch brand data from JSON file or use defaults
async function fetchBrandData() {
    try {
        const response = await fetch('https://assets.peachless.design/data/brand-guidelines.json');
        if (!response.ok) {
            // Fallback to local path if CDN fails
            // Try root-relative first, then relative to component
            let localResponse = await fetch('/data/brand-guidelines.json');
            if (!localResponse.ok) {
                localResponse = await fetch('../../data/brand-guidelines.json');
            }
            if (!localResponse.ok) throw new Error('Failed to fetch brand guidelines');
            return await localResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.warn('Failed to load brand guidelines data, using defaults:', error);
        // Return default data structure
        return {
            title: 'Brand Guidelines',
            subtitle: 'Explore our brand standards and visual identity',
            brands: defaultBrands
        };
    }
}

// Initialize guideline page components
async function initGuidelinePage() {
    const containers = document.querySelectorAll('[data-component="guideline-page"]');

    if (containers.length === 0) {
        return;
    }

    // Fetch data once
    const data = await fetchBrandData();

    containers.forEach((container) => {
        // Skip if already initialized
        if (container.hasAttribute('data-guideline-initialized')) {
            return;
        }

        container.setAttribute('data-guideline-initialized', 'true');

        // Allow override via data attributes
        const title = container.getAttribute('data-title') || data.title;
        const subtitle = container.getAttribute('data-subtitle') || data.subtitle;

        const app = createApp(GuidelinePage, {
            title: title,
            subtitle: subtitle,
            brands: data.brands || defaultBrands
        });
        app.mount(container);
    });
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGuidelinePage);
    } else {
        initGuidelinePage();
    }

    // Single delayed retry for late-loaded Squarespace elements
    setTimeout(initGuidelinePage, 1000);

    (window as any).initGuidelinePage = initGuidelinePage;
}
