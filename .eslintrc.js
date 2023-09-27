/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: '@uniswap/eslint-config/react',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // Path to your TypeScript configuration file
    ecmaVersion: 2021, // Or whichever version you are using
    sourceType: 'module',
  },
  rules: {
    'import/no-unused-modules': 'off',
    "@typescript-eslint/no-floating-promises": "error"
  },
  ignorePatterns: ['**/.eslintrc.js'], // Exclude ESLint configuration file
}
