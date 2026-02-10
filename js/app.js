// Pomodoro Timer App - Minimal Design

// ============================================
// STATE MANAGEMENT
// ============================================

const STATE = {
    // Timer state
    timeLeft: 25 * 60, // seconds
    totalTime: 25 * 60,
    isRunning: false,
    isPaused: false,
    timerInterval: null,

    // Session tracking
    currentSession: 1,
    sessionType: 'focus', // 'focus', 'shortBreak', 'longBreak'
    completedSessions: 0,

    // Layout
    isLandscape: false,

    // Settings
    settings: {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        soundEnabled: true,
        vibrationEnabled: true
    }
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    appContainer: document.querySelector('.app-container'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerMessage: document.getElementById('timerMessage'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),

    // Top bar
    focusBtn: document.getElementById('focusBtn'),
    restBtn: document.getElementById('restBtn'),
    layoutToggle: document.getElementById('layoutToggle'),
    settingsToggle: document.getElementById('settingsToggle'),

    // Session dots
    dots: document.querySelectorAll('.dot'),

    // Settings
    settingsPanel: document.getElementById('settingsPanel'),
    closeSettings: document.getElementById('closeSettings'),
    focusDuration: document.getElementById('focusDuration'),
    shortBreakDuration: document.getElementById('shortBreakDuration'),
    longBreakDuration: document.getElementById('longBreakDuration'),
    soundToggle: document.getElementById('soundToggle'),
    vibrationToggle: document.getElementById('vibrationToggle')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update UI
function updateUI() {
    elements.timerDisplay.textContent = formatTime(STATE.timeLeft);
    updateSessionDots();
    updateTimerMessage();
}

// Update session dots
function updateSessionDots() {
    elements.dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index < STATE.completedSessions) {
            dot.classList.add('completed');
        } else if (index === STATE.currentSession - 1 && STATE.sessionType === 'focus') {
            dot.classList.add('active');
        }
    });
}

// Update timer message
function updateTimerMessage() {
    const messages = {
        focus: 'Time to focus!',
        shortBreak: 'Take a short break!',
        longBreak: 'Take a long break!'
    };
    elements.timerMessage.textContent = messages[STATE.sessionType] || 'Time to focus!';
}

// Update focus/rest toggle
function updateSessionToggle() {
    if (STATE.sessionType === 'focus') {
        elements.focusBtn.classList.add('active');
        elements.restBtn.classList.remove('active');
    } else {
        elements.focusBtn.classList.remove('active');
        elements.restBtn.classList.add('active');
    }
}

// ============================================
// TIMER FUNCTIONS
// ============================================

// Start timer
function startTimer() {
    if (STATE.isRunning) return;

    STATE.isRunning = true;
    STATE.isPaused = false;

    // Update button visibility
    elements.startBtn.style.display = 'none';
    elements.pauseBtn.style.display = 'flex';

    // Add running class for pulse animation
    elements.timerDisplay.classList.add('running');

    // Start countdown
    STATE.timerInterval = setInterval(() => {
        STATE.timeLeft--;
        updateUI();

        // Timer finished
        if (STATE.timeLeft <= 0) {
            STATE.timeLeft = 0; // Ensure it doesn't go negative
            updateUI();
            completeSession();
        }
    }, 1000);

    // Update document title
    updateDocumentTitle();

    // Request wake lock during focus
    if (STATE.sessionType === 'focus') {
        requestWakeLock();
    }
}

// Pause timer
function pauseTimer() {
    if (!STATE.isRunning) return;

    STATE.isRunning = false;
    STATE.isPaused = true;

    clearInterval(STATE.timerInterval);

    // Update button visibility
    elements.startBtn.style.display = 'flex';
    elements.pauseBtn.style.display = 'none';

    // Remove running class
    elements.timerDisplay.classList.remove('running');

    // Reset document title
    document.title = 'Pomodoro Timer (Paused)';

    // Release wake lock
    releaseWakeLock();
}

