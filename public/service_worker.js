const WEBHOOK_URL = 'http://34.238.36.52/api/review'

chrome.runtime.onMessage.addListener((message, _) => {
    if (message.action === 'open_popup') {
        chrome.action.openPopup(); 
    } else if (message.action === 'scan_transcript') {
        fetch(WEBHOOK_URL, {
            method: "POST",
            body: JSON.stringify({"content": message.transcript}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                console.log('Fetch failed');
                chrome.storage.local.set({
                    "mostRecent": {
                        'url': message.url,
                        'title': message.title,
                        'transcript': message.transcript,
                        'review': "N/A",
                        'score': 0
                    }
                });
            } else {
                response.json().then((data) => {
                    console.log(data);
                    chrome.storage.local.set({
                        "mostRecent": {
                            'url': message.url,
                            'title': message.title,
                            'review': data.review,
                            'score': data.score
                        }
                    }).then(() => chrome.action.openPopup());
                })
            }
        });
    }
});


