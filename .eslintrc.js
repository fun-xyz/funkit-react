/* eslint-env node */

require('@uniswap/eslint-config/load')

module.exports = {
  extends: ['@uniswap/eslint-config/react', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'import/no-unused-modules': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
  },
}
