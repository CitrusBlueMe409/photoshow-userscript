// ==UserScript==
// @name         PhotoShow - Image Viewer
// @namespace    https://github.com/CitrusBlueMe409/photoshow-userscript
// @version      1.1.3
// @description  View and download high-definition images by hovering over thumbnails. Userscript implementation of PhotoShow browser extension.
// @author       CitrusBlueMe409
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_setClipboard
// @grant        GM_download
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-start
// @license      MIT
// @homepageURL  https://github.com/CitrusBlueMe409/photoshow-userscript
// @supportURL   https://github.com/CitrusBlueMe409/photoshow-userscript/issues
// ==/UserScript==

(function() {
    'use strict';

    /* ==================== Configuration System ==================== */

    const DEFAULT_CONFIG = {
        // Global settings
        enabled: true,
        whitelistMode: false,

        // Viewer settings
        viewerTrigger: 'hover', // 'hover' or 'assist-key'
        assistKey: 'ctrl', // 'ctrl', 'alt', 'shift'
        viewerPositions: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
        defaultViewMode: 'auto', // 'auto', 'fit', 'lite', 'mini', 'panoramic'

        // Thumbnail settings
        thumbnailMinWidth: 48,
        thumbnailMinHeight: 48,
        thumbnailTypes: {
            img: true,
            bgImage: true,
            link: true
        },

        // Image info display
        showImageInfo: true,
        showViewModeIndicator: true,
        imageInfoItems: {
            caption: true,
            dimensions: true,
            format: true,
            fileSize: true
        },

        // Visual settings
        colorScheme: 'dark', // 'light' or 'dark'
        transitionAnimation: true,
        animationDuration: 300, // milliseconds

        // Keyboard shortcuts
        keyboardShortcuts: {
            download: true, // 'S'
            copy: true, // 'C'
            toggleMode: true, // 'V'
            autoMode: true, // 'A'
            fitMode: true, // 'F'
            liteMode: true, // 'L'
            miniMode: true, // 'M'
            panoramicMode: true, // 'P'
            navigation: true, // Arrow keys, Home, End, PgUp, PgDn
            rotation: true, // Shift+Ctrl+arrows
            flip: true // Alt+Ctrl+arrows
        },

        // Download settings
        downloadFilenameTemplate: '<c>_<w>x<h>.<e>',
        // Placeholders: <c>=caption, <H>=hostname, <h>=height, <w>=width, <e>=extension, <t>=timestamp
        alwaysAskDownloadLocation: false,
        defaultDownloadFormat: 'original', // 'original', 'jpg', 'png', 'webp'

        // Advanced settings
        newTabBehavior: 'background', // 'foreground' or 'background'
        markViewedImages: false,
        contextMenuEnabled: true,
        viewerExceptions: [], // Array of selectors to exclude
        scrollingModeThreshold: 1.5, // Aspect ratio threshold for scrolling mode

        // HD image detection
        hdImagePatterns: [
            { find: /\/s\d+(-c)?\//, replace: '/s0/' }, // Google
            { find: /_\d+x\d+\./, replace: '.' }, // Generic size suffix
            { find: /\.thumb\./, replace: '.' }, // Thumbnail indicator
            { find: /\/thumb\//, replace: '/original/' },
            { find: /\/small\//, replace: '/large/' },
            { find: /\/medium\//, replace: '/large/' },
            { find: /-small\./, replace: '-large.' },
            { find: /-medium\./, replace: '-large.' },
            { find: /-thumb\./, replace: '.' },
            { find: /_thumb\./, replace: '.' }
        ]
    };

    // Site-specific settings storage
    const SITE_CONFIG_KEY = `photoshow_site_${window.location.hostname}`;
    const GLOBAL_CONFIG_KEY = 'photoshow_global_config';

    // Helper function to restore RegExp objects from stored patterns
    function restoreRegExpPatterns(patterns) {
        if (!Array.isArray(patterns)) return DEFAULT_CONFIG.hdImagePatterns;

        return patterns.map(pattern => {
            // If pattern.find is already a RegExp, return as-is
            if (pattern.find instanceof RegExp) {
                return pattern;
            }

            // If pattern.find is a serialized RegExp object (has source and flags)
            if (pattern.find && typeof pattern.find === 'object' && pattern.find.source) {
                try {
                    return {
                        find: new RegExp(pattern.find.source, pattern.find.flags || ''),
                        replace: pattern.replace
                    };
                } catch (e) {
                    console.warn('[PhotoShow] Failed to restore RegExp pattern:', pattern, e);
                    return null;
                }
            }

            // If pattern.find is a string representation
            if (typeof pattern.find === 'string') {
                try {
                    // Try to parse as RegExp literal
                    const match = pattern.find.match(/^\/(.*)\/([gimsuy]*)$/);
                    if (match) {
                        return {
                            find: new RegExp(match[1], match[2]),
                            replace: pattern.replace
                        };
                    }
                } catch (e) {
                    console.warn('[PhotoShow] Failed to parse RegExp pattern:', pattern, e);
                }
            }

            return null;
        }).filter(p => p !== null);
    }

    // Get merged configuration (site-specific overrides global)
    function getConfig() {
        const globalConfig = GM_getValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
        const siteConfig = GM_getValue(SITE_CONFIG_KEY, {});
        const merged = { ...globalConfig, ...siteConfig };

        // Restore RegExp objects in hdImagePatterns
        if (merged.hdImagePatterns) {
            merged.hdImagePatterns = restoreRegExpPatterns(merged.hdImagePatterns);
        }

        return merged;
    }

    function saveGlobalConfig(config) {
        GM_setValue(GLOBAL_CONFIG_KEY, config);
    }

    function saveSiteConfig(config) {
        GM_setValue(SITE_CONFIG_KEY, config);
    }

    function exportSettings() {
        const globalConfig = GM_getValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
        const allSiteKeys = GM_listValues().filter(key => key.startsWith('photoshow_site_'));
        const siteConfigs = {};

        allSiteKeys.forEach(key => {
            const hostname = key.replace('photoshow_site_', '');
            siteConfigs[hostname] = GM_getValue(key, {});
        });

        return {
            version: '1.0.0',
            global: globalConfig,
            sites: siteConfigs
        };
    }

    function importSettings(settingsJson) {
        try {
            const settings = JSON.parse(settingsJson);

            if (settings.global) {
                saveGlobalConfig(settings.global);
            }

            if (settings.sites) {
                Object.keys(settings.sites).forEach(hostname => {
                    GM_setValue(`photoshow_site_${hostname}`, settings.sites[hostname]);
                });
            }

            GM_notification({
                text: 'Settings imported successfully!',
                title: 'PhotoShow',
                timeout: 3000
            });

            return true;
        } catch (e) {
            GM_notification({
                text: 'Failed to import settings: ' + e.message,
                title: 'PhotoShow Error',
                timeout: 5000
            });
            return false;
        }
    }

    /* ==================== State Management ==================== */

    const state = {
        config: getConfig(),
        currentViewer: null,
        currentViewMode: null,
        previousViewMode: null,
        lastHoveredElement: null,
        viewedImages: new Set(),
        currentRotation: 0,
        currentFlipH: false,
        currentFlipV: false,
        scrollPosition: { x: 0, y: 0 }
    };

    /* ==================== Utility Functions ==================== */

    function log(...args) {
        console.log('[PhotoShow]', ...args);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function getImageDimensions(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = url;
        });
    }

    function getImageFormat(url) {
        const ext = url.split('.').pop().split('?')[0].toLowerCase();
        const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        return formats.includes(ext) ? ext : 'jpg';
    }

    // Format file size for display (TODO: implement file size fetching)
    // function formatFileSize(bytes) {
    //     if (bytes === 0) return '0 B';
    //     const k = 1024;
    //     const sizes = ['B', 'KB', 'MB', 'GB'];
    //     const i = Math.floor(Math.log(bytes) / Math.log(k));
    //     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    // }

    function generateFilename(imageUrl, caption, width, height) {
        const template = state.config.downloadFilenameTemplate;
        const hostname = window.location.hostname;
        const timestamp = Date.now();
        const format = getImageFormat(imageUrl);

        let filename = template
            .replace(/<c>/g, caption || 'image')
            .replace(/<H>/g, hostname)
            .replace(/<h>/g, height)
            .replace(/<w>/g, width)
            .replace(/<e>/g, format)
            .replace(/<t>/g, timestamp);

        // Sanitize filename
        filename = filename.replace(/[<>:"/\\|?*]/g, '_');

        return filename;
    }

    /* ==================== HD Image Detection ==================== */

    function detectHDImageUrl(originalUrl) {
        if (!originalUrl) return null;

        let hdUrl = originalUrl;

        // Apply HD patterns
        if (Array.isArray(state.config.hdImagePatterns)) {
            state.config.hdImagePatterns.forEach(pattern => {
                try {
                    if (pattern && pattern.find && typeof pattern.find.test === 'function' && pattern.find.test(hdUrl)) {
                        hdUrl = hdUrl.replace(pattern.find, pattern.replace);
                    }
                } catch (e) {
                    console.warn('[PhotoShow] Error applying HD pattern:', pattern, e);
                }
            });
        }

        // Check if URL was modified
        if (hdUrl !== originalUrl) {
            return hdUrl;
        }

        // Try to detect size parameters in URL
        const sizeParams = ['s=', 'size=', 'w=', 'width=', 'h=', 'height='];
        const url = new URL(hdUrl, window.location.href);

        sizeParams.forEach(param => {
            if (url.searchParams.has(param)) {
                url.searchParams.delete(param);
            }
        });

        return url.toString();
    }

    function getImageFromElement(element) {
        // Get image URL from img element
        if (element.tagName === 'IMG') {
            return {
                url: element.src || element.dataset.src || element.dataset.original,
                caption: element.alt || element.title || '',
                element
            };
        }

        // Get image URL from background image
        const bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const url = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/i, '$1');
            return {
                url,
                caption: element.title || element.getAttribute('aria-label') || '',
                element
            };
        }

        // Get image URL from link
        if (element.tagName === 'A') {
            const href = element.href;
            if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(href)) {
                const img = element.querySelector('img');
                return {
                    url: href,
                    caption: img ? (img.alt || img.title) : (element.title || ''),
                    element: img || element
                };
            }
        }

        return null;
    }

    /* ==================== Viewer Creation and Display ==================== */

    function createViewer() {
        const viewer = document.createElement('div');
        viewer.id = 'photoshow-viewer';
        viewer.className = `photoshow-viewer photoshow-${state.config.colorScheme}`;

        viewer.innerHTML = `
            <div class="photoshow-viewer-image-container">
                <img class="photoshow-viewer-image" />
                <div class="photoshow-viewport-mask"></div>
            </div>
            <div class="photoshow-viewer-info">
                <div class="photoshow-info-caption"></div>
                <div class="photoshow-info-details">
                    <span class="photoshow-info-dimensions"></span>
                    <span class="photoshow-info-format"></span>
                    <span class="photoshow-info-size"></span>
                </div>
            </div>
            <div class="photoshow-viewer-controls">
                <span class="photoshow-mode-indicator"></span>
            </div>
        `;

        return viewer;
    }

    function calculateViewerPosition(thumbnailElement, viewerWidth, viewerHeight) {
        const rect = thumbnailElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const positions = state.config.viewerPositions;
        let bestPosition = null;
        let maxScore = -1;

        // Calculate scores for each allowed position
        const positionCoords = {
            'top-left': { x: rect.left, y: rect.top - viewerHeight - 10 },
            'top-right': { x: rect.right - viewerWidth, y: rect.top - viewerHeight - 10 },
            'bottom-left': { x: rect.left, y: rect.bottom + 10 },
            'bottom-right': { x: rect.right - viewerWidth, y: rect.bottom + 10 },
            center: { x: (viewport.width - viewerWidth) / 2, y: (viewport.height - viewerHeight) / 2 }
        };

        positions.forEach(pos => {
            const coords = positionCoords[pos];
            if (!coords) return;

            // Calculate how much of the viewer is visible
            const visibleX = Math.max(0, Math.min(coords.x + viewerWidth, viewport.width) - Math.max(coords.x, 0));
            const visibleY = Math.max(0, Math.min(coords.y + viewerHeight, viewport.height) - Math.max(coords.y, 0));
            const visibleArea = visibleX * visibleY;
            const totalArea = viewerWidth * viewerHeight;
            const score = visibleArea / totalArea;

            if (score > maxScore) {
                maxScore = score;
                bestPosition = { position: pos, x: coords.x, y: coords.y };
            }
        });

        return bestPosition || { position: 'center', x: positionCoords.center.x, y: positionCoords.center.y };
    }

    function determineViewMode(imageWidth, imageHeight) {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const currentMode = state.currentViewMode || state.config.defaultViewMode;

        switch (currentMode) {
        case 'auto': {
            // Automatically decide based on image and viewport
            const aspectRatio = imageWidth / imageHeight;
            if (aspectRatio > state.config.scrollingModeThreshold || aspectRatio < 1 / state.config.scrollingModeThreshold) {
                return { mode: 'auto-scroll', maxWidth: viewport.width * 0.8, maxHeight: viewport.height * 0.8 };
            }
            return { mode: 'auto-fit', maxWidth: viewport.width * 0.8, maxHeight: viewport.height * 0.8 };
        }
        case 'fit':
            return { mode: 'fit', maxWidth: viewport.width * 0.9, maxHeight: viewport.height * 0.9 };

        case 'lite':
            return { mode: 'lite', maxWidth: viewport.width * 0.25, maxHeight: viewport.height * 0.25 };

        case 'mini':
            return { mode: 'mini', maxWidth: viewport.width * 0.125, maxHeight: viewport.height * 0.125 };

        case 'panoramic':
            return { mode: 'panoramic', maxWidth: imageWidth, maxHeight: imageHeight };

        default:
            return { mode: 'auto-fit', maxWidth: viewport.width * 0.8, maxHeight: viewport.height * 0.8 };
        }
    }

    async function showViewer(imageInfo, thumbnailElement) {
        try {
            log('showViewer called with:', imageInfo.url);

            // Check if viewer should be shown
            if (!state.config.enabled) {
                log('❌ PhotoShow is DISABLED in settings!');
                log('💡 To enable: Open PhotoShow Settings from your userscript manager menu and check "Enable PhotoShow"');
                log('⚡ Quick fix: Run this in console: GM_setValue("photoshow_global_config", {...GM_getValue("photoshow_global_config", {}), enabled: true})');
                return;
            }
            if (state.config.whitelistMode && !GM_getValue(SITE_CONFIG_KEY, null)) {
                log('Whitelist mode active but no site config');
                return;
            }

            // Get HD image URL
            const hdUrl = detectHDImageUrl(imageInfo.url);
            log('HD URL:', hdUrl);

            // Get image dimensions
            const dimensions = await getImageDimensions(hdUrl);
            log('Image dimensions:', dimensions);

            if (dimensions.width === 0 || dimensions.height === 0) {
                log('Failed to load image dimensions');
                return;
            }

            // Create viewer if it doesn't exist
            if (!state.currentViewer) {
                log('Creating viewer');
                state.currentViewer = createViewer();
                document.body.appendChild(state.currentViewer);
                log('Viewer appended to body');
            }

            const viewer = state.currentViewer;
            const viewerImg = viewer.querySelector('.photoshow-viewer-image');
            // const viewportMask = viewer.querySelector('.photoshow-viewport-mask'); // TODO: implement scrolling mode

            // Determine view mode and dimensions
            const viewMode = determineViewMode(dimensions.width, dimensions.height);
            const scale = Math.min(
                viewMode.maxWidth / dimensions.width,
                viewMode.maxHeight / dimensions.height,
                1
            );

            const displayWidth = dimensions.width * scale;
            const displayHeight = dimensions.height * scale;

            // Set image
            viewerImg.src = hdUrl;
            viewerImg.style.width = displayWidth + 'px';
            viewerImg.style.height = displayHeight + 'px';

            // Set viewer dimensions
            viewer.style.width = displayWidth + 'px';
            viewer.style.height = displayHeight + 'px';

            // Calculate position
            const position = calculateViewerPosition(thumbnailElement, displayWidth, displayHeight);
            viewer.style.left = position.x + 'px';
            viewer.style.top = position.y + 'px';

            // Update image info
            const captionEl = viewer.querySelector('.photoshow-info-caption');
            const dimensionsEl = viewer.querySelector('.photoshow-info-dimensions');
            const formatEl = viewer.querySelector('.photoshow-info-format');
            // const sizeEl = viewer.querySelector('.photoshow-info-size'); // TODO: implement file size fetching

            let hasAnyInfo = false;

            if (state.config.showImageInfo && state.config.imageInfoItems.caption && imageInfo.caption) {
                captionEl.textContent = imageInfo.caption;
                captionEl.style.display = 'block';
                hasAnyInfo = true;
            } else {
                captionEl.style.display = 'none';
            }

            if (state.config.showImageInfo && state.config.imageInfoItems.dimensions) {
                dimensionsEl.textContent = `${dimensions.width} × ${dimensions.height}`;
                dimensionsEl.style.display = 'inline';
                hasAnyInfo = true;
            } else {
                dimensionsEl.style.display = 'none';
            }

            if (state.config.showImageInfo && state.config.imageInfoItems.format) {
                formatEl.textContent = getImageFormat(hdUrl).toUpperCase();
                formatEl.style.display = 'inline';
                hasAnyInfo = true;
            } else {
                formatEl.style.display = 'none';
            }

            // Show info bar only if showImageInfo is enabled AND at least one item has content
            viewer.querySelector('.photoshow-viewer-info').style.display =
                (state.config.showImageInfo && hasAnyInfo) ? 'block' : 'none';

            // Update mode indicator
            const modeIndicator = viewer.querySelector('.photoshow-mode-indicator');
            if (state.config.showViewModeIndicator) {
                modeIndicator.textContent = (state.currentViewMode || state.config.defaultViewMode).toUpperCase();
                modeIndicator.style.display = 'block';
            } else {
                modeIndicator.style.display = 'none';
            }

            // Show viewer with animation
            log('Making viewer visible');
            viewer.classList.add('photoshow-visible');
            if (state.config.transitionAnimation) {
                viewer.style.transition = `opacity ${state.config.animationDuration}ms ease-in-out`;
            }

            // Mark as viewed
            if (state.config.markViewedImages) {
                state.viewedImages.add(hdUrl);
                thumbnailElement.classList.add('photoshow-viewed');
            }

            // Store current image info
            viewer.dataset.imageUrl = hdUrl;
            viewer.dataset.imageWidth = dimensions.width;
            viewer.dataset.imageHeight = dimensions.height;
            viewer.dataset.imageCaption = imageInfo.caption || 'image';

            log('Viewer should now be visible');
        } catch (error) {
            log('Error in showViewer:', error.message);
            console.error('PhotoShow error:', error);
        }
    }

    function hideViewer() {
        if (state.currentViewer) {
            state.currentViewer.classList.remove('photoshow-visible');
            // Reset transformations
            state.currentRotation = 0;
            state.currentFlipH = false;
            state.currentFlipV = false;
            state.scrollPosition = { x: 0, y: 0 };
        }
    }

    /* ==================== Image Actions ==================== */

    function downloadImage() {
        if (!state.currentViewer) return;

        const url = state.currentViewer.dataset.imageUrl;
        const width = state.currentViewer.dataset.imageWidth;
        const height = state.currentViewer.dataset.imageHeight;
        const caption = state.currentViewer.dataset.imageCaption;

        if (!url) return;

        const filename = generateFilename(url, caption, width, height);

        GM_download({
            url,
            name: filename,
            onload: () => {
                GM_notification({
                    text: `Image saved: ${filename}`,
                    title: 'PhotoShow',
                    timeout: 3000
                });
            },
            onerror: (err) => {
                GM_notification({
                    text: 'Failed to download image: ' + err.error,
                    title: 'PhotoShow Error',
                    timeout: 5000
                });
            }
        });
    }

    function copyImage() {
        if (!state.currentViewer) return;

        const url = state.currentViewer.dataset.imageUrl;
        if (!url) return;

        // Copy URL to clipboard (image data copying requires different approach)
        GM_setClipboard(url, 'text');

        GM_notification({
            text: 'Image URL copied to clipboard',
            title: 'PhotoShow',
            timeout: 2000
        });
    }

    function rotateImage(direction) {
        if (!state.currentViewer) return;

        state.currentRotation += (direction === 'left' ? -90 : 90);
        state.currentRotation = ((state.currentRotation % 360) + 360) % 360;

        updateImageTransform();
    }

    function flipImage(direction) {
        if (!state.currentViewer) return;

        if (direction === 'horizontal') {
            state.currentFlipH = !state.currentFlipH;
        } else {
            state.currentFlipV = !state.currentFlipV;
        }

        updateImageTransform();
    }

    function updateImageTransform() {
        if (!state.currentViewer) return;

        const img = state.currentViewer.querySelector('.photoshow-viewer-image');
        const transforms = [];

        if (state.currentRotation !== 0) {
            transforms.push(`rotate(${state.currentRotation}deg)`);
        }

        if (state.currentFlipH) {
            transforms.push('scaleX(-1)');
        }

        if (state.currentFlipV) {
            transforms.push('scaleY(-1)');
        }

        img.style.transform = transforms.join(' ');
    }

    function changeViewMode(mode) {
        if (state.currentViewMode !== mode) {
            state.previousViewMode = state.currentViewMode;
            state.currentViewMode = mode;

            // Re-show viewer with new mode
            if (state.currentViewer && state.lastHoveredElement) {
                const imageInfo = getImageFromElement(state.lastHoveredElement);
                if (imageInfo) {
                    showViewer(imageInfo, state.lastHoveredElement);
                }
            }
        }
    }

    function toggleViewMode() {
        if (state.previousViewMode) {
            const temp = state.currentViewMode;
            state.currentViewMode = state.previousViewMode;
            state.previousViewMode = temp;

            // Re-show viewer
            if (state.currentViewer && state.lastHoveredElement) {
                const imageInfo = getImageFromElement(state.lastHoveredElement);
                if (imageInfo) {
                    showViewer(imageInfo, state.lastHoveredElement);
                }
            }
        }
    }

    /* ==================== Event Handlers ==================== */

    function shouldShowViewer(element) {
        // Check exceptions
        if (state.config.viewerExceptions.some(selector => element.matches(selector))) {
            return false;
        }

        // Check thumbnail size
        const rect = element.getBoundingClientRect();
        if (rect.width < state.config.thumbnailMinWidth || rect.height < state.config.thumbnailMinHeight) {
            return false;
        }

        // Check thumbnail type
        if (element.tagName === 'IMG' && !state.config.thumbnailTypes.img) return false;
        if (element.tagName === 'A' && !state.config.thumbnailTypes.link) return false;

        const bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage !== 'none' && !state.config.thumbnailTypes.bgImage) return false;

        return true;
    }

    const handleMouseOver = debounce(function(event) {
        const element = event.target;

        // Check if assist key is required and if it's pressed
        if (state.config.viewerTrigger === 'assist-key') {
            const assistKeyPressed =
                (state.config.assistKey === 'ctrl' && event.ctrlKey) ||
                (state.config.assistKey === 'alt' && event.altKey) ||
                (state.config.assistKey === 'shift' && event.shiftKey);

            if (!assistKeyPressed) return;
        }

        if (!shouldShowViewer(element)) return;

        const imageInfo = getImageFromElement(element);
        if (!imageInfo) return;

        log('Image detected:', imageInfo.url);
        state.lastHoveredElement = element;
        showViewer(imageInfo, element);
    }, 100);

    function handleMouseOut(event) {
        // const element = event.target; // Currently unused
        const related = event.relatedTarget;

        // Don't hide if moving to viewer
        if (related && (related === state.currentViewer || state.currentViewer?.contains(related))) {
            return;
        }

        hideViewer();
    }

    function handleKeyDown(event) {
        if (!state.currentViewer || !state.currentViewer.classList.contains('photoshow-visible')) {
            return;
        }

        const config = state.config.keyboardShortcuts;

        // Download (S)
        if (config.download && event.key.toLowerCase() === 's' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            event.preventDefault();
            downloadImage();
            return;
        }

        // Copy (C)
        if (config.copy && event.key.toLowerCase() === 'c' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            event.preventDefault();
            copyImage();
            return;
        }

        // Toggle mode (V)
        if (config.toggleMode && event.key.toLowerCase() === 'v' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            event.preventDefault();
            toggleViewMode();
            return;
        }

        // View modes
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
            if (config.autoMode && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                changeViewMode('auto');
                return;
            }
            if (config.fitMode && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                changeViewMode('fit');
                return;
            }
            if (config.liteMode && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                changeViewMode('lite');
                return;
            }
            if (config.miniMode && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                changeViewMode('mini');
                return;
            }
            if (config.panoramicMode && event.key.toLowerCase() === 'p') {
                event.preventDefault();
                changeViewMode('panoramic');
                return;
            }
        }

        // Rotation (Shift+Ctrl+Arrow)
        if (config.rotation && event.shiftKey && event.ctrlKey && !event.altKey) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                rotateImage('left');
                return;
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                rotateImage('right');
                return;
            }
        }

        // Flip (Alt+Ctrl+Arrow)
        if (config.flip && event.altKey && event.ctrlKey && !event.shiftKey) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                flipImage('horizontal');
                return;
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                flipImage('vertical');
            }
        }
    }

    /* ==================== Styles ==================== */

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #photoshow-viewer {
                position: fixed;
                z-index: 999999;
                opacity: 0;
                pointer-events: none;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                transition: opacity 0.3s ease-in-out;
            }
            
            #photoshow-viewer.photoshow-visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            #photoshow-viewer.photoshow-dark {
                background: #1a1a1a;
                color: #ffffff;
            }
            
            #photoshow-viewer.photoshow-light {
                background: #ffffff;
                color: #000000;
                border: 1px solid #ddd;
            }
            
            .photoshow-viewer-image-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            
            .photoshow-viewer-image {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
                transition: transform 0.3s ease-in-out;
            }
            
            .photoshow-viewport-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                display: none;
            }
            
            .photoshow-viewer-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                font-size: 12px;
                line-height: 1.4;
            }
            
            #photoshow-viewer.photoshow-light .photoshow-viewer-info {
                background: rgba(255, 255, 255, 0.9);
                color: black;
            }
            
            .photoshow-info-caption {
                font-weight: bold;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .photoshow-info-details span {
                margin-right: 12px;
            }
            
            .photoshow-viewer-controls {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.6);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
            }
            
            #photoshow-viewer.photoshow-light .photoshow-viewer-controls {
                background: rgba(255, 255, 255, 0.8);
                color: black;
            }
            
            .photoshow-viewed {
                opacity: 0.7;
            }
        `;

        document.head.appendChild(style);
    }

    /* ==================== Context Menu ==================== */

    function registerContextMenu() {
        if (!state.config.contextMenuEnabled) return;

        GM_registerMenuCommand('PhotoShow Settings', () => {
            openSettingsDialog();
        });

        GM_registerMenuCommand('Export Settings', () => {
            const settings = exportSettings();
            const json = JSON.stringify(settings, null, 2);
            GM_setClipboard(json, 'text');
            GM_notification({
                text: 'Settings exported to clipboard',
                title: 'PhotoShow',
                timeout: 3000
            });
        });

        GM_registerMenuCommand('Import Settings', () => {
            const json = prompt('Paste your settings JSON:');
            if (json) {
                importSettings(json);
                location.reload();
            }
        });

        GM_registerMenuCommand('Reset Global Settings', () => {
            if (confirm('Are you sure you want to reset all global settings to defaults?')) {
                saveGlobalConfig(DEFAULT_CONFIG);
                GM_notification({
                    text: 'Global settings reset to defaults',
                    title: 'PhotoShow',
                    timeout: 3000
                });
                location.reload();
            }
        });

        GM_registerMenuCommand('Reset Site Settings', () => {
            if (confirm(`Are you sure you want to reset settings for ${window.location.hostname}?`)) {
                GM_deleteValue(SITE_CONFIG_KEY);
                GM_notification({
                    text: `Site settings reset for ${window.location.hostname}`,
                    title: 'PhotoShow',
                    timeout: 3000
                });
                location.reload();
            }
        });

        GM_registerMenuCommand('Toggle PhotoShow', () => {
            state.config.enabled = !state.config.enabled;
            saveSiteConfig({ enabled: state.config.enabled });
            GM_notification({
                text: `PhotoShow ${state.config.enabled ? 'enabled' : 'disabled'} for this site`,
                title: 'PhotoShow',
                timeout: 3000
            });
        });
    }

    function openSettingsDialog() {
        // Create a comprehensive settings UI
        const dialog = document.createElement('div');
        dialog.id = 'photoshow-settings-dialog';

        const config = state.config;

        dialog.innerHTML = `
            <style>
                #photoshow-settings-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #photoshow-settings-container {
                    background: #ffffff;
                    color: #333;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                #photoshow-settings-header {
                    padding: 20px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px 12px 0 0;
                }
                #photoshow-settings-header h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                #photoshow-settings-header p {
                    margin: 8px 0 0 0;
                    opacity: 0.9;
                    font-size: 14px;
                }
                #photoshow-settings-tabs {
                    display: flex;
                    background: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                    padding: 0 24px;
                }
                .photoshow-tab {
                    padding: 12px 20px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    color: #666;
                    font-size: 14px;
                    font-weight: 500;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .photoshow-tab:hover {
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                }
                .photoshow-tab.active {
                    color: #667eea;
                    border-bottom-color: #667eea;
                }
                #photoshow-settings-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                .photoshow-tab-panel {
                    display: none;
                }
                .photoshow-tab-panel.active {
                    display: block;
                }
                .photoshow-setting-group {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .photoshow-setting-group h3 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: #333;
                    font-weight: 600;
                }
                .photoshow-setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #e0e0e0;
                }
                .photoshow-setting-item:last-child {
                    border-bottom: none;
                }
                .photoshow-setting-label {
                    flex: 1;
                    margin-right: 16px;
                }
                .photoshow-setting-label-title {
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                }
                .photoshow-setting-label-desc {
                    font-size: 12px;
                    color: #666;
                }
                .photoshow-setting-control {
                    flex-shrink: 0;
                }
                .photoshow-setting-control input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }
                .photoshow-setting-control select,
                .photoshow-setting-control input[type="text"],
                .photoshow-setting-control input[type="number"] {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    min-width: 150px;
                }
                .photoshow-setting-control select:focus,
                .photoshow-setting-control input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                #photoshow-settings-footer {
                    padding: 16px 24px;
                    background: #f5f5f5;
                    border-top: 1px solid #ddd;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                }
                .photoshow-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .photoshow-btn-primary {
                    background: #667eea;
                    color: white;
                }
                .photoshow-btn-primary:hover {
                    background: #5568d3;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
                .photoshow-btn-secondary {
                    background: #e0e0e0;
                    color: #333;
                }
                .photoshow-btn-secondary:hover {
                    background: #d0d0d0;
                }
                .photoshow-btn-danger {
                    background: #ef4444;
                    color: white;
                }
                .photoshow-btn-danger:hover {
                    background: #dc2626;
                }
            </style>
            <div id="photoshow-settings-overlay">
                <div id="photoshow-settings-container">
                    <div id="photoshow-settings-header">
                        <h2>⚙️ PhotoShow Settings</h2>
                        <p>Configure your image viewing experience</p>
                    </div>
                    
                    <div id="photoshow-settings-tabs">
                        <button class="photoshow-tab active" data-tab="general">General</button>
                        <button class="photoshow-tab" data-tab="viewer">Viewer</button>
                        <button class="photoshow-tab" data-tab="keyboard">Keyboard</button>
                        <button class="photoshow-tab" data-tab="advanced">Advanced</button>
                    </div>
                    
                    <div id="photoshow-settings-content">
                        <!-- General Settings Tab -->
                        <div class="photoshow-tab-panel active" data-panel="general">
                            <div class="photoshow-setting-group">
                                <h3>🔧 Basic Settings</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Enable PhotoShow</div>
                                        <div class="photoshow-setting-label-desc">Turn on/off the image viewer</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-enabled" ${config.enabled ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Whitelist Mode</div>
                                        <div class="photoshow-setting-label-desc">Disable globally, enable per-site</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-whitelistMode" ${config.whitelistMode ? 'checked' : ''}>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="photoshow-setting-group">
                                <h3>🎨 Appearance</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Color Scheme</div>
                                        <div class="photoshow-setting-label-desc">Choose light or dark theme</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <select id="setting-colorScheme">
                                            <option value="light" ${config.colorScheme === 'light' ? 'selected' : ''}>Light</option>
                                            <option value="dark" ${config.colorScheme === 'dark' ? 'selected' : ''}>Dark</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Transition Animation</div>
                                        <div class="photoshow-setting-label-desc">Enable smooth fade animations</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-transitionAnimation" ${config.transitionAnimation ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Animation Duration</div>
                                        <div class="photoshow-setting-label-desc">Duration in milliseconds</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="number" id="setting-animationDuration" value="${config.animationDuration}" min="0" max="1000" step="50">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="photoshow-setting-group">
                                <h3>ℹ️ Image Information</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Show Image Info</div>
                                        <div class="photoshow-setting-label-desc">Display image details</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-showImageInfo" ${config.showImageInfo ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Show Caption</div>
                                        <div class="photoshow-setting-label-desc">Display image alt/title text</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-imageInfoItems-caption" ${config.imageInfoItems?.caption ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Show Dimensions</div>
                                        <div class="photoshow-setting-label-desc">Display width × height</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-imageInfoItems-dimensions" ${config.imageInfoItems?.dimensions ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Show Format</div>
                                        <div class="photoshow-setting-label-desc">Display file format (JPG, PNG, etc.)</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-imageInfoItems-format" ${config.imageInfoItems?.format ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Show View Mode Indicator</div>
                                        <div class="photoshow-setting-label-desc">Display mode indicator in top-right corner (AUTO, FIT, etc.)</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-showViewModeIndicator" ${config.showViewModeIndicator ? 'checked' : ''}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Viewer Settings Tab -->
                        <div class="photoshow-tab-panel" data-panel="viewer">
                            <div class="photoshow-setting-group">
                                <h3>👁️ Viewer Behavior</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Viewer Trigger</div>
                                        <div class="photoshow-setting-label-desc">How to activate the viewer</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <select id="setting-viewerTrigger">
                                            <option value="hover" ${config.viewerTrigger === 'hover' ? 'selected' : ''}>Hover</option>
                                            <option value="assist-key" ${config.viewerTrigger === 'assist-key' ? 'selected' : ''}>Assist Key</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Assist Key</div>
                                        <div class="photoshow-setting-label-desc">Key to hold for assist mode</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <select id="setting-assistKey">
                                            <option value="ctrl" ${config.assistKey === 'ctrl' ? 'selected' : ''}>Ctrl</option>
                                            <option value="alt" ${config.assistKey === 'alt' ? 'selected' : ''}>Alt</option>
                                            <option value="shift" ${config.assistKey === 'shift' ? 'selected' : ''}>Shift</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Default View Mode</div>
                                        <div class="photoshow-setting-label-desc">Initial view mode on hover</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <select id="setting-defaultViewMode">
                                            <option value="auto" ${config.defaultViewMode === 'auto' ? 'selected' : ''}>Auto</option>
                                            <option value="fit" ${config.defaultViewMode === 'fit' ? 'selected' : ''}>Fit</option>
                                            <option value="lite" ${config.defaultViewMode === 'lite' ? 'selected' : ''}>Lite</option>
                                            <option value="mini" ${config.defaultViewMode === 'mini' ? 'selected' : ''}>Mini</option>
                                            <option value="panoramic" ${config.defaultViewMode === 'panoramic' ? 'selected' : ''}>Panoramic</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="photoshow-setting-group">
                                <h3>🖼️ Thumbnail Settings</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Minimum Width</div>
                                        <div class="photoshow-setting-label-desc">Minimum thumbnail width in pixels</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="number" id="setting-thumbnailMinWidth" value="${config.thumbnailMinWidth}" min="0" max="500" step="1">
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Minimum Height</div>
                                        <div class="photoshow-setting-label-desc">Minimum thumbnail height in pixels</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="number" id="setting-thumbnailMinHeight" value="${config.thumbnailMinHeight}" min="0" max="500" step="1">
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Enable for IMG elements</div>
                                        <div class="photoshow-setting-label-desc">Show viewer for &lt;img&gt; tags</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-thumbnailTypes-img" ${config.thumbnailTypes?.img ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Enable for background images</div>
                                        <div class="photoshow-setting-label-desc">Show viewer for CSS backgrounds</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-thumbnailTypes-bgImage" ${config.thumbnailTypes?.bgImage ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Enable for image links</div>
                                        <div class="photoshow-setting-label-desc">Show viewer for links to images</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-thumbnailTypes-link" ${config.thumbnailTypes?.link ? 'checked' : ''}>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="photoshow-setting-group">
                                <h3>💾 Download Settings</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Filename Template</div>
                                        <div class="photoshow-setting-label-desc">Use placeholders: &lt;c&gt; &lt;H&gt; &lt;w&gt; &lt;h&gt; &lt;e&gt; &lt;t&gt;</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="text" id="setting-downloadFilenameTemplate" value="${config.downloadFilenameTemplate}" style="min-width: 250px;">
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Always Ask Location</div>
                                        <div class="photoshow-setting-label-desc">Prompt for save location</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-alwaysAskDownloadLocation" ${config.alwaysAskDownloadLocation ? 'checked' : ''}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Keyboard Settings Tab -->
                        <div class="photoshow-tab-panel" data-panel="keyboard">
                            <div class="photoshow-setting-group">
                                <h3>⌨️ Keyboard Shortcuts</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Download (S)</div>
                                        <div class="photoshow-setting-label-desc">Enable download shortcut</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-download" ${config.keyboardShortcuts?.download ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Copy (C)</div>
                                        <div class="photoshow-setting-label-desc">Enable copy URL shortcut</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-copy" ${config.keyboardShortcuts?.copy ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Toggle Mode (V)</div>
                                        <div class="photoshow-setting-label-desc">Enable mode toggle shortcut</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-toggleMode" ${config.keyboardShortcuts?.toggleMode ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">View Mode Shortcuts (A/F/L/M/P)</div>
                                        <div class="photoshow-setting-label-desc">Enable mode selection shortcuts</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-viewModes" ${config.keyboardShortcuts?.autoMode ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Navigation (Arrow keys, Home, End, PgUp, PgDn)</div>
                                        <div class="photoshow-setting-label-desc">Enable navigation shortcuts</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-navigation" ${config.keyboardShortcuts?.navigation ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Rotation (Shift+Ctrl+Arrows)</div>
                                        <div class="photoshow-setting-label-desc">Enable rotation shortcuts</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-rotation" ${config.keyboardShortcuts?.rotation ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Flip (Alt+Ctrl+Arrows)</div>
                                        <div class="photoshow-setting-label-desc">Enable flip shortcuts</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-keyboardShortcuts-flip" ${config.keyboardShortcuts?.flip ? 'checked' : ''}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Advanced Settings Tab -->
                        <div class="photoshow-tab-panel" data-panel="advanced">
                            <div class="photoshow-setting-group">
                                <h3>🔬 Advanced Options</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Mark Viewed Images</div>
                                        <div class="photoshow-setting-label-desc">Add visual indicator to viewed images</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-markViewedImages" ${config.markViewedImages ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Context Menu</div>
                                        <div class="photoshow-setting-label-desc">Enable right-click menu items</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="checkbox" id="setting-contextMenuEnabled" ${config.contextMenuEnabled ? 'checked' : ''}>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Scrolling Mode Threshold</div>
                                        <div class="photoshow-setting-label-desc">Aspect ratio for scrolling mode</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <input type="number" id="setting-scrollingModeThreshold" value="${config.scrollingModeThreshold}" min="1.0" max="5.0" step="0.1">
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">New Tab Behavior</div>
                                        <div class="photoshow-setting-label-desc">Where to open new image tabs</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <select id="setting-newTabBehavior">
                                            <option value="foreground" ${config.newTabBehavior === 'foreground' ? 'selected' : ''}>Foreground</option>
                                            <option value="background" ${config.newTabBehavior === 'background' ? 'selected' : ''}>Background</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="photoshow-setting-group">
                                <h3>📦 Settings Management</h3>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Export Settings</div>
                                        <div class="photoshow-setting-label-desc">Copy all settings as JSON</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <button class="photoshow-btn photoshow-btn-secondary" id="btn-export-settings">Export</button>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Import Settings</div>
                                        <div class="photoshow-setting-label-desc">Restore from JSON</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <button class="photoshow-btn photoshow-btn-secondary" id="btn-import-settings">Import</button>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Reset Global Settings</div>
                                        <div class="photoshow-setting-label-desc">Restore default global settings</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <button class="photoshow-btn photoshow-btn-danger" id="btn-reset-global">Reset Global</button>
                                    </div>
                                </div>
                                <div class="photoshow-setting-item">
                                    <div class="photoshow-setting-label">
                                        <div class="photoshow-setting-label-title">Reset Site Settings</div>
                                        <div class="photoshow-setting-label-desc">Clear settings for this site</div>
                                    </div>
                                    <div class="photoshow-setting-control">
                                        <button class="photoshow-btn photoshow-btn-danger" id="btn-reset-site">Reset Site</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="photoshow-settings-footer">
                        <div style="flex: 1;">
                            <button class="photoshow-btn photoshow-btn-secondary" id="photoshow-close-settings">Cancel</button>
                        </div>
                        <button class="photoshow-btn photoshow-btn-primary" id="photoshow-save-settings">Save & Apply</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Tab switching
        const tabs = dialog.querySelectorAll('.photoshow-tab');
        const panels = dialog.querySelectorAll('.photoshow-tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                dialog.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
            });
        });

        // Save settings
        dialog.querySelector('#photoshow-save-settings').addEventListener('click', () => {
            const newConfig = {
                enabled: dialog.querySelector('#setting-enabled').checked,
                whitelistMode: dialog.querySelector('#setting-whitelistMode').checked,
                colorScheme: dialog.querySelector('#setting-colorScheme').value,
                transitionAnimation: dialog.querySelector('#setting-transitionAnimation').checked,
                animationDuration: parseInt(dialog.querySelector('#setting-animationDuration').value),
                showImageInfo: dialog.querySelector('#setting-showImageInfo').checked,
                showViewModeIndicator: dialog.querySelector('#setting-showViewModeIndicator').checked,
                imageInfoItems: {
                    caption: dialog.querySelector('#setting-imageInfoItems-caption').checked,
                    dimensions: dialog.querySelector('#setting-imageInfoItems-dimensions').checked,
                    format: dialog.querySelector('#setting-imageInfoItems-format').checked,
                    fileSize: config.imageInfoItems?.fileSize || true
                },
                viewerTrigger: dialog.querySelector('#setting-viewerTrigger').value,
                assistKey: dialog.querySelector('#setting-assistKey').value,
                defaultViewMode: dialog.querySelector('#setting-defaultViewMode').value,
                thumbnailMinWidth: parseInt(dialog.querySelector('#setting-thumbnailMinWidth').value),
                thumbnailMinHeight: parseInt(dialog.querySelector('#setting-thumbnailMinHeight').value),
                thumbnailTypes: {
                    img: dialog.querySelector('#setting-thumbnailTypes-img').checked,
                    bgImage: dialog.querySelector('#setting-thumbnailTypes-bgImage').checked,
                    link: dialog.querySelector('#setting-thumbnailTypes-link').checked
                },
                downloadFilenameTemplate: dialog.querySelector('#setting-downloadFilenameTemplate').value,
                alwaysAskDownloadLocation: dialog.querySelector('#setting-alwaysAskDownloadLocation').checked,
                keyboardShortcuts: {
                    download: dialog.querySelector('#setting-keyboardShortcuts-download').checked,
                    copy: dialog.querySelector('#setting-keyboardShortcuts-copy').checked,
                    toggleMode: dialog.querySelector('#setting-keyboardShortcuts-toggleMode').checked,
                    // View mode shortcuts all share same value
                    autoMode: dialog.querySelector('#setting-keyboardShortcuts-viewModes').checked,
                    fitMode: dialog.querySelector('#setting-keyboardShortcuts-viewModes').checked,
                    liteMode: dialog.querySelector('#setting-keyboardShortcuts-viewModes').checked,
                    miniMode: dialog.querySelector('#setting-keyboardShortcuts-viewModes').checked,
                    panoramicMode: dialog.querySelector('#setting-keyboardShortcuts-viewModes').checked,
                    navigation: dialog.querySelector('#setting-keyboardShortcuts-navigation').checked,
                    rotation: dialog.querySelector('#setting-keyboardShortcuts-rotation').checked,
                    flip: dialog.querySelector('#setting-keyboardShortcuts-flip').checked
                },
                markViewedImages: dialog.querySelector('#setting-markViewedImages').checked,
                contextMenuEnabled: dialog.querySelector('#setting-contextMenuEnabled').checked,
                scrollingModeThreshold: parseFloat(dialog.querySelector('#setting-scrollingModeThreshold').value),
                newTabBehavior: dialog.querySelector('#setting-newTabBehavior').value,
                // Keep other settings that aren't in UI
                viewerPositions: config.viewerPositions,
                viewerExceptions: config.viewerExceptions,
                hdImagePatterns: config.hdImagePatterns,
                defaultDownloadFormat: config.defaultDownloadFormat
            };

            // Save to appropriate storage
            saveGlobalConfig(newConfig);
            state.config = newConfig;

            GM_notification({
                text: 'Settings saved successfully!',
                title: 'PhotoShow',
                timeout: 2000
            });

            document.body.removeChild(dialog);

            // Reload page to apply settings
            setTimeout(() => location.reload(), 500);
        });

        // Close button
        dialog.querySelector('#photoshow-close-settings').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        // Close on overlay click
        dialog.querySelector('#photoshow-settings-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'photoshow-settings-overlay') {
                document.body.removeChild(dialog);
            }
        });

        // Export settings
        dialog.querySelector('#btn-export-settings').addEventListener('click', () => {
            const settings = exportSettings();
            const json = JSON.stringify(settings, null, 2);
            GM_setClipboard(json, 'text');
            GM_notification({
                text: 'Settings exported to clipboard!',
                title: 'PhotoShow',
                timeout: 2000
            });
        });

        // Import settings
        dialog.querySelector('#btn-import-settings').addEventListener('click', () => {
            const json = prompt('Paste your settings JSON:');
            if (json) {
                if (importSettings(json)) {
                    setTimeout(() => {
                        document.body.removeChild(dialog);
                        location.reload();
                    }, 1000);
                }
            }
        });

        // Reset global settings
        dialog.querySelector('#btn-reset-global').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all global settings to defaults?')) {
                saveGlobalConfig(DEFAULT_CONFIG);
                GM_notification({
                    text: 'Global settings reset to defaults',
                    title: 'PhotoShow',
                    timeout: 2000
                });
                setTimeout(() => location.reload(), 500);
            }
        });

        // Reset site settings
        dialog.querySelector('#btn-reset-site').addEventListener('click', () => {
            if (confirm(`Are you sure you want to reset settings for ${window.location.hostname}?`)) {
                GM_deleteValue(SITE_CONFIG_KEY);
                GM_notification({
                    text: `Site settings reset for ${window.location.hostname}`,
                    title: 'PhotoShow',
                    timeout: 2000
                });
                setTimeout(() => location.reload(), 500);
            }
        });
    }

    /* ==================== Initialization ==================== */

    function init() {
        log('Initializing PhotoShow userscript...');

        // Check if PhotoShow is enabled
        if (!state.config.enabled) {
            log('⚠️  PhotoShow is currently DISABLED');
            log('💡 To enable, open Settings from your userscript manager menu');
            log('⚡ Or run in console: window.enablePhotoShow()');
        }

        // Inject styles
        injectStyles();

        // Register context menu
        registerContextMenu();

        // Initialize view mode
        state.currentViewMode = state.config.defaultViewMode;

        // Setup event listeners
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('keydown', handleKeyDown, true);

        log('PhotoShow initialized successfully');

        // Expose helper functions to window for console access
        window.enablePhotoShow = function() {
            const currentConfig = GM_getValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
            currentConfig.enabled = true;
            GM_setValue(GLOBAL_CONFIG_KEY, currentConfig);
            log('✅ PhotoShow ENABLED! Reloading page...');
            setTimeout(() => location.reload(), 500);
        };

        window.disablePhotoShow = function() {
            const currentConfig = GM_getValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
            currentConfig.enabled = false;
            GM_setValue(GLOBAL_CONFIG_KEY, currentConfig);
            log('❌ PhotoShow DISABLED! Reloading page...');
            setTimeout(() => location.reload(), 500);
        };

        window.resetPhotoShowSettings = function() {
            GM_setValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
            GM_deleteValue(SITE_CONFIG_KEY);
            log('🔄 PhotoShow settings reset to defaults! Reloading page...');
            setTimeout(() => location.reload(), 500);
        };
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
