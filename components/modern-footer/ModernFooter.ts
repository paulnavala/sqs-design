import { defineComponent, h, computed } from 'vue';

export default defineComponent({
    name: 'ModernFooter',
    setup() {
        const currentYear = computed(() => new Date().getFullYear());

        const socialLinks = [
            { name: 'Instagram', url: '#', icon: 'instagram' },
            { name: 'Twitter', url: '#', icon: 'twitter' },
            { name: 'LinkedIn', url: '#', icon: 'linkedin' },
        ];

        const navLinks = [
            { name: 'Work', url: '/work' },
            { name: 'About', url: '/about' },
            { name: 'Contact', url: '/contact' },
        ];

        return () => {
            return h('footer', { class: 'modern-footer' }, [
                h('div', { class: 'footer-content' }, [
                    // Top Section
                    h('div', { class: 'footer-top' }, [
                        h('div', { class: 'brand-section' }, [
                            h('h2', { class: 'brand-name' }, 'Peachless'),
                            h('p', { class: 'brand-tagline' }, 'Designing digital experiences that matter.'),
                        ]),
                        h('nav', { class: 'footer-nav' }, [
                            h('ul', { class: 'nav-list' },
                                navLinks.map(link =>
                                    h('li', { key: link.name }, [
                                        h('a', { href: link.url, class: 'nav-link' }, link.name)
                                    ])
                                )
                            )
                        ])
                    ]),

                    // Divider
                    h('div', { class: 'footer-divider' }),

                    // Bottom Section
                    h('div', { class: 'footer-bottom' }, [
                        h('div', { class: 'copyright' }, `© ${currentYear.value} Peachless Design. All rights reserved.`),
                        h('div', { class: 'social-links' },
                            socialLinks.map(social =>
                                h('a', {
                                    key: social.name,
                                    href: social.url,
                                    class: 'social-link',
                                    'aria-label': social.name
                                }, social.name)
                            )
                        )
                    ])
                ])
            ]);
        };
    }
});
