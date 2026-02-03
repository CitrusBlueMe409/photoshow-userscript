# Changelog

All notable changes to PhotoShow Userscript will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-03

### Added
- **Max-Fit View Mode (90% fit)** - New view mode that ensures images always fit within 90% of viewport without cropping
  - Added 'max-fit' option to view modes
  - Keyboard shortcut: Press '9' to activate
  - Perfect for viewing images without any part being cut off
  - Added to Settings UI dropdown with clear description
  
- **Enhanced Image Detection** - Support for all types of image embedding methods
  - Support for `<picture>` elements and their `<source>` children
  - Support for `srcset` and `currentSrc` attributes
  - Support for SVG `<image>` elements (href and xlink:href)
  - Support for CSS `content: url()` property
  - Support for multiple background images (extracts first one)
  - Support for data-url, data-image, data-fullsize attributes
  - Better handling of dynamically loaded images
  
- **Exception URL List (GUI)** - Configure URLs to exclude from PhotoShow
  - Added `exceptionUrls` array to configuration
  - Textarea input in Settings UI (Advanced tab)
  - Supports wildcard patterns: `*` (any characters) and `?` (single character)
  - Examples: `https://example.com/image*.jpg`, `*://site.com/no-preview/*`
  - One URL pattern per line
  - Validated and tested with regex conversion
  
- **Debug Mode Toggle** - Control console logging via settings
  - Added `debugMode` boolean to configuration (default: false)
  - Checkbox in Settings UI (Advanced tab)
  - All console.log calls now respect debug mode setting
  - Reduces console clutter in production use
  - Helpful for troubleshooting and development

### Changed
- **View Mode Keyboard Shortcuts** - Updated to include max-fit mode
  - All view modes now have consistent keyboard shortcut support
  - Max-fit mode uses key '9' (for 90%)
  
- **Image Detection Logic** - Significantly improved compatibility
  - Enhanced `getImageFromElement()` function with 100+ lines of new detection code
  - Better handling of edge cases and modern web image formats
  - More robust URL extraction from various sources

### Fixed
- ESLint warnings and trailing spaces cleaned up

## [1.1.5] - 2026-02-03

### Added
- **Coding Standards Documentation** - Comprehensive guidelines for modern JavaScript
  - Created `docs/coding-standards.md` (English) and `docs/coding-standards-ja.md` (Japanese)
  - Documents proper use of modern Event constructors (MouseEvent, KeyboardEvent, etc.)
  - Explains why `initMouseEvent()` and similar methods are deprecated
  - Provides migration examples from old to new APIs
  - Includes browser compatibility information

- **ESLint Rules for Deprecated APIs** - Prevent use of obsolete event initialization methods
  - Added `no-restricted-syntax` rules to catch deprecated APIs:
    - `initMouseEvent()` → Use `new MouseEvent()`
    - `initEvent()` → Use Event constructors
    - `initKeyboardEvent()` → Use `new KeyboardEvent()`
    - `initCustomEvent()` → Use `new CustomEvent()`
  - ESLint will now show clear error messages when deprecated methods are used
  - Verified rules work correctly with test cases

### Changed
- **CONTRIBUTING.md** - Updated with references to new coding standards
  - Added section on modern JavaScript standards
  - Links to comprehensive coding standards documentation
  - Emphasizes use of modern Event constructors

### Technical Details
- **Issue:** initMouseEvent() は推奨されません。代わりに MouseEvent() コンストラクターを使用してください。
- **Translation:** "initMouseEvent() is deprecated. Please use the MouseEvent() constructor instead."
- **Status:** ✅ No deprecated APIs currently in use
- **Prevention:** ESLint rules now prevent future use
- **Documentation:** Bilingual guides available for contributors

## [1.1.4] - 2026-02-03

### Fixed
- **View Mode Indicator Background Bug** - Fixed issue where semi-transparent background remained visible when indicator was disabled
  - Previously: Only the text disappeared, background box stayed visible (ghostly artifact)
  - Now: Both text AND background disappear completely when "Show View Mode Indicator" is disabled
  - Solution: Hide entire `.photoshow-viewer-controls` container instead of just the text span
  - Test page: `test-mode-indicator-bg.html`

## [1.1.3] - 2026-02-03

### Added
- **Show View Mode Indicator Setting** - New toggle to control visibility of mode indicator in top-right corner
  - Added `showViewModeIndicator` setting to configuration (default: true)
  - Added UI control in General tab of Settings dialog
  - Mode indicator (AUTO, FIT, LITE, etc.) can now be hidden for minimal UI
  
### Changed
- **Conditional Info Bar Display** - Info bar now hides when all image info items are disabled
  - Info bar (semi-transparent bottom overlay) only displays when at least one info item is enabled
  - Previously displayed even when all items (caption, dimensions, format) were disabled
  - Enables truly minimal UI when combined with disabled view mode indicator
  - Info bar checks both `showImageInfo` master toggle and individual item settings

### Added
- **UI Settings Test Page** - `test-ui-settings.html`
  - Comprehensive test cases for new settings
  - Step-by-step testing instructions
  - Visual checklist for verification
  - Expected results for all scenarios

## [1.1.2] - 2026-02-03

### Fixed
- **Critical: RegExp Serialization Bug** - Fixed `pattern.find.test is not a function` error
  - RegExp objects in `hdImagePatterns` were being serialized when saved to storage
  - Added `restoreRegExpPatterns()` function to reconstruct RegExp objects after deserialization
  - Updated `getConfig()` to automatically restore RegExp objects when loading configuration
  - Added defensive error handling in `detectHDImageUrl()` to prevent crashes
  - HD image detection now works correctly with saved configurations

### Added
- **RegExp Restoration Test Suite** - `test-regexp-fix.html`
  - Tests native RegExp object handling
  - Tests serialized RegExp object restoration
  - Tests HD URL transformation with restored patterns
  - All 3 test cases passed

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
