// Open side panel
chrome.runtime.onMessage.addListener((message, _) => {
    if (message.action === 'open_popup') {
        chrome.action.openPopup(); 
    }
});


