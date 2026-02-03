# Contributing to PhotoShow Userscript

Thank you for your interest in contributing to PhotoShow Userscript! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Your browser and userscript manager versions
- Screenshots if applicable

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists
- Clearly describe the feature and its benefits
- Explain how it would work

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/CitrusBlueMe409/photoshow-userscript.git
   cd photoshow-userscript
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style (enforced by ESLint)
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run lint        # Check code style
   npm run build       # Build the userscript
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style

We use ESLint with the Standard config. Key points:

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Function style**: `function name()` not `function name ()`
- **Naming**: camelCase for variables and functions

Run `npm run lint:fix` to auto-fix most style issues.

### Modern JavaScript Standards

⚠️ **Important:** We follow modern JavaScript best practices:

- ✅ Use `new MouseEvent()` constructor
- ❌ DO NOT use deprecated `initMouseEvent()`
- ✅ Use `new KeyboardEvent()` constructor  
- ❌ DO NOT use deprecated `initKeyboardEvent()`
- ✅ Use modern Event constructors
- ❌ DO NOT use `document.createEvent()` with `init*()` methods

**See:** [docs/coding-standards.md](docs/coding-standards.md) for complete guidelines.

Our ESLint configuration will automatically catch use of deprecated APIs.

## 🏗️ Project Structure

```
photoshow-userscript/
├── photoshow.user.js     # Main userscript file
├── package.json          # Project configuration
├── .eslintrc.js         # ESLint configuration
├── scripts/
│   ├── build.js         # Build script
│   └── update-version.js # Version update script
├── .github/
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline
├── dist/                # Build output (gitignored)
├── README.md            # Project documentation
├── CHANGELOG.md         # Version history
├── CONTRIBUTING.md      # This file
└── LICENSE              # MIT License
```

## 🧪 Testing

Currently, testing is manual. To test your changes:

1. Build the userscript: `npm run build`
2. Load `dist/photoshow.user.js` in your userscript manager
3. Visit websites with images
4. Test the affected features
5. Check browser console for errors

## 📚 Adding Features

When adding a new feature:

1. **Update the userscript**
   - Add the feature code
   - Add configuration options to `DEFAULT_CONFIG`
   - Add keyboard shortcuts if needed
   - Update the menu commands if needed

2. **Update documentation**
   - Add feature to README.md features list
   - Update configuration section
   - Add usage examples

3. **Update CHANGELOG.md**
   - Add entry under "Unreleased" section

## 🔧 Configuration System

New configuration options should:
- Be added to `DEFAULT_CONFIG`
- Have clear, descriptive names
- Include comments explaining their purpose
- Work with both global and site-specific settings

Example:
```javascript
const DEFAULT_CONFIG = {
    // ... existing config ...
    
    // Your new feature
    myNewFeature: true,  // Enable my new feature
    myFeatureOption: 'default',  // Option for new feature
};
```

## 🐛 Debugging

To debug the userscript:

1. Open browser DevTools (F12)
2. Check Console for `[PhotoShow]` logs
3. Add debug logs: `log('debug info', variable);`
4. Use browser debugger with breakpoints

## 📦 Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (1.X.0): New features (backwards compatible)
- **PATCH** (1.0.X): Bug fixes

To update version:
```bash
node scripts/update-version.js 1.1.0
```

## 🚀 Release Process

Releases are automated via GitHub Actions:

1. Update version: `node scripts/update-version.js X.Y.Z`
2. Update CHANGELOG.md
3. Commit changes
4. Create a GitHub release with tag `vX.Y.Z`
5. CI/CD will build and attach artifacts

## 💡 Development Tips

- Use `state` object for runtime state
- Use `config` object for user preferences
- Debounce expensive operations
- Test on multiple websites
- Check browser console for errors
- Use meaningful variable names
- Comment complex logic

## 🎨 UI/UX Guidelines

When adding UI elements:
- Respect user's color scheme preference
- Use smooth transitions (respect animation setting)
- Don't obstruct page content unnecessarily
- Provide keyboard shortcuts for accessibility
- Test on different viewport sizes

## 📖 Documentation

Good documentation includes:
- What the feature does
- Why it's useful
- How to use it
- Configuration options
- Keyboard shortcuts
- Examples

## ❓ Questions?

If you have questions:
- Check existing issues and discussions
- Create a new discussion on GitHub
- Be specific and provide context

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, helps make PhotoShow better!
