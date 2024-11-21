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
            const percentage = parseInt(event.data, 10);
            setPercentage(percentage);
        };

        // Clean up the WebSocket connection on unmount
        return () => {
            ws.close();
        };
    }, []);

    const sendInput = () => {
        if (socket) {
            socket.send("transcript");
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