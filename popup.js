window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Application state
let isListening = false;
let mediaStream = null;
let recognition = null;
let startTime = null;
let finalTranscript = '';
let interimTranscript = '';
let updateInterval = null;

// Word frequency data
let wordFrequencies = {};
let totalWordsInCorpus = 1000000;
let corpusLoaded = false;

// DOM elements
const statusCard = document.getElementById('status-card');
const statusDot = document.getElementById('status-dot');
const statusTitle = document.getElementById('status-title');
const statusMessage = document.getElementById('status-message');
const loadingSpinner = document.getElementById('loading-spinner');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const liveBadge = document.getElementById('live-badge');
const transcriptContent = document.getElementById('transcript-content');
const durationStat = document.getElementById('duration-stat');
const wordsStat = document.getElementById('words-stat');
const entropyStat = document.getElementById('entropy-stat');
const infoRateStat = document.getElementById('info-rate-stat');

// Status management
function updateStatus(type, title, message, showLoading = false) {
    // Update status card classes
    statusCard.className = `status-card ${type}`;
    statusDot.className = `status-dot ${type}`;
    
    // Update text content
    statusTitle.textContent = title;
    statusMessage.textContent = message;
    
    // Show/hide loading spinner
    loadingSpinner.style.display = showLoading ? 'block' : 'none';
    
    // Add subtle animation
    statusCard.style.transform = 'scale(0.98)';
    setTimeout(() => {
        statusCard.style.transform = 'scale(1)';
    }, 100);
}

// Update UI state
function updateUI() {
    startBtn.disabled = isListening || !corpusLoaded;
    stopBtn.disabled = !isListening;
    
    // Show/hide live badge
    liveBadge.style.display = isListening ? 'flex' : 'none';
    
    // Update button states with animations
    if (isListening) {
        startBtn.style.opacity = '0.5';
        stopBtn.style.opacity = '1';
    } else {
        startBtn.style.opacity = corpusLoaded ? '1' : '0.5';
        stopBtn.style.opacity = '0.5';
    }
}

// Load corpus data
async function loadCorpusData() {
    updateStatus('info', 'Loading corpus data', 'Please wait while we load language data...', true);
    
    const corpusSources = [
        {
            name: 'Norvig Word Counts',
            url: 'https://norvig.com/ngrams/count_1w.txt',
            type: 'counts'
        },
        {
            name: 'Google 10K (no swears)',
            url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt',
            type: 'ranked'
        }
    ];

    for (const source of corpusSources) {
        try {
            console.log(`Attempting to load ${source.name}...`);
            const response = await fetch(source.url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
            
            if (lines.length < 1000) {
                throw new Error(`Corpus too small: only ${lines.length} entries`);
            }
            
            wordFrequencies = {};
            let totalCount = 0;
            
            if (source.type === 'counts') {
                const wordCounts = [];
                
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        const word = parts[0].toLowerCase();
                        const count = parseInt(parts[1]);
                        if (!isNaN(count) && word.length > 0) {
                            wordCounts.push({ word, count });
                            totalCount += count;
                        }
                    }
                }
                
                for (const { word, count } of wordCounts) {
                    wordFrequencies[word] = count / totalCount;
                }
                
                totalWordsInCorpus = totalCount;
                console.log(`Successfully loaded ${wordCounts.length} words with ${totalCount.toLocaleString()} total occurrences from ${source.name}`);
                updateStatus('success', 'Corpus loaded successfully', `${source.name}: ${wordCounts.length.toLocaleString()} words, ${totalCount.toLocaleString()} occurrences`);
                
            } else {
                const words = lines;
                const totalFreq = words.reduce((sum, _, index) => sum + (1 / (index + 1)), 0);
                
                words.forEach((word, index) => {
                    const rank = index + 1;
                    const frequency = (1 / rank) / totalFreq;
                    wordFrequencies[word.toLowerCase().trim()] = frequency;
                });
                
                totalWordsInCorpus = words.length * 100;
                console.log(`Successfully loaded ${words.length} words from ${source.name} (ranked list)`);
                updateStatus('success', 'Corpus loaded successfully', `${source.name}: ${words.length} words`);
            }
            
            corpusLoaded = true;
            updateUI();
            return;
            
        } catch (error) {
            console.warn(`Failed to load ${source.name}:`, error.message);
            continue;
        }
    }
    
    // Fallback corpus
    console.error('All corpus sources failed, using fallback data');
    wordFrequencies = {
        'the': 0.0687, 'of': 0.0365, 'and': 0.0315, 'a': 0.0301, 'to': 0.0296,
        'in': 0.0234, 'is': 0.0204, 'you': 0.0204, 'that': 0.0156, 'it': 0.0154,
        'he': 0.0149, 'was': 0.0129, 'for': 0.0118, 'on': 0.0118, 'are': 0.0106,
        'as': 0.0106, 'with': 0.0104, 'his': 0.0100, 'they': 0.0094, 'i': 0.0094,
        'at': 0.0093, 'be': 0.0093, 'this': 0.0090, 'have': 0.0083, 'from': 0.0082,
        'or': 0.0074, 'one': 0.0074, 'had': 0.0071, 'by': 0.0071, 'word': 0.0068,
        'but': 0.0067, 'not': 0.0067, 'what': 0.0066, 'all': 0.0062, 'were': 0.0058
    };
    corpusLoaded = true;
    totalWordsInCorpus = 1000000;
    updateStatus('warning', 'Using fallback corpus', 'Limited accuracy - could not load external corpus data');
    updateUI();
}

