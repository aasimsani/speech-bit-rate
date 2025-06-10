// DOM elements
const statusMessage = document.getElementById('status-message');
const requestBtn = document.getElementById('request-permission');
const closeBtn = document.getElementById('close-window');
const requestText = document.getElementById('request-text');
const loadingDots = document.getElementById('loading-dots');

// State management
let isLoading = false;

// Update status message
function updateStatus(type, message) {
    statusMessage.className = `status-message ${type}`;
    statusMessage.textContent = message;
    
    // Add animation
    statusMessage.style.transform = 'translateY(-10px)';
    statusMessage.style.opacity = '0';
    
    setTimeout(() => {
        statusMessage.style.transform = 'translateY(0)';
        statusMessage.style.opacity = '1';
    }, 100);
}

// Update loading state
function setLoading(loading) {
    isLoading = loading;
    requestBtn.disabled = loading;
    closeBtn.disabled = loading;
    
    if (loading) {
        requestText.textContent = 'Requesting Access';
        loadingDots.style.display = 'inline-flex';
        requestBtn.style.opacity = '0.8';
    } else {
        requestText.textContent = 'Request Permission';
        loadingDots.style.display = 'none';
        requestBtn.style.opacity = '1';
    }
}

// Request microphone permission
async function requestPermission() {
    if (isLoading) return;
    
    setLoading(true);
    updateStatus('info', 'Requesting microphone access...');
    
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Stop the stream immediately - we just needed the permission
        stream.getTracks().forEach(track => track.stop());
        
        updateStatus('success', 'Microphone access granted! You can now close this window.');
        setLoading(false);
        
        // Add success animation to button
        requestBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        requestBtn.innerHTML = `
            <span>✅</span>
            <span>Permission Granted!</span>
        `;
        
        // Auto-close after 2 seconds
        setTimeout(() => {
            window.close();
        }, 2000);
        
    } catch (error) {
        console.error('Microphone permission error:', error);
        
        let errorMessage = 'Permission denied. Please try again.';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permission denied. Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Microphone access not supported in this browser.';
        }
        
        updateStatus('error', errorMessage);
        setLoading(false);
        
        // Add error animation to button
        requestBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        requestBtn.innerHTML = `
            <span>❌</span>
            <span>Permission Denied</span>
        `;
        
        // Reset button after 3 seconds
        setTimeout(() => {
            requestBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            requestBtn.innerHTML = `
                <span>🔓</span>
                <span>Request Permission</span>
            `;
        }, 3000);
    }
}

// Close window
function closeWindow() {
    if (isLoading) return;
    window.close();
}

// Event listeners
requestBtn.addEventListener('click', requestPermission);
closeBtn.addEventListener('click', closeWindow);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation
    document.querySelector('.permission-container').style.animation = 'slideUp 0.6s ease-out';
    
    // Focus on the request button
    requestBtn.focus();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !isLoading) {
        requestPermission();
    } else if (event.key === 'Escape' && !isLoading) {
        closeWindow();
    }
}); 