import React, { useState } from 'react';

import PercentageDisplay from './components/PercentageDisplay';
import './App.css';


function App() {
    const [percent, setPercentage] = useState(65);
    return (
        <div className="App">
            <div>
                <PercentageDisplay percent={percent}></PercentageDisplay>
            </div>
            
        </div>
    );
}

export default App;