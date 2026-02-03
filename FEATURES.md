# PhotoShow Features Documentation

Complete reference of all features implemented in PhotoShow Userscript.

## Table of Contents

1. [Core Features](#core-features)
2. [View Modes](#view-modes)
3. [Image Actions](#image-actions)
4. [Configuration System](#configuration-system)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [HD Image Detection](#hd-image-detection)

---

## Core Features

### 1. High-Definition Image Viewing

**Description**: Automatically detects and displays HD versions of thumbnail images.

**How it works**:
- Hovers over image thumbnails trigger the viewer
- Applies HD detection patterns to find full-resolution URLs
- Displays images in a floating viewer

**Configuration**:
```javascript
{
    enabled: true,              // Enable/disable PhotoShow
    thumbnailMinWidth: 48,      // Minimum thumbnail width (px)
    thumbnailMinHeight: 48      // Minimum thumbnail height (px)
}
```

### 2. Smart Viewer Positioning

**Description**: Automatically positions the viewer for optimal visibility.

**Available positions**:
- `top-left`: Above and aligned left with thumbnail
- `top-right`: Above and aligned right with thumbnail
- `bottom-left`: Below and aligned left with thumbnail
- `bottom-right`: Below and aligned right with thumbnail
- `center`: Center of viewport (fullscreen-like)

**Configuration**:
```javascript
{
    viewerPositions: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
}
```

**Algorithm**:
1. Calculates available space for each position
2. Scores each position based on visibility
3. Selects position with highest score
4. Ensures viewer stays within viewport

### 3. Image Information Display

**Description**: Shows detailed information about the displayed image.

**Information items**:
- **Caption**: Alt text or title from the image
- **Dimensions**: Width × Height in pixels
- **Format**: File type (JPG, PNG, GIF, WEBP, etc.)
- **File Size**: Size in bytes (KB/MB) - planned feature

**Configuration**:
```javascript
{
    showImageInfo: true,
    imageInfoItems: {
        caption: true,
        dimensions: true,
        format: true,
        fileSize: true  // Not yet implemented
    }
}
```

---

## View Modes

### Auto Mode (A)

**Description**: Intelligently fits images based on aspect ratio.

**Behavior**:
- Analyzes image aspect ratio
- If ultra-wide/tall (> 1.5 ratio): Enables scrolling mode
- Otherwise: Fits image to 80% of viewport

**Best for**: General use, works well with all image types

### Fit Mode (F)

**Description**: Fits entire image within viewer, never using scrolling mode.

**Behavior**:
- Scales image to 90% of viewport
- Ensures entire image is visible
- No scrolling

**Best for**: Seeing complete images at once

### Lite Mode (L)

**Description**: Compact viewer taking up to 1/4 of screen.

**Behavior**:
- Viewer size: 25% of viewport
- Enables scrolling mode when needed

**Best for**: Quick previews without covering page content

### Mini Mode (M)

**Description**: Minimal viewer taking up to 1/8 of screen.

**Behavior**:
- Viewer size: 12.5% of viewport
- Enables scrolling mode when needed

**Best for**: Tiny previews, maximum page visibility

### Panoramic Mode (P)

**Description**: Displays images at original size.

**Behavior**:
- Shows image at 100% size
- Always uses scrolling mode for large images
- Navigate with arrow keys

**Best for**: Examining image details, pixel-perfect viewing

---

## Image Actions

### Download Image (S)

**Description**: Downloads the currently displayed image.

**Features**:
- Custom filename templates
- Placeholder substitution
- Format conversion support (planned)

**Filename placeholders**:
- `<c>`: Image caption
- `<H>`: Current hostname
- `<w>`: Image width
- `<h>`: Image height
- `<e>`: File extension
- `<t>`: Unix timestamp

**Examples**:
```
Template: "image_<w>x<h>.<e>"
Output:   "image_1920x1080.jpg"

Template: "<H>/<c>_<t>.<e>"
Output:   "example.com/sunset_1699564800000.jpg"
```

**Configuration**:
```javascript
{
    downloadFilenameTemplate: '<c>_<w>x<h>.<e>',
    alwaysAskDownloadLocation: false,
    defaultDownloadFormat: 'original'  // 'original', 'jpg', 'png', 'webp'
}
```

### Copy Image (C)

**Description**: Copies image URL to clipboard.

**Use cases**:
- Sharing image links
- Pasting in other applications
- Quick reference

### Rotate Image

**Keys**: `Shift` + `Ctrl` + `←` / `→`

**Description**: Rotates image by 90° increments.

**Features**:
- Rotates left (counter-clockwise) or right (clockwise)
- Rotation persists in downloaded images
- Visual feedback in viewer

### Flip Image

**Keys**: `Alt` + `Ctrl` + Arrow keys

**Description**: Flips image horizontally or vertically.

**Combinations**:
- `Alt` + `Ctrl` + `←` or `→`: Flip horizontally
- `Alt` + `Ctrl` + `↑` or `↓`: Flip vertically

**Features**:
- Can combine with rotation
- Persists in downloaded images

---

## Configuration System

### Global Settings

**Description**: Settings that apply to all websites.

**Storage**: Browser storage via `GM_setValue`

**Syncing**: Not synced across devices (use export/import)

### Site-Specific Settings

**Description**: Settings that override global settings for specific websites.

**Storage**: Keyed by hostname: `photoshow_site_example.com`

**Use case**: Different behavior for different sites

**Example**:
```javascript
// Global: Use dark theme
{ colorScheme: 'dark' }

// example.com: Override to light theme
{ colorScheme: 'light' }
```

### Settings Priority

1. Site-specific settings (highest priority)
2. Global settings
3. Default settings (fallback)

### Whitelist Mode

**Description**: Disable PhotoShow globally, enable per-site.

**How to use**:
1. Set `whitelistMode: true` globally
2. PhotoShow is disabled everywhere
3. Use "Toggle PhotoShow" menu for specific sites
4. Enabled sites get site-specific setting

**Configuration**:
```javascript
{
    whitelistMode: false  // false = blacklist mode, true = whitelist mode
}
```

### Import/Export

**Description**: Backup and restore all settings.

**Export format**:
```json
{
    "version": "1.0.0",
    "global": { /* global settings */ },
    "sites": {
        "example.com": { /* site settings */ },
        "another.com": { /* site settings */ }
    }
}
```

**How to use**:
1. Export: Menu → "Export Settings" → Copies to clipboard
2. Import: Menu → "Import Settings" → Paste JSON

---

## Keyboard Shortcuts

### Image Actions

| Key | Action | Modifiers | Enabled By |
|-----|--------|-----------|------------|
| `S` | Download image | None | `keyboardShortcuts.download` |
| `C` | Copy image URL | None | `keyboardShortcuts.copy` |

### View Modes

| Key | Action | Modifiers | Enabled By |
|-----|--------|-----------|------------|
| `A` | Auto mode | None | `keyboardShortcuts.autoMode` |
| `F` | Fit mode | None | `keyboardShortcuts.fitMode` |
| `L` | Lite mode | None | `keyboardShortcuts.liteMode` |
| `M` | Mini mode | None | `keyboardShortcuts.miniMode` |
| `P` | Panoramic mode | None | `keyboardShortcuts.panoramicMode` |
| `V` | Toggle last 2 modes | None | `keyboardShortcuts.toggleMode` |

### Navigation (Scrolling Mode)

| Key | Action | Modifiers | Enabled By |
|-----|--------|-----------|------------|
| `←` `→` `↑` `↓` | Navigate pixel-by-pixel | None | `keyboardShortcuts.navigation` |
| `Home` | Jump to top | None | `keyboardShortcuts.navigation` |
| `End` | Jump to bottom | None | `keyboardShortcuts.navigation` |
| `PgUp` | Scroll up by viewport | None | `keyboardShortcuts.navigation` |
| `PgDn` | Scroll down by viewport | None | `keyboardShortcuts.navigation` |

### Transformations

| Key | Action | Modifiers | Enabled By |
|-----|--------|-----------|------------|
| `←` | Rotate left 90° | `Shift` + `Ctrl` | `keyboardShortcuts.rotation` |
| `→` | Rotate right 90° | `Shift` + `Ctrl` | `keyboardShortcuts.rotation` |
| `←` `→` | Flip horizontal | `Alt` + `Ctrl` | `keyboardShortcuts.flip` |
| `↑` `↓` | Flip vertical | `Alt` + `Ctrl` | `keyboardShortcuts.flip` |

### Configuration

```javascript
{
    keyboardShortcuts: {
        download: true,
        copy: true,
        toggleMode: true,
        autoMode: true,
        fitMode: true,
        liteMode: true,
        miniMode: true,
        panoramicMode: true,
        navigation: true,
        rotation: true,
        flip: true
    }
}
```

---

## HD Image Detection

### Pattern Matching

PhotoShow uses regex patterns to detect HD image URLs.

**Built-in patterns**:
```javascript
[
    { find: /\/s\d+(-c)?\//, replace: '/s0/' },      // Google services
    { find: /_\d+x\d+\./, replace: '.' },            // Size suffix
    { find: /\.thumb\./, replace: '.' },             // Thumbnail indicator
    { find: /\/thumb\//, replace: '/original/' },    // Path-based
    { find: /\/small\//, replace: '/large/' },
    { find: /\/medium\//, replace: '/large/' },
    { find: /-small\./, replace: '-large.' },
    { find: /-medium\./, replace: '-large.' },
    { find: /-thumb\./, replace: '.' },
    { find: /_thumb\./, replace: '.' }
]
```

### URL Parameter Removal

PhotoShow also removes common size-limiting URL parameters:
- `s=`, `size=`
- `w=`, `width=`
- `h=`, `height=`

### Custom Patterns

**Add site-specific patterns**:
```javascript
{
    hdImagePatterns: [
        // ... existing patterns ...
        { find: /mysite-thumb/, replace: 'mysite-hd' }
    ]
}
```

---

## Advanced Features

### Mark Viewed Images

**Description**: Tracks which images you've viewed.

**Visual indicator**: Viewed thumbnails become semi-transparent (0.7 opacity).

**Storage**: In-memory (resets on page reload).

**Configuration**:
```javascript
{
    markViewedImages: false  // Enable to track viewed images
}
```

### Viewer Exceptions

**Description**: Prevent viewer on specific elements.

**Use case**: Exclude site UI elements, icons, avatars.

**Configuration**:
```javascript
{
    viewerExceptions: [
        '.site-logo',
        '.user-avatar',
        '#skip-this-element'
    ]
}
```

### Thumbnail Type Filtering

**Description**: Control which thumbnail types trigger the viewer.

**Types**:
- `img`: `<img>` elements
- `bgImage`: Background images via CSS
- `link`: `<a>` tags linking to images

**Configuration**:
```javascript
{
    thumbnailTypes: {
        img: true,
        bgImage: true,
        link: true
    }
}
```

### Transition Animations

**Description**: Smooth fade-in/out animations.

**Configuration**:
```javascript
{
    transitionAnimation: true,  // Enable animations
    animationDuration: 300      // Duration in milliseconds
}
```

**Disable for**:
- Performance on slow devices
- Reduced motion accessibility preference
- Instant feedback preference

### Color Schemes

**Description**: Light or dark viewer appearance.

**Light theme**:
- White background
- Black text
- Light border

**Dark theme**:
- Dark gray background (#1a1a1a)
- White text
- No border

**Configuration**:
```javascript
{
    colorScheme: 'dark'  // 'light' or 'dark'
}
```

---

## Troubleshooting

### Viewer not appearing

1. Check if PhotoShow is enabled
2. Verify thumbnail size meets minimum
3. Check viewer exceptions
4. Look for console errors

### Wrong HD URL detected

1. Check HD detection patterns
2. Add site-specific pattern
3. Report issue with URL examples

### Keyboard shortcuts not working

1. Ensure viewer is visible
2. Check `keyboardShortcuts` config
3. Verify no other script conflicts
4. Check browser console for errors

### Performance issues

1. Disable animations
2. Reduce viewer size (Lite/Mini mode)
3. Increase thumbnail minimum size
4. Add viewer exceptions for busy areas

---

## Future Features

Planned features (not yet implemented):

- [ ] File size display
- [ ] Viewport mask for scrolling mode
- [ ] Mouse wheel zooming
- [ ] Gallery navigation
- [ ] Customizable keyboard shortcuts
- [ ] Video viewer support
- [ ] Format conversion on download
- [ ] Advanced settings UI
