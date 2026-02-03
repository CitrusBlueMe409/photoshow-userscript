// ==UserScript==
// @name         PhotoShow - Image Viewer
// @namespace    https://github.com/CitrusBlueMe409/photoshow-userscript
// @version      1.0.0
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

    // Get merged configuration (site-specific overrides global)
    function getConfig() {
        const globalConfig = GM_getValue(GLOBAL_CONFIG_KEY, DEFAULT_CONFIG);
        const siteConfig = GM_getValue(SITE_CONFIG_KEY, {});
        return { ...globalConfig, ...siteConfig };
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
        state.config.hdImagePatterns.forEach(pattern => {
            if (pattern.find.test(hdUrl)) {
                hdUrl = hdUrl.replace(pattern.find, pattern.replace);
            }
        });

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
        // Check if viewer should be shown
        if (!state.config.enabled) return;
        if (state.config.whitelistMode && !GM_getValue(SITE_CONFIG_KEY, null)) return;

        // Get HD image URL
        const hdUrl = detectHDImageUrl(imageInfo.url);

        // Get image dimensions
        const dimensions = await getImageDimensions(hdUrl);
        if (dimensions.width === 0 || dimensions.height === 0) return;

        // Create viewer if it doesn't exist
        if (!state.currentViewer) {
            state.currentViewer = createViewer();
            document.body.appendChild(state.currentViewer);
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
        if (state.config.showImageInfo) {
            const captionEl = viewer.querySelector('.photoshow-info-caption');
            const dimensionsEl = viewer.querySelector('.photoshow-info-dimensions');
            const formatEl = viewer.querySelector('.photoshow-info-format');
            // const sizeEl = viewer.querySelector('.photoshow-info-size'); // TODO: implement file size fetching

            if (state.config.imageInfoItems.caption) {
                captionEl.textContent = imageInfo.caption || '';
                captionEl.style.display = imageInfo.caption ? 'block' : 'none';
            }

            if (state.config.imageInfoItems.dimensions) {
                dimensionsEl.textContent = `${dimensions.width} × ${dimensions.height}`;
            }

            if (state.config.imageInfoItems.format) {
                formatEl.textContent = getImageFormat(hdUrl).toUpperCase();
            }

            viewer.querySelector('.photoshow-viewer-info').style.display =
                state.config.showImageInfo ? 'block' : 'none';
        }

        // Update mode indicator
        const modeIndicator = viewer.querySelector('.photoshow-mode-indicator');
        modeIndicator.textContent = (state.currentViewMode || state.config.defaultViewMode).toUpperCase();

        // Show viewer with animation
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

        if (!shouldShowViewer(element)) return;

        const imageInfo = getImageFromElement(element);
        if (!imageInfo) return;

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
        // Create a simple settings UI
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        z-index: 10000000; max-width: 500px; max-height: 80vh; overflow-y: auto; color: black;">
                <h2 style="margin-top: 0;">PhotoShow Settings</h2>
                <p>Use GM_registerMenuCommand options for now.</p>
                <p>Full settings UI coming soon!</p>
                <button id="photoshow-close-settings" style="margin-top: 20px; padding: 8px 16px;">Close</button>
            </div>
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(0,0,0,0.5); z-index: 9999999;"></div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#photoshow-close-settings').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    /* ==================== Initialization ==================== */

    function init() {
        log('Initializing PhotoShow userscript...');

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
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
