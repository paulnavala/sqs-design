module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'unused-imports'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier'
      ],
      rules: {
        'unused-imports/no-unused-imports': 'warn',
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};


