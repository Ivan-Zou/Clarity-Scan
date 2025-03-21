import React, { useState } from "react";
import Stack from '@mui/material/Stack';
import { PieChart } from "@mui/x-charts";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ListItemText from '@mui/material/ListItemText';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

const HistoryDisplay = ({ history }) => {
    const [scoreRange, setScoreRange] = useState([0, 100]);
    const [search, setSearch] = useState('');

    // Use three arrays to store the videos by their brain rot scale
    let low = 0;
    let medium = 0;
    let high = 0;
    if (history !== undefined) {
        for (const scoreObj of history) {
            if (scoreObj.score < 40) {
                low++;
            } else if (scoreObj.score < 70) {
                medium++;
            } else {
                high++;
            }
        }
    }
    let filtered = history !== undefined ? (history.filter((scoreObj) => (search === '' || scoreObj.title.toLowerCase().includes(search)) && 
                                                 scoreObj.score >= scoreRange[0] && 
                                                 scoreObj.score <= scoreRange[1])) : history;

    return (
        <div className="history-display-container">
            {history === undefined ?
                (<Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <h2>No History</h2>
                </Stack>) :
                (<Stack
                    direction="column"
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    spacing={2}
                >
                    <Stack
                        direction="column"
                        sx={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        spacing={1}
                    >
                        <h2>Score Chart</h2>
                        <PieChart
                            height={165}
                            width={165}
                            series={[{
                                data: [
                                    { id: 0, value: low, label: "Low", color: "#4caf50" },
                                    { id: 1, value: medium, label: "Med", color: "#edda32" },
                                    { id: 2, value: high, label: "High", color: "#9b0202" }
                                ],
                                innerRadius: 30,
                                outerRadius: 80,
                                paddingAngle: 3,
                            }]}
                            margin={{ right: 0 }}
                            slotProps={{
                                legend: { hidden: true }
                            }}
                            onItemClick={(e, d) => {
                                if (d.dataIndex === 0) {
                                    setScoreRange([0, 39]);
                                } else if (d.dataIndex === 1) {
                                    setScoreRange([40, 69]);
                                } else {
                                    setScoreRange([70, 100]);
                                }
                            }}
                        />
                        <h2>History</h2>
                        <Box
                            sx={{ display: 'flex', width: "90%", maxWidth: "250px" }}
                            spacing={1}
                        >
                            <TextField
                                label="Search..."
                                onChange={(e) => {
                                    setSearch(e.target.value.toLowerCase());
                                }}
                                size="small"
                                sx={{
                                    alignSelf: 'flex-start',
                                    paddingRight: '20px',
                                    flexGrow: 1,
                                    fontSize: "0.9rem",
                                }}
                            />
                            <Box
                                sx={{ alignSelf: 'flex-end', width: "90%", maxWidth: "250px"  }}
                            >
                                <Typography
                                    sx={{ fontSize: "0.9rem", color: "#555", marginBottom: "3px" }}
                                >Score</Typography>
                                <Slider
                                    value={scoreRange}
                                    onChange={(e, newValue) => setScoreRange(newValue)}
                                    valueLabelDisplay="auto"
                                    size="small"
                                    step={10}
                                    min={0}
                                    max={100}
                                />
                            </Box>
                        </Box>
                        <List sx={{ width: "100%", maxWidth: "250px", padding: "5px 0" }}>
                            {filtered !== undefined ? filtered.map((scoreObj) => (
                                <ListItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        chrome.tabs.create({url: scoreObj.url})
                                    }}
                                    sx={{
                                        padding: "5px 10px",
                                        borderBottom: "1px solid #ddd",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5",
                                        },
                                    }}                                    
                                >
                                    <ListItemText 
                                        primary={scoreObj.title} 
                                        secondary={`Score: ${scoreObj.score}%`}
                                        sx={{
                                            "& .MuiListItemText-primary": {
                                                fontSize: "0.9rem",
                                                fontWeight: 500,
                                            },
                                            "& .MuiListItemText-secondary": {
                                                fontSize: "0.8rem",
                                                color: "#777",
                                            },
                                        }} 
                                        />
                                </ListItem>
                            )) : (<></>)}
                        </List>
                    </Stack>


                </Stack>)
            }
        </div>
    )
}

export default HistoryDisplay;