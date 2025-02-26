import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import "./App.css";

function App() {
    const [percent, setPercent] = useState(0);
    const [review, setReview] = useState("N/A");
    const [title, setTitle] = useState("N/A");
    const [activeTab, setActiveTab] = useState("percentage");
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        chrome.tabs.query({active: true, lastFocusedWindow: true}).then((result) => {
            console.log(result.url);
        });
        const intervalId = setInterval(() => {
            chrome.storage.local.get(['mostRecent', 'currentURL']).then((result) => {
                console.log(result);
                if (result.currentURL === result.mostRecent.url) {
                    setTitle(result.mostRecent.title);
                    setReview(result.mostRecent.review);
                    setPercent(result.mostRecent.score);
                    setProcessing(false);
                    clearInterval(intervalId);
                } else {
                    console.log("NO MATCH");
                }
            })
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="App">
            {/* Tab Buttons */}
            <div className="tab-buttons">
                <button 
                    onClick={() => setActiveTab("percentage")} 
                    className={activeTab === "percentage" ? "active" : ""}
                >
                    Percent
                </button>
                <button 
                    onClick={() => setActiveTab("review")} 
                    className={activeTab === "review" ? "active" : ""}
                >
                    Brain-Rot Review
                </button>
            </div>
            {/* Tab Content */}
            {activeTab === "percentage" ? (
                <div>
                    <h3>Title: {title}</h3>
                    <PercentageDisplay percent={processing ? "..." : percent} />
                </div>
            ) : (
                <p>{review}</p>
            )}
        </div>
    );
}

export default App;