// Calculate entropy per word
function entropyPerWord(text) {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;
    
    let totalEntropy = 0;
    for (const word of words) {
        const probability = wordFrequencies[word] || (1 / totalWordsInCorpus);
        totalEntropy += -Math.log2(probability);
    }
    
    return totalEntropy / words.length;
}

// Update real-time display
function updateRealTimeDisplay() {
    if (!startTime) return;
    
    const currentTime = new Date();
    const durationSeconds = (currentTime - startTime) / 1000;
    const fullTranscript = finalTranscript + interimTranscript;
    
    // Improved word counting - handle empty transcript case
    let words = 0;
    const trimmedTranscript = fullTranscript.trim();
    if (trimmedTranscript.length > 0) {
        words = trimmedTranscript.split(/\s+/).filter(word => word.length > 0).length;
    }
    
    const avgEntropyPerWord = words > 0 ? entropyPerWord(trimmedTranscript) : 0;
    const infoRate = words > 0 ? (words / durationSeconds) * avgEntropyPerWord : 0;
    
    // Update stats with smooth animations
    animateStatUpdate(durationStat, `${durationSeconds.toFixed(1)}s`);
    animateStatUpdate(wordsStat, words.toString());
    animateStatUpdate(entropyStat, avgEntropyPerWord.toFixed(2));
    animateStatUpdate(infoRateStat, infoRate.toFixed(2));
    
    // Update transcript
    updateTranscript();
}

// Animate stat updates
function animateStatUpdate(element, newValue) {
    if (element.textContent !== newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#3b82f6';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            setTimeout(() => {
                element.style.color = '';
            }, 200);
        }, 100);
    }
}

// Update transcript display
function updateTranscript() {
    const fullText = finalTranscript;
    const interimText = interimTranscript;
    
    let html = '';
    
    if (fullText || interimText) {
        html += fullText;
        if (interimText) {
            html += `<span class="interim-text">${interimText}</span>`;
        }
        if (isListening) {
            html += '<span class="cursor">|</span>';
        }
    } else {
        if (isListening) {
            html = '<span class="placeholder-text">Listening for speech...</span>';
        } else {
            html = '<span class="placeholder-text">Press start to begin recording</span>';
        }
    }
    
    // Safely set content using textContent for text-only parts
    transcriptContent.textContent = '';
    
    // Create and append elements for HTML content
    if (fullText) {
        const textNode = document.createTextNode(fullText);
        transcriptContent.appendChild(textNode);
    }
    
    if (interimText) {
        const interimSpan = document.createElement('span');
        interimSpan.className = 'interim-text';
        interimSpan.textContent = interimText;
        transcriptContent.appendChild(interimSpan);
    }
    
    if (isListening) {
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        cursorSpan.textContent = '|';
        transcriptContent.appendChild(cursorSpan);
    }
    
    if (!fullText && !interimText) {
        const placeholderSpan = document.createElement('span');
        placeholderSpan.className = 'placeholder-text';
        placeholderSpan.textContent = isListening ? 
            'Listening for speech...' : 
            'Press start to begin recording';
        transcriptContent.appendChild(placeholderSpan);
    }
    
    // Auto-scroll to bottom
    transcriptContent.scrollTop = transcriptContent.scrollHeight;
}

// Check microphone permission
async function checkMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        return false;
    }
}

