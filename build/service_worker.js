chrome.runtime.onMessage.addListener((message, _) => {
    if (message.action === 'open_popup') {
        chrome.action.openPopup(); 
    } else if (message.action === 'store_transcript') {
        chrome.storage.local.remove('score');
        chrome.storage.local.set({
            'transcript': {
                'content': message.transcript
            }
        });
    }
});


