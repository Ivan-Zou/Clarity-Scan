import React, { useState, useEffect } from 'react';

import PercentageDisplay from './components/PercentageDisplay';
import './App.css';


function App() {
    const [percent, setPercentage] = useState(0);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = new WebSocket('ws://localhost:6789');

        // Update the percentage when a message is received
        socket.onmessage = (event) => {
            const percentage = parseInt(event.data, 10);
            setPercentage(percentage);
        };

        // Clean up the WebSocket connection on unmount
        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="App">
            <div>
                <PercentageDisplay percent={percent}></PercentageDisplay>
            </div>
            
        </div>
    );
}

export default App;