/* Tailwind CSS configuration scoped for Squarespace safety */
module.exports = {
  content: ['./**/*.{html,js,ts,vue}', '!**/node_modules/**', '!**/dist/**'],
  prefix: 'tw-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        brand: {
          c1: 'var(--c1)',
          c2: 'var(--c2)',
          c3: 'var(--c3)',
          c4: 'var(--c4)',
        },
        ink: 'var(--ink)',
        card: 'var(--card)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
