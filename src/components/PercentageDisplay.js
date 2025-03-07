import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const getColor = (percent) => {
    let color;
    if (percent === "...") {
        color = "#808080";
    } else if (percent < 40) {
        color = "#4caf50";
    } else if (percent < 70) {
        color = "#edda32";
    } else {
        color = "#9b0202";
    }
    return color;
}

const PercentageDisplay = ({ percent }) => {
    const color = getColor(percent);
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