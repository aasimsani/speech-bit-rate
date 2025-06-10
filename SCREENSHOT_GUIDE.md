# Screenshot Guide for Chrome Web Store

## Required Screenshots

The Chrome Web Store requires at least **1 screenshot** but recommends **3-5 screenshots** to showcase your extension effectively.

### Screenshot Specifications
- **Size**: 1280x800 pixels (recommended) or 640x400 pixels (minimum)
- **Format**: PNG or JPEG
- **Content**: Should clearly show your extension's functionality

## Recommended Screenshots

### 1. Main Interface (Required)
**What to capture**: The extension popup in its initial state
- Open the extension popup
- Show the clean interface with "Start Recording" button
- Include the status card showing "Ready to analyze speech"
- **Filename**: `01-main-interface.png`

### 2. Recording in Progress (Highly Recommended)
**What to capture**: Extension actively recording and analyzing speech
- Start recording and speak a few sentences
- Capture the popup showing:
  - Live transcription text
  - Real-time statistics (duration, word count, entropy, info rate)
  - "LIVE" indicator
  - "Stop Recording" button active
- **Filename**: `02-recording-active.png`

### 3. Final Results Display (Highly Recommended)
**What to capture**: Completed analysis results
- After stopping recording, show the final results
- Display complete statistics and analysis
- Show the full transcript
- **Filename**: `03-final-results.png`

### 4. Permission Request (Optional)
**What to capture**: Microphone permission dialog
- Show the browser's microphone permission request
- Demonstrates the extension's permission handling
- **Filename**: `04-permission-request.png`

## How to Take Screenshots

### Method 1: Browser Developer Tools (Recommended)
1. Open Chrome Developer Tools (F12)
2. Click the device toolbar icon (mobile/tablet icon)
3. Set custom dimensions: 1280x800
4. Open your extension popup
5. Take screenshot using your OS screenshot tool

### Method 2: Extension Screenshot Tools
1. Install a screenshot extension like "Awesome Screenshot"
2. Set capture area to 1280x800
3. Capture the extension popup area

### Method 3: OS Screenshot + Resize
1. Take screenshot with your OS tool
2. Crop and resize to 1280x800 using image editor
3. Ensure the extension popup is clearly visible

## Screenshot Tips

### Do's ✅
- Use realistic sample text for transcription
- Show meaningful statistics (not all zeros)
- Ensure text is readable and clear
- Use good lighting/contrast
- Show the extension working properly
- Include some sample transcribed text

### Don'ts ❌
- Don't use placeholder or Lorem ipsum text
- Don't show error states unless demonstrating error handling
- Don't include personal/sensitive information
- Don't use blurry or low-quality images
- Don't show empty/blank states

## Sample Content for Screenshots

### For Recording Screenshot:
**Sample speech to use**: 
"Hello, this is a test of the speech information rate analyzer. I'm speaking at a normal pace to demonstrate how the extension calculates entropy and information rate in real time."

**Expected stats to show**:
- Duration: ~8-10 seconds
- Words: ~25-30 words
- Entropy: ~8-12 bits/word
- Info Rate: ~15-25 bits/second

## Final Checklist

Before submitting screenshots:
- [ ] All screenshots are 1280x800 pixels
- [ ] Images are clear and high quality
- [ ] Extension functionality is clearly demonstrated
- [ ] No personal information is visible
- [ ] Screenshots show the extension working properly
- [ ] At least 1 screenshot, ideally 3-4 screenshots
- [ ] Files are named descriptively

## Upload to Chrome Web Store

1. Go to Chrome Web Store Developer Console
2. Navigate to your extension listing
3. Go to "Store listing" tab
4. Scroll to "Screenshots" section
5. Upload your screenshots in order
6. Add captions if desired (optional but helpful)

---

*Remember: Good screenshots can significantly improve your extension's conversion rate and user understanding!* 