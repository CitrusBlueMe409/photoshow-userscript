#!/usr/bin/env node

/**
 * Build script for PhotoShow Userscript
 * Creates dist directory with userscript and metadata
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const userscriptPath = path.join(rootDir, 'photoshow.user.js');

// Create dist directory
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy userscript
console.log('Copying userscript to dist...');
fs.copyFileSync(userscriptPath, path.join(distDir, 'photoshow.user.js'));

// Extract version from userscript
const userscriptContent = fs.readFileSync(userscriptPath, 'utf8');
const versionMatch = userscriptContent.match(/@version\s+(\S+)/);
const version = versionMatch ? versionMatch[1] : '1.0.0';

// Generate metadata file
console.log('Generating metadata file...');
const metadataLines = userscriptContent
    .split('\n')
    .filter(line => line.includes('// @'))
    .filter(line => !line.includes('@grant') && !line.includes('@connect') && !line.includes('@run-at'));

const metadata = `${metadataLines.join('\n')}
// @updateURL    https://github.com/CitrusBlueMe409/photoshow-userscript/raw/main/photoshow.user.js
// @downloadURL  https://github.com/CitrusBlueMe409/photoshow-userscript/raw/main/photoshow.user.js
// ==/UserScript==`;

fs.writeFileSync(path.join(distDir, 'photoshow.meta.js'), metadata);

// Generate build info
console.log('Generating build info...');
const buildInfo = `PhotoShow Userscript v${version}
Built on: ${new Date().toISOString()}
Repository: https://github.com/CitrusBlueMe409/photoshow-userscript
`;

fs.writeFileSync(path.join(distDir, 'BUILD_INFO.txt'), buildInfo);

console.log(`Build complete! Version ${version} created in dist/`);