// Open permission page
async function openPermissionPage() {
    return new Promise((resolve) => {
        chrome.windows.create({
            url: chrome.runtime.getURL('permission.html'),
            type: 'popup',
            width: 500,
            height: 400
        }, (window) => {
            chrome.windows.onRemoved.addListener(function onWindowClose(windowId) {
                if (windowId === window.id) {
                    chrome.windows.onRemoved.removeListener(onWindowClose);
                    resolve();
                }
            });
        });
    });
}

// Initialize speech recognition
function initializeSpeechRecognition() {
    if (!window.SpeechRecognition) {
        updateStatus('error', 'Not supported', 'Speech recognition is not supported in this browser');
        return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log('Speech recognition started');
        startTime = new Date();
        finalTranscript = '';
        interimTranscript = '';
        isListening = true;
        updateStatus('listening', 'Listening...', 'Speak now for real-time analysis');
        updateUI();
        updateInterval = setInterval(updateRealTimeDisplay, 100);
    };

    recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            console.log(`Speech result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                console.log('Updated final transcript:', `"${finalTranscript}"`);
            } else {
                interimTranscript += transcript;
                console.log('Updated interim transcript:', `"${interimTranscript}"`);
            }
        }
        
        updateRealTimeDisplay();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        console.log('Error details:', event);
        
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            console.log('Temporary error, continuing...');
            return;
        }
        
        isListening = false;
        updateStatus('error', 'Recognition error', `Error: ${event.error}`);
        updateUI();
    };

    recognition.onend = () => {
        console.log('Speech recognition ended, isListening:', isListening);
        if (isListening) {
            try {
                console.log('Attempting to restart recognition...');
                recognition.start();
            } catch (error) {
                console.error('Failed to restart recognition:', error);
                stopSpeechRecognition();
            }
        }
    };

    return true;
}

// Start speech recognition
async function startSpeechRecognition() {
    try {
        const hasPermission = await checkMicrophonePermission();
        
        if (!hasPermission) {
            updateStatus('info', 'Opening permission window', 'Please grant microphone access');
            await openPermissionPage();
            
            const hasPermissionNow = await checkMicrophonePermission();
            if (!hasPermissionNow) {
                updateStatus('error', 'Permission denied', 'Microphone permission required. Please try again.');
                return;
            }
        }
        
        if (!recognition) {
            const speechSupported = initializeSpeechRecognition();
            if (!speechSupported) return;
        }
        
        recognition.start();
        
    } catch (error) {
        console.error('Speech recognition error:', error);
        updateStatus('error', 'Error occurred', `Error: ${error.message}`);
        isListening = false;
        updateUI();
    }
}

// Stop speech recognition
function stopSpeechRecognition() {
    if (recognition && isListening) {
        isListening = false;
        recognition.stop();
        
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        // Give a small delay to allow final speech recognition results to come in
        setTimeout(() => {
            // Show final results
            const endTime = new Date();
            const durationSeconds = (endTime - startTime) / 1000;
        
        // Include both final and interim transcript for complete analysis
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        
        // Debug logging
        console.log('Final transcript only:', `"${finalTranscript.trim()}"`);
        console.log('Interim transcript:', `"${interimTranscript}"`);
        console.log('Combined transcript:', `"${fullTranscript}"`);
        console.log('Combined transcript length:', fullTranscript.length);
        
        // Improved word counting - handle empty transcript case
        let words = 0;
        if (fullTranscript.length > 0) {
            words = fullTranscript.split(/\s+/).filter(word => word.length > 0).length;
        }
        
        console.log('Word count:', words);
        
        const avgEntropyPerWord = words > 0 ? entropyPerWord(fullTranscript) : 0;
        const infoRate = words > 0 ? (words / durationSeconds) * avgEntropyPerWord : 0;
        
        console.log('Average entropy per word:', avgEntropyPerWord);
        console.log('Information rate:', infoRate);
        
        if (words === 0) {
            updateStatus('warning', 'No speech detected', `Recording complete but no speech was recognized. Duration: ${durationSeconds.toFixed(1)}s`);
        } else {
            updateStatus('success', 'Recording complete', `Analysis finished: ${words} words, ${infoRate.toFixed(2)} bits/sec`);
        }
        
            updateUI();
            updateTranscript();
        }, 100); // 100ms delay to allow final results
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isListening && corpusLoaded) {
        startSpeechRecognition();
    }
});

stopBtn.addEventListener('click', () => {
    if (isListening) {
        stopSpeechRecognition();
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    updateTranscript();
    loadCorpusData();
});

// Load corpus data when the page loads
loadCorpusData();
