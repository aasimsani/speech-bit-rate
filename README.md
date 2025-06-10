# Speech Information Rate Analyzer

A Chrome extension that provides real-time analysis of speech information rate (bits per second) using linguistic entropy calculations.

## Features

- **Real-time Speech Analysis**: Live transcription and analysis of spoken words
- **Information Rate Calculation**: Measures bits per second based on linguistic entropy
- **Word Frequency Analysis**: Uses large corpus data for accurate probability calculations
- **Beautiful UI**: Modern, responsive interface with live statistics
- **Privacy-First**: All processing happens locally in your browser

## How It Works

The extension uses the Web Speech API to transcribe speech in real-time, then calculates:

1. **Entropy per Word**: Based on word frequency in large text corpora
2. **Speaking Rate**: Words per second
3. **Information Rate**: Entropy × Speaking Rate (bits/second)

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Grant microphone permissions when prompted

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. Click "Start Recording" to begin speech analysis
3. Speak naturally - the extension will show:
   - Live transcription
   - Duration of recording
   - Word count
   - Average entropy per word
   - Information rate (bits/second)
4. Click "Stop Recording" to finish and see final results

## Technical Details

- Uses Web Speech API for speech recognition
- Calculates word-level entropy using frequency data from:
  - Norvig's word frequency corpus
  - Google's 10,000 most common English words
- Information theory calculations based on Shannon entropy
- All processing happens locally for privacy

## Privacy

- No data is sent to external servers
- Speech processing uses browser's built-in Web Speech API
- Corpus data is loaded from public sources
- No personal information is stored or transmitted

## Browser Compatibility

- Chrome 25+ (recommended: Chrome 80+)
- Requires microphone access
- Works on all platforms (Windows, macOS, Linux)

## Development

Built with:
- Vanilla JavaScript
- Chrome Extension Manifest V3
- Web Speech API
- Modern CSS with animations

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## Support

For issues or questions, please create an issue on GitHub. 