// server.js
const WebSocket = require("ws");
const { spawn } = require("child_process");

// Start the WebSocket server
const wss = new WebSocket.Server({ port: 6789 });

// Spawn the Python script
const pythonProcess = spawn("python", ["src/model/model.py"]);

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected");

    // Listen for data from the Python script
    pythonProcess.stdout.on("data", (data) => {
        const percentage = data.toString().trim();
        console.log(`Sending: ${percentage}`);

        // Send the percentage to the client
        ws.send(percentage);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

// Handle Python script errors
pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
});

pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}`);
});
