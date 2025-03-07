import React from "react";
import { CircularProgress } from "@mui/material";
import Stack from '@mui/material/Stack';
import { Box } from "@mui/material";
import { PieChart } from "@mui/x-charts";

const HistoryDisplay = ({processing, history}) => {
    // Use three arrays to store the videos by their brain rot scale
    const low = [];
    const medium = [];
    const high = [];
    if (history !== undefined) {
        for (const scoreObj of history) {
            if (scoreObj.score < 40) {
                low.push(scoreObj);
            } else if (scoreObj.score < 70) {
                medium.push(scoreObj);
            } else {
                high.push(scoreObj);
            }
        }
    }
    return (
        <div className="history-display-container">
            {processing ? 
                (<Stack
                    direction="column"
                    spacing={2}
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                 >
                    <h2>Fetching History</h2>
                    <CircularProgress />
                 </Stack>) : 
                (<Stack
                    direction="column"
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                 >
                    <h2>Score Chart</h2>
                    <Box sx={{ width: '100%' }}>
                        <PieChart
                            height={300}
                            series={[{
                                data: [
                                    {id: 0, value: low.length, label: "Low Brain-rot", color: "#4caf50"},
                                    {id: 1, value: medium.length, label: "Medium Brain-rot", color: "#edda32"},
                                    {id: 2, value: high.length, label: "High Brain-rot", color: "#9b0202"}
                                ],
                                innerRadius: 70,
                            }]}
                            margin={{right: 0}}
                            slotProps={{
                                legend: {hidden: true}
                            }}
                        />
                    </Box>
                    <h2>History</h2>

                    
                </Stack>)
            }
        </div>
    )
}

export default HistoryDisplay;