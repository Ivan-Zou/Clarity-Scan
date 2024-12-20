import React, { useState, useEffect } from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import "./App.css";

function App() {
    const [percent, setPercent] = useState(0);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const ws = new WebSocket("ws://localhost:6789");
        console.log("Attempting WebSocket connection...");

        ws.onopen = () => {
            console.log("WebSocket connection established");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            console.log("Message received from server:", event.data);
            const parsedData = parseInt(event.data, 10);
            if (!isNaN(parsedData)) {
                setPercent(parsedData);
            } else {
                console.error("Invalid data received:", event.data);
                setPercent(0);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed. Retrying in 5 seconds...");
            setTimeout(connectWebSocket, 5000); // Retry connection
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            console.log("Cleaning up WebSocket connection");
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const sendInput = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ transcript: "test transcript" });
            console.log("Sending message to server:", message);
            socket.send(message);
        } else {
            console.error("WebSocket is not open. Cannot send message.");
        }
    };

    return (
        <div className="App">
            <PercentageDisplay percent={percent} />
            <button onClick={sendInput}>Update Percent</button>
        </div>
    );
}

export default App;
