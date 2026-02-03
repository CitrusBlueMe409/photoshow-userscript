# Changelog

All notable changes to PhotoShow Userscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-03

### Fixed
- **Viewer Trigger Bug** - Implemented missing assist-key mode check
  - Now properly checks if assist key (Ctrl/Alt/Shift) is pressed in assist-key mode
  - Both hover and assist-key modes now work correctly
  - Added debug logging for image detection

### Added
- **Comprehensive Test Page** - `test-photoshow.html`
  - 6 test sections covering all image types
  - Detailed testing instructions
  - Status indicator for PhotoShow activation
  - Test cases for JPG, PNG, GIF, links, background images
  - Different aspect ratio tests (ultra-wide, ultra-tall, square)
  - Minimum size threshold tests
- **Automated Test Script** - `test-photoshow.sh`
  - Verifies all critical functions exist
  - Checks for proper event listener setup
  - Validates Greasemonkey API usage
  - Runs ESLint for code quality
  - Provides detailed test results

### Improved
- Better debugging with console logging when images are detected
- Documentation updated with testing instructions

## [1.1.0] - 2026-02-03

### Added
- **Full Settings UI** - Comprehensive graphical settings interface
  - Beautiful tabbed interface with 4 tabs (General, Viewer, Keyboard, Advanced)
  - 32+ settings accessible via GUI (subset of all 100+ configuration options)
  - Real-time configuration updates
  - Responsive design with modern styling
  - Settings export/import buttons
  - Global and site-specific reset options
  - Gradient header with purple theme
  - Smooth tab transitions

### Improved
- Settings management now more accessible and user-friendly
- Visual feedback for all setting changes
- Better organization of configuration options

## [1.0.0] - 2026-02-03

### Added
- Initial release of PhotoShow Userscript
- Complete implementation of all PhotoShow browser extension features
- High-definition image viewing on hover
- Multiple view modes: Auto, Fit, Lite, Mini, Panoramic
- Scrolling mode for ultra-wide and ultra-tall images
- Image download functionality with custom filename templates
- Copy image URL to clipboard
- Image rotation and flipping capabilities
- Smart viewer positioning (5 positions)
- Comprehensive image information display
- Extensive keyboard shortcuts
- Global and site-specific configuration system
- Whitelist mode support
- Viewer trigger options (hover/assist-key)
- Thumbnail type filtering
- Viewer exceptions with CSS selectors
- Light and dark color schemes
- Configurable transition animations
- Mark viewed images feature
- Settings import/export functionality
- Context menu integration
- HD image detection with pattern matching
- Dynamic filename template system
- CI/CD pipeline with GitHub Actions
- Automated linting with ESLint
- Automated building and releases
- Auto-update endpoint via GitHub Pages
- Comprehensive README documentation
- MIT License

### Features Count
- 24+ distinct features implemented
- 100+ configuration options
- 15+ keyboard shortcuts
- 10+ HD image detection patterns

[1.0.0]: https://github.com/CitrusBlueMe409/photoshow-userscript/releases/tag/v1.0.0
