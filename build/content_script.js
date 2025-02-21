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
async function getTranscript(_mutations = null, observer = null) {
    const transcriptSegments = document.querySelectorAll(".segment-text.ytd-transcript-segment-renderer");
    const transcript = [];
    for (let i = 0; i < transcriptSegments.length; i++) {
        transcript.push(transcriptSegments[i].innerText);
    }

    if (transcript.length > 0) {
        closeTranscript();

        chrome.runtime.sendMessage({
            "action": "scan_transcript",
            "url": window.location.href,
            "title": document.title.replace("- YouTube", ""),
            "transcript": transcript.join(" ").replaceAll("\"", "")
        });
        if (observer) observer.disconnect();
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
function addObserver(callback, subtree = true) {
    const observer = new MutationObserver(callback);
    observer.observe(document.body,
        { attributes: false, childList: true, subtree: subtree });
}

// Add MutationObservers to open the popup and get the transcript. Open the transcript after a short delay to trigger the callbacks.
function addObservers() {
    addObserver(openPopUp);
    addObserver(getTranscript);
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
    addObserver(checkMutations);
    let intervalId = setInterval(() => {
        if (!detectedMutation) {
            addObservers();
            clearInterval(intervalId);
        }
    }, 1500);
});
