import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const PercentageDisplay = ({percent}) => {
    var color = percent < 50 ? '#4caf50' : '#9b0202'
    return (
        <div className="circular-progress-bar-container">
            <CircularProgressbar
                value={percent}
                text={`${percent}%`}
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