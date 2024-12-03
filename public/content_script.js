const VIDEO_PATHNAME = '/watch';
let detectedMutation = false;

// Simulate clicking the "View Transcript" button on a YouTube video. Return True on success, False otherwise.
function openTranscript() {
    const viewTranscriptBtn = document.querySelector('[aria-label="Show transcript"]');
    if (viewTranscriptBtn) {
        viewTranscriptBtn.click();
        return true;
    }
    return false;
}

// Opens the main pop up window.
function openPopUp(_mutations = null, observer = null) {
    const url = new URL(window.location.href)
    if (url.pathname === VIDEO_PATHNAME) {
        chrome.runtime.sendMessage({ action: 'open_popup' });
        if (observer) {
            observer.disconnect();
        }
    }
}

// Get the transcript of a YouTube video.
function getTranscript(_mutations = null, observer = null) {
    const url = new URL(window.location.href);
    console.log("Current URL path:", url.pathname); // Log current path

    if (!url.pathname.startsWith(VIDEO_PATHNAME)) {
        console.log("Not a valid video page. Exiting function."); // Log if not on a video page
        return false;
    }

    const transcriptSegments = document.querySelectorAll(".segment-text.ytd-transcript-segment-renderer");
    console.log("Number of transcript segments found:", transcriptSegments.length); // Log number of transcript segments

    const transcript = [];
    for (let i = 0; i < transcriptSegments.length; i++) {
        transcript.push(transcriptSegments[i].innerText);
    }

    if (transcript.length > 0) {
        closeTranscript();
        console.log("Fetched transcript:", transcript.join(" ")); // Log full transcript

        // Send transcript to the WebSocket server
        const ws = new WebSocket("ws://localhost:6789");
        ws.onopen = () => {
            const payload = JSON.stringify({ transcript: transcript.join(" ") });
            console.log("Sending payload to server:", payload); // Log payload being sent
            ws.send(payload);
            ws.close(); // Close WebSocket after sending
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error); // Log WebSocket errors
        };

        if (observer) observer.disconnect();
    } else {
        console.warn("No transcript segments found."); // Log if no transcript is found
    }
}



// Simulate clicking the "Close Transcript" button on a YouTube video.
function closeTranscript() {
    const closeTranscriptBtn = document.querySelector('[aria-label="Close transcript"]');
    if (closeTranscriptBtn) {
        closeTranscriptBtn.click();
    }
}

// Adds a MutationObserver that calls the speicifed callback.
function addObserver(callback, subtree = false) {
    const observer = new MutationObserver(callback);
    observer.observe(document.body,
        { attributes: false, childList: true, subtree: subtree });
}

// Add MutationObservers to open the popup and get the transcript. Open the transcript after a short delay to trigger the callbacks.
function addObservers() {
    addObserver(openPopUp);
    addObserver(getTranscript, true);
    setTimeout(() => {
        openTranscript();
    }, 250);
}

// Callback that sets the detectedMutation flag to false after 1 second of idle DOM.
function checkMutations() {
    detectedMutation = true;
    setTimeout(() => {
        detectedMutation = false;
    }, 1000);
}

window.addEventListener('yt-navigate-finish', () => {
    console.log('navigate finish');
    addObserver(checkMutations);
    let intervalId = setInterval(() => {
        if (!detectedMutation) {
            addObservers();
            clearInterval(intervalId);
        }
    }, 1500);
});
