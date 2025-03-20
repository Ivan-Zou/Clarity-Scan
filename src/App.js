import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import HistoryDisplay from "./components/HistoryDisplay";
import "./App.css";

function App() {
    const [percent, setPercent] = useState('...');
    const [review, setReview] = useState("N/A");
    const [title, setTitle] = useState("N/A");
    const [activeTab, setActiveTab] = useState("percentage");
    const [processing, setProcessing] = useState(true);
    const [data, setData] = useState(undefined);

    useEffect(() => {
        const intervalId = setInterval(() => {
            chrome.storage.local.get(['mostRecent', 'currentURL', 'scoreHistory']).then((result) => {
                if (result.currentURL !== undefined &&
                    result.mostRecent.url !== undefined &&
                    result.currentURL === result.mostRecent.url) {
                    setTitle(result.mostRecent.title);
                    setReview(result.mostRecent.review);
                    setPercent(result.mostRecent.score);
                    if (result.scoreHistory !== undefined) {
                        setData(Object.values(result.scoreHistory));
                    }
                    setProcessing(false);
                    clearInterval(intervalId);
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
                <button
                    onClick={() => setActiveTab("history")}
                    className={activeTab === "history" ? "active" : ""}
                >
                    History
                </button>
            </div>
            {/* Tab Content */}
            {activeTab === "percentage" && (
                <div>
                    <h3>Title: {title}</h3>
                    <PercentageDisplay percent={processing ? "..." : percent} />
                </div>
            )}
            {activeTab === "review" && (
                <p>{review}</p>
            )}
            {activeTab === "history" && (
                <HistoryDisplay
                    history={data}
                />
            )}
        </div>
    );
}

export default App;
