import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import axios from "axios";
import "./App.css";

const openaiKey = process.env.OPENAI_API_KEY;
const testReview = 'This video about hiking essentials highlights useful gear while sharing funny mishaps from past trips. The host’s laid-back style makes the information approachable without losing its utility. It’s perfect for those new to outdoor adventures.'
function App() {
    const [percent, setPercent] = useState(0);
    const [pyodide, setPyodide] = useState(null);
    // Load Pyodide and Transcript Checking when the app initializes
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
            chrome.storage.local.get(['transcript', 'score']).then((result) => {
                console.log(result);
                if (result.transcript !== undefined) {
                    // Clear transcript
                    chrome.storage.local.remove('transcript');
                    generateRandomPercentage(pyodideInstance).then((score) => {
                        chrome.storage.local.set({
                            'score': score
                        });
                    })
                } else if (result.score !== undefined) { // Load existing score
                    setPercent(result.score);
                }
            });
        });
    }, []);

    const processTranscript = async (pyodideInstance, transcript) => {
        // Python code as a string
        await pyodideInstance.loadPackage("joblib")
        const pythonCode = `
import joblib
vectorizer = joblib.load("src/model/vectorizer.pkl")
model = joblib.load("src/model/model.pkl")
# Load vectorizer and model
# Transform input and predict percentage
transformed_input = vectorizer.transform(["${transcript}"])
predicted_label = model.predict(transformed_input)[0]
percentage = predicted_label * 10
percentage
        `;

        // Execute Python code in Pyodide
        const result = await pyodideInstance.runPythonAsync(pythonCode);

        // Update the UI with the computed percentage
        setPercent(result);
        console.log("Python execution result:", result);
        return result;
    };

    const generateBrainRotPercent = async (transcript, pyodideInstance) => {
        console.log("Calling OpenAI API...");
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a summarization assistant." },
                    { role: "user", content: `Summarize: ${transcript}` },
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

        if (summary) {
            processTranscript(summary, pyodideInstance);
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

    // replace generateRandomPercentage with generateBrainRotPercent when its done
    return (
        <div className="App">
            <PercentageDisplay percent={percent} />
            
            <button onClick={generateRandomPercentage} disabled={!pyodide}>
                {pyodide ? "Get Percent" : "Loading Pyodide..."}
            </button>
        </div>
    );
}

export default App;
