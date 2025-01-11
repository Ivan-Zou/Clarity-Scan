// import React, { useState, useEffect } from "react";
// import PercentageDisplay from "./components/PercentageDisplay";
// import "./App.css";

// function App() {
//     const [percent, setPercent] = useState(0);
//     const [socket, setSocket] = useState(null);

//     const connectWebSocket = () => {
//         const ws = new WebSocket("ws://localhost:6789");
//         console.log("Attempting WebSocket connection...");

//         ws.onopen = () => {
//             console.log("WebSocket connection established");
//             setSocket(ws);
//         };

//         ws.onmessage = (event) => {
//             console.log("Message received from server:", event.data);
//             const parsedData = parseInt(event.data, 10);
//             if (!isNaN(parsedData)) {
//                 setPercent(parsedData);
//             } else {
//                 console.error("Invalid data received:", event.data);
//                 setPercent(0);
//             }
//         };

//         ws.onclose = () => {
//             console.log("WebSocket connection closed. Retrying in 5 seconds...");
//             setTimeout(connectWebSocket, 5000); // Retry connection
//         };

//         ws.onerror = (error) => {
//             console.error("WebSocket error:", error);
//         };
//     };

//     useEffect(() => {
//         connectWebSocket();

//         return () => {
//             console.log("Cleaning up WebSocket connection");
//             if (socket) {
//                 socket.close();
//             }
//         };
//     }, []);

//     const sendInput = () => {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//             const message = JSON.stringify({ transcript: "test transcript" });
//             console.log("Sending message to server:", message);
//             socket.send(message);
//         } else {
//             console.error("WebSocket is not open. Cannot send message.");
//         }
//     };

//     return (
//         <div className="App">
//             <PercentageDisplay percent={percent} />
//             <button onClick={sendInput}>Update Percent</button>
//         </div>
//     );
// }

// export default App;

import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import "./App.css";
const axios = require("axios");

const openaiKey = process.env.OPENAI_API_KEY;
// if (!openaiKey) {
//     console.error("OPENAI_API_KEY is not defined in .env file");
// }

function App() {
    const [percent, setPercent] = useState(0);
    const [pyodide, setPyodide] = useState(null);

    // Load Pyodide when the app initializes
    useEffect(() => {
        const setupPyodide = async () => {
            console.log("Loading Pyodide...");
            try {
                const pyodideInstance = await window.loadPyodide({
                    indexURL: "pyodide/",
                });

                setPyodide(pyodideInstance);
                console.log(pyodideInstance);
                console.log("Pyodide loaded successfully.");
            } catch (error) {
                console.error("Error loading Pyodide:", error);
            }
        };

        setupPyodide();
    }, []);

    const processTranscript = async (transcript) => {
        if (!pyodide) {
            alert("Pyodide is not ready yet!");
            return;
        }

        try {
            console.log("Running Python code in Pyodide...");

            // Python code as a string
            const pythonCode = `
import joblib

# Load vectorizer and model
vectorizer = joblib.load("src/model/vectorizer.pkl")
model = joblib.load("src/model/model.pkl")

# Transform input and predict percentage
transformed_input = vectorizer.transform(["${transcript}"])
predicted_label = model.predict(transformed_input)[0]
percentage = predicted_label * 10
percentage
            `;

            // Execute Python code in Pyodide
            const result = await pyodide.runPythonAsync(pythonCode);

            // Update the UI with the computed percentage
            setPercent(result);
            console.log("Python execution result:", result);
        } catch (error) {
            console.error("Error running Python code in Pyodide:", error);
            setPercent(0);
        }
    };

    const generateBrainRotPercent = async () => {
        let transcript = ""; // temp transcript cause idk how to retrieve it
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
            processTranscript(summary);
        }
    };

    const generateRandomPercentage = () => {
        if (!pyodide) {
            alert("Pyodide is not ready yet!");
            return;
        }

        try {
            // Python code to generate a random number
            const code = `
import random
random.randint(1, 100)
            `;
            const result = pyodide.runPython(code);
            setPercent(result);
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
