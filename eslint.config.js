// Flat config for ESLint v9+
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/',
      'dist-vue/',
      'coverage/',
      'playwright-report/',
      '**/*.min.js',
      'components/**/**/*.js',
      'loaders/*.js',
    ],
  },
  // Base JS recommended rules
  js.configs.recommended,
  // Generic JS rules adjustments
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-regex-spaces': 'warn',
    },
  },
  // TypeScript-specific settings
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-console': 'off',
      // Avoid false positives on TS types like HTMLElement, etc.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Browser globals for authored browser code
  {
    files: ['components/**/*.{ts,js}', 'core/**/*.{ts,js}', 'test/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  // Node globals for scripts and configs
  {
    files: [
      'scripts/**/*.js',
      'tailwind.config.js',
      'postcss.config.js',
      'vite.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
