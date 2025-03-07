const WEBHOOK_URL = 'http://34.238.36.52/api/review'

chrome.runtime.onMessage.addListener((message, _) => {
    if (message.action === 'open_popup') {
        chrome.action.openPopup(); 
    } else if (message.action === 'scan_transcript') {
        // Check if result has been cached
        chrome.storage.local.set({"currentURL": message.url});
        chrome.storage.local.get(['scoreHistory']).then((result) => {
            let history = result.scoreHistory;
            if (history === undefined) {
                history = {};
            }
            let scoreObject = history[message.url];
            if (scoreObject !== undefined) {
                chrome.storage.local.set({'mostRecent': scoreObject});
            } else {
                fetch(WEBHOOK_URL, {
                    method: "POST",
                    body: JSON.stringify({"content": message.transcript}),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    scoreObject = {
                        'url': message.url,
                        'transcript': message.transcript,
                        'title': message.title,
                        'review': "N/A",
                        'score': 0
                    };
                    if (!response.ok) {
                        chrome.storage.local.set({"mostRecent": scoreObject});
                    } else {
                        response.json().then((data) => {
                            scoreObject['review'] = data.review;
                            scoreObject['score'] = data.score;
                            history[message.url] = scoreObject;
                            chrome.storage.local.set({"mostRecent": scoreObject, "scoreHistory": history});
                        });
                    }
                });
            }
        });
    }
});