// Reset timer
function resetTimer() {
    pauseTimer();

    // Reset to current session type duration
    const duration = getSessionDuration(STATE.sessionType);
    STATE.timeLeft = duration * 60;
    STATE.totalTime = duration * 60;
    STATE.isPaused = false;

    // Remove running class
    elements.timerDisplay.classList.remove('running');

    updateUI();
    document.title = 'Pomodoro Timer';
}

// Complete current session
function completeSession() {
    pauseTimer();

    // Play notification
    playNotification();

    // Vibrate if enabled
    if (STATE.settings.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }

    // Send notification
    sendNotification();

    // Move to next session
    const shouldContinue = moveToNextSession();

    // Auto-start next session after a brief delay, unless cycle is complete
    if (shouldContinue) {
        setTimeout(() => {
            startTimer();
        }, 2000); // 2 second delay before auto-starting
    }
}

// Move to next session
function moveToNextSession() {
    if (STATE.sessionType === 'focus') {
        STATE.completedSessions++;

        // Check if it's time for long break
        if (STATE.completedSessions >= 4) {
            STATE.sessionType = 'longBreak';
        } else {
            STATE.sessionType = 'shortBreak';
            STATE.currentSession++;
        }
    } else if (STATE.sessionType === 'longBreak') {
        // After long break, complete the full cycle - reset everything
        STATE.completedSessions = 0;
        STATE.currentSession = 1;
        STATE.sessionType = 'focus';

        const duration = getSessionDuration(STATE.sessionType);
        STATE.timeLeft = duration * 60;
        STATE.totalTime = duration * 60;

        updateSessionToggle();
        updateUI();
        document.title = 'Pomodoro Timer';

        // Return false to indicate cycle is complete, don't auto-start
        return false;
    } else {
        // After short break, return to focus
        STATE.sessionType = 'focus';
    }

    // Set new duration
    const duration = getSessionDuration(STATE.sessionType);
    STATE.timeLeft = duration * 60;
    STATE.totalTime = duration * 60;

    updateSessionToggle();
    updateUI();
    document.title = 'Pomodoro Timer';

    // Return true to indicate we should continue to next session
    return true;
}

// Get session duration based on type
function getSessionDuration(type) {
    switch(type) {
        case 'focus':
            return STATE.settings.focusDuration;
        case 'shortBreak':
        case 'longBreak':
            return type === 'shortBreak' ?
                STATE.settings.shortBreakDuration :
                STATE.settings.longBreakDuration;
        default:
            return 25;
    }
}

// Update document title with countdown
function updateDocumentTitle() {
    if (STATE.isRunning) {
        document.title = `${formatTime(STATE.timeLeft)} - Pomodoro`;
        requestAnimationFrame(updateDocumentTitle);
    }
}

// ============================================
// SESSION TOGGLE FUNCTIONS
// ============================================

// Switch to focus mode
function switchToFocus() {
    if (STATE.isRunning) return; // Don't switch during active timer

    STATE.sessionType = 'focus';
    const duration = getSessionDuration('focus');
    STATE.timeLeft = duration * 60;
    STATE.totalTime = duration * 60;

    updateSessionToggle();
    updateUI();
}

// Switch to rest/break mode
function switchToRest() {
    if (STATE.isRunning) return; // Don't switch during active timer

    // Determine which break type
    STATE.sessionType = STATE.completedSessions >= 4 ? 'longBreak' : 'shortBreak';
    const duration = getSessionDuration(STATE.sessionType);
    STATE.timeLeft = duration * 60;
    STATE.totalTime = duration * 60;

    updateSessionToggle();
    updateUI();
}

// ============================================
// LAYOUT TOGGLE
// ============================================

