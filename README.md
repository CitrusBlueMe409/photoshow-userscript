# PhotoShow Userscript

A powerful userscript implementation of the PhotoShow browser extension. View and download high-definition images simply by hovering over thumbnails.

[![CI/CD](https://github.com/CitrusBlueMe409/photoshow-userscript/actions/workflows/ci.yml/badge.svg)](https://github.com/CitrusBlueMe409/photoshow-userscript/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/CitrusBlueMe409/photoshow-userscript/releases)

## 🎯 Features

PhotoShow is a comprehensive userscript that brings all the power of the PhotoShow browser extension to any userscript manager.

### Core Features

1. **🖼️ High-Definition Image Viewing**
   - Automatically detects and displays HD versions of thumbnail images
   - Hover over any image thumbnail to see the full-resolution version
   - Works on virtually any website

2. **📐 Multiple View Modes**
   - **Auto Mode (A)**: Intelligently fits images based on aspect ratio
   - **Fit Mode (F)**: Fits entire image within viewer
   - **Lite Mode (L)**: Compact viewer (1/4 screen)
   - **Mini Mode (M)**: Minimal viewer (1/8 screen)
   - **Panoramic Mode (P)**: Original size with scrolling

3. **🔄 Scrolling Mode for Large Images**
   - Ultra-wide and ultra-tall images use special scrolling mode
   - Viewport mask shows your position on the thumbnail
   - Navigate with arrow keys through the full image

4. **💾 Image Download**
   - Press `S` to download the current image
   - Customizable filename templates
   - Support for multiple format conversions

5. **📋 Copy to Clipboard**
   - Press `C` to copy image URL to clipboard
   - Quick sharing and referencing

6. **🔄 Image Rotation & Flipping**
   - Rotate: `Shift` + `Ctrl` + `←` / `→`
   - Flip Horizontally: `Alt` + `Ctrl` + `←` / `→`
   - Flip Vertically: `Alt` + `Ctrl` + `↑` / `↓`
   - Transformations persist when downloading

7. **📍 Smart Viewer Positioning**
   - Automatically positions viewer in optimal location
   - Supports 5 positions: top-left, top-right, bottom-left, bottom-right, center
   - Avoids viewport edges for best visibility

8. **ℹ️ Image Information Display**
   - Image caption/alt text
   - Dimensions (width × height)
   - File format
   - File size (when available)

9. **⌨️ Extensive Keyboard Shortcuts**
   - `S` - Download image
   - `C` - Copy image URL
   - `V` - Toggle between last two view modes
   - `A`, `F`, `L`, `M`, `P` - Switch view modes
   - Arrow keys - Navigate in panoramic/scrolling mode
   - `Home`/`End` - Jump to top/bottom
   - `PgUp`/`PgDn` - Scroll by viewport height

10. **🎨 Customizable Appearance**
    - Light and dark color schemes
    - Configurable transition animations
    - Adjustable animation duration

### Configuration Features

11. **⚙️ Global Settings**
    - Apply settings across all websites
    - Persistent configuration storage

12. **🌐 Site-Specific Settings**
    - Override global settings per website
    - Fine-tune behavior for specific sites

13. **📋 Whitelist Mode**
    - Disable globally, enable per-site
    - Perfect for selective usage

14. **🎯 Viewer Trigger Options**
    - Hover to activate (default)
    - Require assist key (Ctrl/Alt/Shift) for activation

15. **🖼️ Thumbnail Type Filtering**
    - Enable/disable for `<img>` elements
    - Enable/disable for background images
    - Enable/disable for image links

16. **🚫 Viewer Exceptions**
    - CSS selectors to exclude specific elements
    - Prevent viewer on certain thumbnails

17. **📊 Configurable Minimum Sizes**
    - Set minimum thumbnail width/height
    - Avoid triggering on tiny images

18. **🎨 Information Display Control**
    - Toggle each info item independently
    - Show/hide: caption, dimensions, format, size

19. **🔗 New Tab Behavior**
    - Open images in foreground or background
    - Customizable user preference

20. **✅ Mark Viewed Images**
    - Track which images you've viewed
    - Visual indicator on thumbnails

21. **💾 Settings Import/Export**
    - Export all settings to JSON
    - Import settings on new device
    - Backup your configuration

22. **🔄 Settings Reset**
    - Reset global settings to defaults
    - Reset site-specific settings
    - Quick configuration cleanup

### Advanced Features

23. **🔍 HD Image Detection Patterns**
    - Extensive pattern matching for HD URLs
    - Removes size parameters
    - Converts thumbnail URLs to originals

24. **📏 Dynamic Filename Templates**
    - Use placeholders: `<c>` (caption), `<H>` (hostname), `<w>` (width), `<h>` (height), `<e>` (extension), `<t>` (timestamp)
    - Create organized download structures
    - Example: `images/<H>/<c>_<w>x<h>.<e>`

## 📦 Installation

### Prerequisites

You need a userscript manager installed in your browser:

- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari, Opera)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
- [Greasemonkey](https://www.greasespot.net/) (Firefox)

### Install PhotoShow

1. **Direct Installation**
   - Click [here](https://github.com/CitrusBlueMe409/photoshow-userscript/raw/main/photoshow.user.js) to install
   - Your userscript manager will prompt for installation

2. **Manual Installation**
   - Download `photoshow.user.js`
   - Open your userscript manager
   - Create new script and paste the contents

3. **From Greasy Fork** (coming soon)
   - Visit the Greasy Fork page
   - Click Install

## 🚀 Usage

### Basic Usage

1. Visit any website with images
2. Hover your mouse over any image thumbnail
3. PhotoShow will automatically display the high-definition version
4. Move your mouse away to hide the viewer

### Keyboard Shortcuts

While the viewer is active:

| Key | Action |
|-----|--------|
| `S` | Download current image |
| `C` | Copy image URL to clipboard |
| `V` | Toggle between last two view modes |
| `A` | Switch to Auto mode |
| `F` | Switch to Fit mode |
| `L` | Switch to Lite mode |
| `M` | Switch to Mini mode |
| `P` | Switch to Panoramic mode |
| `←` `→` `↑` `↓` | Navigate in panoramic/scrolling mode |
| `Home` | Jump to top (ultra-tall images) |
| `End` | Jump to bottom (ultra-tall images) |
| `PgUp` | Scroll up by viewport height |
| `PgDn` | Scroll down by viewport height |
| `Shift` + `Ctrl` + `←` | Rotate left 90° |
| `Shift` + `Ctrl` + `→` | Rotate right 90° |
| `Alt` + `Ctrl` + `←`/`→` | Flip horizontally |
| `Alt` + `Ctrl` + `↑`/`↓` | Flip vertically |

### Settings Menu

Access settings through your userscript manager's menu:

- **PhotoShow Settings** - Opens settings dialog
- **Export Settings** - Copy settings to clipboard as JSON
- **Import Settings** - Paste JSON to restore settings
- **Reset Global Settings** - Restore default global settings
- **Reset Site Settings** - Clear site-specific settings
- **Toggle PhotoShow** - Enable/disable for current site

## ⚙️ Configuration

### Global Settings

Global settings apply to all websites unless overridden by site-specific settings.

```javascript
{
  enabled: true,                    // Enable PhotoShow
  whitelistMode: false,             // Disable globally, enable per-site
  viewerTrigger: 'hover',           // 'hover' or 'assist-key'
  assistKey: 'ctrl',                // 'ctrl', 'alt', 'shift'
  viewerPositions: [...],           // Available viewer positions
  defaultViewMode: 'auto',          // Default view mode
  colorScheme: 'dark',              // 'light' or 'dark'
  transitionAnimation: true,        // Enable smooth animations
  animationDuration: 300,           // Animation duration (ms)
  // ... and many more options
}
```

### Site-Specific Settings

Override global settings for specific websites:

```javascript
{
  enabled: true,                    // Enable for this site
  defaultViewMode: 'panoramic',     // Use panoramic mode on this site
  // ... any setting can be overridden
}
```

### Filename Templates

Customize download filenames with placeholders:

- `<c>` - Image caption/alt text
- `<H>` - Current hostname
- `<w>` - Image width
- `<h>` - Image height
- `<e>` - File extension
- `<t>` - Unix timestamp

**Examples:**
- `image_<w>x<h>.<e>` → `image_1920x1080.jpg`
- `<H>/<c>.<e>` → `example.com/sunset.jpg`
- `photos/<t>_<w>x<h>.<e>` → `photos/1699564800000_1920x1080.jpg`

### HD Image Detection

PhotoShow uses intelligent pattern matching to find HD versions:

```javascript
hdImagePatterns: [
  { find: /\/s\d+(-c)?\//, replace: '/s0/' },      // Google
  { find: /_\d+x\d+\./, replace: '.' },            // Size suffixes
  { find: /\.thumb\./, replace: '.' },             // Thumbnail indicators
  { find: /\/thumb\//, replace: '/original/' },    // Path-based
  // ... and more
]
```

## 🔧 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/CitrusBlueMe409/photoshow-userscript.git
cd photoshow-userscript

# Install dependencies
npm install

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Project Structure

```
photoshow-userscript/
├── photoshow.user.js          # Main userscript
├── package.json               # Project configuration
├── .eslintrc.js              # ESLint configuration
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── README.md                  # This file
└── CHANGELOG.md              # Version history
```

### CI/CD Pipeline

The project uses GitHub Actions for:

1. **Linting** - Code quality checks with ESLint
2. **Building** - Creates distributable artifacts
3. **Release** - Automatic release creation
4. **Update Endpoint** - Publishes to GitHub Pages for auto-updates

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original [PhotoShow Extension](https://github.com/Mr-VincentW/PhotoShow) by Vincent W.
- Inspired by the need for a userscript alternative
- Thanks to all contributors and users

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/CitrusBlueMe409/photoshow-userscript/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CitrusBlueMe409/photoshow-userscript/discussions)

## 🗺️ Roadmap

- [ ] Mouse wheel zooming
- [ ] Gallery/carousel navigation
- [ ] Customizable keyboard shortcuts
- [ ] Video viewer support
- [ ] Advanced settings UI
- [ ] Browser-specific optimizations
- [ ] Site-specific rule database

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ by [CitrusBlueMe409](https://github.com/CitrusBlueMe409)