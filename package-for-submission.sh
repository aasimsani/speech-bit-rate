#!/bin/bash

# Chrome Web Store Submission Package Script
# This script creates a clean ZIP file ready for Chrome Web Store submission

echo "🚀 Packaging Speech Information Rate Analyzer for Chrome Web Store submission..."

# Create a temporary directory for packaging
TEMP_DIR="speech-analyzer-submission"
ZIP_NAME="speech-information-rate-analyzer-v1.0.0.zip"

# Remove existing temp directory and zip file if they exist
rm -rf "$TEMP_DIR"
rm -f "$ZIP_NAME"

# Create temp directory
mkdir "$TEMP_DIR"

echo "📁 Copying required files..."

# Copy required files
cp manifest.json "$TEMP_DIR/"
cp popup.html "$TEMP_DIR/"
cp popup.js "$TEMP_DIR/"
cp permission.html "$TEMP_DIR/"
cp permission.js "$TEMP_DIR/"

# Copy optional but recommended files
cp README.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"
cp PRIVACY_POLICY.md "$TEMP_DIR/"

# Copy icons directory
cp -r icons "$TEMP_DIR/"

echo "🔍 Verifying package contents..."

# List contents
echo "Package contents:"
find "$TEMP_DIR" -type f | sort

echo ""
echo "📊 File sizes:"
find "$TEMP_DIR" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}'

# Create ZIP file
echo ""
echo "📦 Creating ZIP file: $ZIP_NAME"
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*"
cd ..

# Get ZIP file size
ZIP_SIZE=$(ls -lh "$ZIP_NAME" | awk '{print $5}')
echo "✅ ZIP file created: $ZIP_NAME ($ZIP_SIZE)"

# Verify ZIP contents
echo ""
echo "🔍 ZIP file contents:"
unzip -l "$ZIP_NAME"

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Package ready for Chrome Web Store submission!"
echo ""
echo "Next steps:"
echo "1. Go to https://chrome.google.com/webstore/devconsole/"
echo "2. Create a developer account (if you haven't already) - $5 one-time fee"
echo "3. Click 'Add new item' and upload: $ZIP_NAME"
echo "4. Fill in the store listing details using STORE_LISTING.md as reference"
echo "5. Add screenshots of your extension in action"
echo "6. Submit for review!"
echo ""
echo "📋 Don't forget to:"
echo "- Take screenshots (1280x800 or 640x400 pixels)"
echo "- Test the extension in a fresh Chrome profile first"
echo "- Review the CHROME_WEB_STORE_CHECKLIST.md for any remaining tasks" 