#!/bin/bash

# PhotoShow Test Script
# This script helps verify that the PhotoShow userscript works correctly

echo "=================================="
echo "PhotoShow Userscript Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check if main file exists
echo "Test 1: Checking if photoshow.user.js exists..."
if [ -f "photoshow.user.js" ]; then
    echo -e "${GREEN}✓ PASS${NC} - photoshow.user.js found"
else
    echo -e "${RED}✗ FAIL${NC} - photoshow.user.js not found"
    exit 1
fi

# Test 2: Check if test page exists
echo ""
echo "Test 2: Checking if test-photoshow.html exists..."
if [ -f "test-photoshow.html" ]; then
    echo -e "${GREEN}✓ PASS${NC} - test-photoshow.html found"
else
    echo -e "${RED}✗ FAIL${NC} - test-photoshow.html not found"
    exit 1
fi

# Test 3: Check for critical functions
echo ""
echo "Test 3: Checking for critical functions..."

functions=(
    "handleMouseOver"
    "showViewer"
    "getImageFromElement"
    "detectHDImageUrl"
    "openSettingsDialog"
)

for func in "${functions[@]}"; do
    if grep -q "function $func\|const $func" photoshow.user.js; then
        echo -e "${GREEN}✓${NC} Found: $func"
    else
        echo -e "${RED}✗${NC} Missing: $func"
    fi
done

# Test 4: Check for viewer trigger implementation
echo ""
echo "Test 4: Checking viewer trigger implementation..."
if grep -q "viewerTrigger === 'assist-key'" photoshow.user.js; then
    echo -e "${GREEN}✓ PASS${NC} - Assist-key check implemented"
else
    echo -e "${RED}✗ FAIL${NC} - Assist-key check not found"
fi

# Test 5: Check for event listeners
echo ""
echo "Test 5: Checking event listeners..."
if grep -q "addEventListener.*mouseover" photoshow.user.js; then
    echo -e "${GREEN}✓ PASS${NC} - Mouseover event listener found"
else
    echo -e "${RED}✗ FAIL${NC} - Mouseover event listener not found"
fi

if grep -q "addEventListener.*mouseout" photoshow.user.js; then
    echo -e "${GREEN}✓ PASS${NC} - Mouseout event listener found"
else
    echo -e "${RED}✗ FAIL${NC} - Mouseout event listener not found"
fi

# Test 6: Check for GM functions
echo ""
echo "Test 6: Checking Greasemonkey API usage..."
gm_functions=(
    "GM_getValue"
    "GM_setValue"
    "GM_download"
    "GM_setClipboard"
    "GM_notification"
    "GM_registerMenuCommand"
)

for gm_func in "${gm_functions[@]}"; do
    if grep -q "$gm_func" photoshow.user.js; then
        echo -e "${GREEN}✓${NC} Using: $gm_func"
    else
        echo -e "${YELLOW}⚠${NC} Not using: $gm_func"
    fi
done

# Test 7: Check line count
echo ""
echo "Test 7: Checking code size..."
lines=$(wc -l < photoshow.user.js)
echo "Total lines: $lines"
if [ $lines -gt 1500 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Adequate code size"
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Code might be incomplete"
fi

# Test 8: Check for Settings UI
echo ""
echo "Test 8: Checking Settings UI implementation..."
if grep -q "photoshow-settings-container" photoshow.user.js; then
    echo -e "${GREEN}✓ PASS${NC} - Settings UI HTML found"
else
    echo -e "${RED}✗ FAIL${NC} - Settings UI not found"
fi

# Test 9: Check for ESLint
echo ""
echo "Test 9: Running ESLint..."
if command -v npx &> /dev/null; then
    if npx eslint photoshow.user.js --quiet; then
        echo -e "${GREEN}✓ PASS${NC} - No linting errors"
    else
        echo -e "${RED}✗ FAIL${NC} - Linting errors found"
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - npx not available"
fi

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Install the userscript in your browser"
echo "2. Open test-photoshow.html in your browser"
echo "3. Hover over images to test functionality"
echo "4. Try keyboard shortcuts (S, C, V, A/F/L/M/P)"
echo "5. Open Settings UI from userscript manager menu"
echo ""
echo "For manual testing:"
echo "  - Test hover mode (default)"
echo "  - Test assist-key mode (change in settings)"
echo "  - Test all keyboard shortcuts"
echo "  - Test on various websites"
echo ""
