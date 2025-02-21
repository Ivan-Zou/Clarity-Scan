import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import axios from "axios";
import "./App.css";

const openaiKey = '';

function App() {
    const [percent, setPercent] = useState(0);
    // const [pyodide, setPyodide] = useState(null);
    const [review, setReview] = useState("N/A");
    const [title, setTitle] = useState("N/A");
    const [activeTab, setActiveTab] = useState("percentage");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            chrome.storage.local.get(['mostRecent']).then((result) => {
                console.log(result.mostRecent);
                setTitle(result.mostRecent.title);
                setReview(result.mostRecent.review);
                setPercent(result.mostRecent.score);
            })
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);

    // Load Pyodide and Transcript Checking when the app initializes
    /*
    useEffect(() => {
        const setupPyodide = async () => {
            console.log("Loading Pyodide...");
            try {
                const pyodideInstance = await window.loadPyodide({
                    indexURL: "pyodide/",
                });
                setPyodide(pyodideInstance);
                return pyodideInstance;
            } catch (error) {
                console.error("Error loading Pyodide:", error);
            }
        };

        setupPyodide().then((pyodideInstance) => {
            setTimeout(() => {
                chrome.storage.local.get(['transcript', 'score']).then((result) => {
                console.log(result);
                if (result.transcript !== undefined) {
                    // Clear transcript
                    chrome.storage.local.remove('transcript');
                    generateBrainRotPercent(pyodideInstance, result.transcript.content).then((score) => {
                        chrome.storage.local.set({
                            'score': score
                        });
                    })
                } else if (result.score !== undefined) { // Load existing score
                    setPercent(result.score);
                }
            }, 2000)});
        });
    }, []);
    */


    const processTranscript = async (pyodideInstance, transcript) => {
        // Python code as a string
        await pyodideInstance.loadPackage("requests");
        await pyodideInstance.loadPackage("joblib");
        await pyodideInstance.loadPackage("scikit-learn");
        let t = String(transcript).replaceAll("\"", "");
        const pythonCode = `
import requests
import joblib
from io import BytesIO
import sklearn
import random
modelURI = "https://raw.githubusercontent.com/Ivan-Zou/Clarity-Scan/main/src/model/model.pkl"
vectorURI = "https://raw.githubusercontent.com/Ivan-Zou/Clarity-Scan/main/src/model/vectorizer.pkl"
model = joblib.load(BytesIO(requests.get(modelURI).content))
vectorizer = joblib.load(BytesIO(requests.get(vectorURI).content))
transformed_input = vectorizer.transform(["${t}"])
predicted_label = model.predict(transformed_input)[0]
int(predicted_label) * 10
        `;
        console.log("Running Python Code");
        // Execute Python code in Pyodide
        setProcessing(true);
        let result = pyodideInstance.runPython(pythonCode);
        console.log("Finished Running Python Code");

        // Update the UI with the computed percentage
        result = Number(result)
        console.log(result);
        setPercent(result);
        setProcessing(false);
        return result;
    };

    const generateBrainRotPercent = async (pyodideInstance, transcript) => {
        console.log("Calling OpenAI API...");
        setProcessing(true);
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system",
                        content: `A brain-rot YouTube video is one that prioritizes sensationalism, misinformation, 
                        or mindless entertainment over substance, critical thinking, or meaningful value. You will be
                        given a transcript of a YouTube video. Output a brainrot review of the video (3-4 sentences),
                        describing the level of brain-rot of the video and explain your reasoning.` },
                    { role: "user", content: transcript },
                ],
                max_tokens: 100,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openaiKey}`,
                },
            }
        );

        const summary = response.data.choices[0].message.content.trim();
        console.log("Summary:", summary);
        setReview(summary);

        if (summary) {
            processTranscript(pyodideInstance, summary);
        }
    };

    const generateRandomPercentage = async (pyodideInstance) => {
        try {
            // Python code to generate a random number
            const code = `
import random
random.randint(1, 100)
            `;
            const result = pyodideInstance.runPython(code);
            setPercent(result);
            return result;
        } catch (error) {
            console.error("Error running Python code:", error);
        }
    };

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
            {/* <h3>{pyodide ? "Pyodide Ready" : "Loading Pyodide..."}</h3> */}
        </div>
    );
}

export default App;
