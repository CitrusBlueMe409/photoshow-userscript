#!/usr/bin/env node

/**
 * Version update script for PhotoShow Userscript
 * Updates version in userscript header and package.json
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const userscriptPath = path.join(rootDir, 'photoshow.user.js');
const packagePath = path.join(rootDir, 'package.json');

// Get new version from command line
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Usage: node update-version.js <version>');
    console.error('Example: node update-version.js 1.1.0');
    process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('Invalid version format. Use semantic versioning: X.Y.Z');
    process.exit(1);
}

// Update userscript
console.log('Updating userscript version...');
let userscriptContent = fs.readFileSync(userscriptPath, 'utf8');
userscriptContent = userscriptContent.replace(
    /@version\s+\S+/,
    `@version      ${newVersion}`
);
fs.writeFileSync(userscriptPath, userscriptContent);

// Update package.json
console.log('Updating package.json version...');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version updated to ${newVersion}`);
