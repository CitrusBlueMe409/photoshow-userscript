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
    'space-before-function-paren': ['error', 'never'],
    // Prevent use of deprecated event APIs
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.property.name="initMouseEvent"]',
        message: 'initMouseEvent() is deprecated. Use new MouseEvent() constructor instead.'
      },
      {
        selector: 'CallExpression[callee.property.name="initEvent"]',
        message: 'initEvent() is deprecated. Use Event constructors (MouseEvent, KeyboardEvent, etc.) instead.'
      },
      {
        selector: 'CallExpression[callee.property.name="initKeyboardEvent"]',
        message: 'initKeyboardEvent() is deprecated. Use new KeyboardEvent() constructor instead.'
      },
      {
        selector: 'CallExpression[callee.property.name="initCustomEvent"]',
        message: 'initCustomEvent() is deprecated. Use new CustomEvent() constructor instead.'
      }
    ]
  }
};
