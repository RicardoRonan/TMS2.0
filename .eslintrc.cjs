module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'warn',
    'no-case-declarations': 'error'
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js']
}

