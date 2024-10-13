const SHORTS_PATHNAME = '/shorts';
const VIDEO_PATHNAME = '/watch';

async function openPopUp() {
    const url = new URL(window.location.href)
    if (url.pathname === SHORTS_PATHNAME || url.pathname === VIDEO_PATHNAME) {
        chrome.runtime.sendMessage({action: 'open_popup'});
    }
}

function addObserver(callback) {
    const observer = new MutationObserver(callback);
    observer.observe(document.body,
        {attributes: false, childList: true, subtree: false});
}

window.addEventListener('popstate', () => { 
    const url = window.location.href;
    console.log('Pop: ', url)
});

addObserver(openPopUp);
openPopUp();