function toggleLayout() {
    STATE.isLandscape = !STATE.isLandscape;

    if (STATE.isLandscape) {
        elements.appContainer.classList.add('landscape');
        localStorage.setItem('layout', 'landscape');
    } else {
        elements.appContainer.classList.remove('landscape');
        localStorage.setItem('layout', 'portrait');
    }
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

// Open settings panel
function openSettings() {
    elements.settingsPanel.classList.add('open');
}

// Close settings panel
function closeSettings() {
    elements.settingsPanel.classList.remove('open');
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        try {
            STATE.settings = { ...STATE.settings, ...JSON.parse(saved) };

            // Update UI
            elements.focusDuration.value = STATE.settings.focusDuration;
            elements.shortBreakDuration.value = STATE.settings.shortBreakDuration;
            elements.longBreakDuration.value = STATE.settings.longBreakDuration;
            elements.soundToggle.checked = STATE.settings.soundEnabled;
            elements.vibrationToggle.checked = STATE.settings.vibrationEnabled;
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    // Load layout preference
    const layout = localStorage.getItem('layout');
    if (layout === 'landscape') {
        STATE.isLandscape = true;
        elements.appContainer.classList.add('landscape');
    }
}

// Save settings to localStorage
function saveSettings() {
    STATE.settings.focusDuration = parseInt(elements.focusDuration.value) || 25;
    STATE.settings.shortBreakDuration = parseInt(elements.shortBreakDuration.value) || 5;
    STATE.settings.longBreakDuration = parseInt(elements.longBreakDuration.value) || 15;
    STATE.settings.soundEnabled = elements.soundToggle.checked;
    STATE.settings.vibrationEnabled = elements.vibrationToggle.checked;

    localStorage.setItem('pomodoroSettings', JSON.stringify(STATE.settings));

    // If not running, update current timer
    if (!STATE.isRunning) {
        const duration = getSessionDuration(STATE.sessionType);
        STATE.timeLeft = duration * 60;
        STATE.totalTime = duration * 60;
        updateUI();
    }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Send notification
function sendNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const messages = {
            focus: 'Time for a break! Great work!',
            shortBreak: 'Break is over. Ready to focus?',
            longBreak: 'Long break complete. Let\'s get back to work!'
        };

        new Notification('Pomodoro Timer', {
            body: messages[STATE.sessionType] || 'Session complete!',
            icon: 'icons/android/android-launchericon-192-192.png',
            badge: 'icons/android/android-launchericon-96-96.png',
            tag: 'pomodoro-notification',
            requireInteraction: false
        });
    }
}

// Play notification sound
function playNotification() {
    if (!STATE.settings.soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.warn('Audio notification failed:', e);
    }
}

// ============================================
// WAKE LOCK API
// ============================================

let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator && STATE.sessionType === 'focus') {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        } catch (err) {
            console.error('Wake Lock failed:', err);
        }
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
        } catch (err) {
            console.error('Wake Lock release failed:', err);
        }
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Control buttons
elements.startBtn.addEventListener('click', startTimer);
elements.pauseBtn.addEventListener('click', pauseTimer);
elements.resetBtn.addEventListener('click', resetTimer);

// Session toggle
elements.focusBtn.addEventListener('click', switchToFocus);
elements.restBtn.addEventListener('click', switchToRest);

// Layout toggle
elements.layoutToggle.addEventListener('click', toggleLayout);

// Settings
elements.settingsToggle.addEventListener('click', openSettings);
elements.closeSettings.addEventListener('click', closeSettings);

// Settings inputs
elements.focusDuration.addEventListener('change', saveSettings);
elements.shortBreakDuration.addEventListener('change', saveSettings);
elements.longBreakDuration.addEventListener('change', saveSettings);
elements.soundToggle.addEventListener('change', saveSettings);
elements.vibrationToggle.addEventListener('change', saveSettings);

// Close settings when clicking outside
elements.settingsPanel.addEventListener('click', (e) => {
    if (e.target === elements.settingsPanel) {
        closeSettings();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT') return;

    switch(e.key.toLowerCase()) {
        case ' ':
        case 'enter':
            e.preventDefault();
            if (STATE.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
            break;
        case 'r':
            e.preventDefault();
            resetTimer();
            break;
        case 'l':
            e.preventDefault();
            toggleLayout();
            break;
        case 'escape':
            closeSettings();
            break;
    }
});

// ============================================
// PWA FUNCTIONS
// ============================================

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && STATE.isRunning) {
        updateDocumentTitle();
        updateUI();
    }
});

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Load saved settings
    loadSettings();

    // Initialize UI
    updateSessionToggle();
    updateUI();

    // Request notification permission after a short delay
    setTimeout(requestNotificationPermission, 2000);

    console.log('Pomodoro Timer initialized');
}

// Start the app
init();
