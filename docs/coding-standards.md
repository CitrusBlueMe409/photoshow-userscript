# Coding Standards & Best Practices

## Modern JavaScript Event APIs

### ⚠️ Deprecated: initMouseEvent()

**DO NOT USE** the deprecated `initMouseEvent()` method. This API is obsolete and has been removed from web standards.

#### ❌ Deprecated Approach (DO NOT USE)
```javascript
// WRONG - Deprecated API
const event = document.createEvent('MouseEvent');
event.initMouseEvent(
    'click', true, true, window, 0, 
    0, 0, 0, 0, 
    false, false, false, false, 
    0, null
);
element.dispatchEvent(event);
```

#### ✅ Modern Approach (CORRECT)
```javascript
// CORRECT - Modern MouseEvent constructor
const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 0,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null
});
element.dispatchEvent(event);
```

#### 🎯 Simplified Example
```javascript
// For simple events, you can omit most options
const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true
});
element.dispatchEvent(clickEvent);
```

### Other Modern Event Constructors

#### CustomEvent
```javascript
const customEvent = new CustomEvent('myevent', {
    bubbles: true,
    detail: { customData: 'value' }
});
element.dispatchEvent(customEvent);
```

#### KeyboardEvent
```javascript
const keyEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true
});
element.dispatchEvent(keyEvent);
```

#### FocusEvent
```javascript
const focusEvent = new FocusEvent('focus', {
    bubbles: true,
    relatedTarget: previousElement
});
element.dispatchEvent(focusEvent);
```

### Why Modern Constructors?

1. **Cleaner Syntax**: Named parameters instead of positional arguments
2. **Better Readability**: Self-documenting code
3. **Type Safety**: Better IDE support and type checking
4. **Standard Compliance**: Follows current web standards
5. **Future-Proof**: Won't be deprecated or removed
6. **Less Error-Prone**: No need to remember argument order

### Comparison: Old vs New

| Feature | initMouseEvent() | MouseEvent() |
|---------|-----------------|--------------|
| Status | ❌ Deprecated | ✅ Standard |
| Syntax | Positional args | Named options |
| Readability | Poor | Excellent |
| Type Safety | No | Yes |
| IDE Support | Limited | Full |
| Future | Removed | Stable |

### Browser Support

Modern event constructors are supported in all modern browsers:
- ✅ Chrome 15+
- ✅ Firefox 11+
- ✅ Safari 6+
- ✅ Edge (all versions)
- ✅ Opera 15+

### ESLint Configuration

To prevent use of deprecated APIs, add this to `.eslintrc.js`:

```javascript
rules: {
    'no-restricted-syntax': [
        'error',
        {
            selector: 'CallExpression[callee.property.name="initMouseEvent"]',
            message: 'initMouseEvent() is deprecated. Use new MouseEvent() constructor instead.'
        },
        {
            selector: 'CallExpression[callee.property.name="initEvent"]',
            message: 'initEvent() is deprecated. Use Event constructors instead.'
        }
    ]
}
```

### Additional Resources

- [MDN: MouseEvent Constructor](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent)
- [MDN: initMouseEvent (Deprecated)](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent)
- [Web Standards: UI Events](https://www.w3.org/TR/uievents/)

### Migration Guide

If you find deprecated code in the project:

1. **Identify** the deprecated method call
2. **Replace** with modern constructor
3. **Test** thoroughly - event behavior should be identical
4. **Update** any related documentation
5. **Run** ESLint to ensure compliance

### Example Migration

**Before:**
```javascript
function triggerClick(element) {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(evt);
}
```

**After:**
```javascript
function triggerClick(element) {
    const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(evt);
}
```

## General JavaScript Best Practices

### Use Modern ES6+ Features

✅ **DO:**
- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Use destructuring for objects/arrays
- Use spread operator instead of `apply()`
- Use `async/await` instead of nested callbacks

❌ **DON'T:**
- Use `var` for variable declarations
- Use `eval()` or `with` statements
- Use deprecated APIs
- Create unnecessary global variables

### Code Organization

```javascript
// Good - Clear structure
const config = {
    enabled: true,
    timeout: 1000
};

function initialize(options) {
    const mergedConfig = { ...config, ...options };
    return setupApp(mergedConfig);
}

// Bad - Messy structure
var cfg = {}; cfg.en = true; cfg.to = 1000;
function init(o) { return setup(Object.assign(cfg, o)); }
```

### Error Handling

```javascript
// Good - Proper error handling
try {
    const result = riskyOperation();
    processResult(result);
} catch (error) {
    console.error('[PhotoShow] Operation failed:', error.message);
    fallbackBehavior();
}

// Bad - No error handling
const result = riskyOperation(); // May throw
processResult(result);
```

### Performance

```javascript
// Good - Cached selector
const viewer = document.querySelector('.photoshow-viewer');
if (viewer) {
    viewer.style.display = 'block';
    viewer.classList.add('active');
}

// Bad - Multiple queries
if (document.querySelector('.photoshow-viewer')) {
    document.querySelector('.photoshow-viewer').style.display = 'block';
    document.querySelector('.photoshow-viewer').classList.add('active');
}
```

### Accessibility

```javascript
// Good - Accessible
const button = document.createElement('button');
button.setAttribute('aria-label', 'Close viewer');
button.setAttribute('role', 'button');
button.addEventListener('click', closeViewer);

// Bad - Not accessible
const div = document.createElement('div');
div.onclick = closeViewer; // Not keyboard accessible
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
Type: Short description (50 chars max)

Longer explanation if needed. Wrap at 72 characters.
Explain what and why, not how.

- Bullet points are okay
- Use present tense: "Add feature" not "Added feature"
```

**Types:**
- `Fix:` Bug fixes
- `Add:` New features
- `Update:` Changes to existing features
- `Refactor:` Code restructuring
- `Docs:` Documentation only
- `Style:` Code style changes
- `Test:` Test additions/changes
- `Chore:` Maintenance tasks

## Questions?

If you have questions about coding standards:
1. Check this document
2. Review existing code for examples
3. Ask in GitHub discussions
4. Refer to MDN documentation

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
