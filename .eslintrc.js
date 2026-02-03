module.exports = {
  env: {
    browser: true,
    es2021: true,
    greasemonkey: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  globals: {
    GM_getValue: 'readonly',
    GM_setValue: 'readonly',
    GM_deleteValue: 'readonly',
    GM_listValues: 'readonly',
    GM_setClipboard: 'readonly',
    GM_download: 'readonly',
    GM_registerMenuCommand: 'readonly',
    GM_notification: 'readonly',
    GM_xmlhttpRequest: 'readonly',
    unsafeWindow: 'readonly'
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    indent: ['error', 4],
    semi: ['error', 'always'],
    'space-before-function-paren': ['error', 'never']
  }
};
