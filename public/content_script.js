const VIDEO_PATHNAME = '/watch';

function openTranscript(_mutations, observer) {
    const viewTranscriptBtn = document.querySelector('[aria-label="Show transcript"]');
    if (viewTranscriptBtn) {
        viewTranscriptBtn.click();
        if (observer) {
            observer.disconnect();
        }
    }
}

function openPopUp(mutations = null, observer = null) {
    const url = new URL(window.location.href)
    if (url.pathname === VIDEO_PATHNAME) {
        openTranscript(mutations, observer)
        chrome.runtime.sendMessage({ action: 'open_popup' });
        if (observer) {
            observer.disconnect();
        }
    }
}

function getTranscript(_mutations = null, observer = null) {
    const url = new URL(window.location.href)
    if (url.pathname === VIDEO_PATHNAME) {
        const transcript = []
        const transcriptSegmentObjs = document.querySelectorAll('.segment-text.ytd-transcript-segment-renderer');
        for (let i = 0; i < transcriptSegmentObjs.length; i++) {
            transcript.push(transcriptSegmentObjs[i].innerText);
        }
        if (transcript.length > 0) {
            closeTranscript();
            console.log(transcript.join(' '));
            if (observer) {
                observer.disconnect();
            }
        }
    }
}

function closeTranscript() {
    const closeTranscriptBtn = document.querySelector('[aria-label="Close transcript"]');
    if (closeTranscriptBtn) {
        closeTranscriptBtn.click();
    }
}

function addObserver(callback, subtree = false) {
    const observer = new MutationObserver(callback);
    observer.observe(document.body,
        { attributes: false, childList: true, subtree: subtree });
}

window.addEventListener('yt-navigate-finish', () => {
    console.log('navigate finish');
    setTimeout(() => {
        addObserver(openPopUp);
        addObserver(getTranscript, true);
    }, 1500);
});
