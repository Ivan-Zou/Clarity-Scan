import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const PercentageDisplay = ({ percent }) => {
    console.log('Rendering PercentageDisplay with percent:', percent);
    const color = percent === "..." ? '#808080' : percent < 50 ? '#4caf50' : '#9b0202';
    return (
        <div className="circular-progress-bar-container">
            <CircularProgressbar
                value={percent || 0}
                text={percent === "..." ? "..." : `${percent}%`} 
                styles={buildStyles({
                    trailColor: '#d2d2d2',
                    pathColor: color,
                    textColor: color,
                    textSize: '36px',
                })}
            />
        </div>
    );
};

export default PercentageDisplay;