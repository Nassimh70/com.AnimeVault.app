import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  console: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  fetch: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  FormData: 'readonly',
  File: 'readonly',
  Blob: 'readonly',
  AbortController: 'readonly',
  AbortSignal: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  JSON: 'readonly',
  Math: 'readonly',
  Date: 'readonly',
  Intl: 'readonly',
  DOMException: 'readonly',
  KeyboardEvent: 'readonly',
  Event: 'readonly',
  EventTarget: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  HTMLSelectElement: 'readonly',
  MutationObserver: 'readonly',
  ResizeObserver: 'readonly',
  IntersectionObserver: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  structuredClone: 'readonly',
  crypto: 'readonly',
  performance: 'readonly',
  matchMedia: 'readonly',
  getComputedStyle: 'readonly',
  CSS: 'readonly',
  CustomEvent: 'readonly',
  MessageChannel: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
  process: 'readonly',
  globalThis: 'readonly',
  AggregateError: 'readonly',
  WeakRef: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  global: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  module: 'readonly',
  require: 'readonly',
  exports: 'writable',
};

const testGlobals = {
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  vi: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  test: 'readonly',
  suite: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
  {
    files: ['src/tests/**/*.js'],
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...testGlobals,
      },
    },
  },
];
