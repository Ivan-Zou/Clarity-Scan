import React, { useState, useEffect } from 'react';

import PercentageDisplay from './components/PercentageDisplay';
import './App.css';


function App() {
    const [percent, setPercentage] = useState(0);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the WebSocket server
        const ws = new WebSocket("ws://localhost:6789");
        setSocket(ws);

        // Update the percentage when a message is received
        ws.onmessage = (event) => {
            const receivedData = event.data.trim(); // Trim any extra spaces/newlines
            const percentage = parseInt(receivedData, 10);
        
            if (!isNaN(percentage)) {
                setPercentage(percentage); // Set valid percentage
            } else {
                console.error(`Invalid data received: ${receivedData}`);
                setPercentage(0); // Fallback to 0 if invalid data
            }
        };
        
        

        // Clean up the WebSocket connection on unmount
        return () => {
            ws.close();
        };
    }, []);

    const sendInput = () => {
        if (socket) {
            const payload = { transcript: "Placeholder transcript text" }; // Example payload
            socket.send(JSON.stringify(payload)); // Send serialized JSON
        }
    };
    

    return (
        <div className="App">
            <div>
                <PercentageDisplay percent={percent}></PercentageDisplay>
                <button onClick={sendInput}>Update Percent</button>
            </div>
            
        </div>
    );
}

export default App;