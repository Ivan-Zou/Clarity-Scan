const WebSocket = require("ws");
const { spawn } = require("child_process");
const axios = require("axios");
require("dotenv").config();

const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
    console.error("OPENAI_API_KEY is not defined in .env file");
    process.exit(1);
}

const wss = new WebSocket.Server({ port: 6789 });
console.log("WebSocket server started on ws://localhost:6789");

let latestOutput = null; // Buffer for latest output

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Send buffered output to newly connected client
    if (latestOutput) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(latestOutput);
            console.log("Sent buffered output to client:", latestOutput);
            latestOutput = null; // Clear buffer after sending
        }
    }

    ws.on("message", async (message) => {
        console.log(`Received message from client: ${message}`);
        let parsedMessage;

        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            console.error("Invalid JSON format");
            ws.send("Error: Invalid JSON format.");
            return;
        }

        const { transcript } = parsedMessage;
        if (!transcript) {
            ws.send("Error: Missing transcript data.");
            return;
        }

        try {
            console.log("Calling OpenAI API...");
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a summarization assistant." },
                        { role: "user", content: `Summarize: ${transcript}` },
                    ],
                    max_tokens: 100,
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${openaiKey}`,
                    },
                }
            );

            const summary = response.data.choices[0].message.content.trim();
            console.log("Summary:", summary);

            const pythonProcess = spawn("python", ["src/model/model.py"]);
            pythonProcess.stdin.write(summary + "\n");
            pythonProcess.stdin.end();

            pythonProcess.stdout.on("data", (data) => {
                const output = data.toString().trim();
                console.log("Python model output:", output);

                latestOutput = output; // Update buffer with latest output

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(output);
                    console.log("Output sent to client:", output);
                    latestOutput = null; // Clear buffer after successful send
                } else {
                    console.warn("Client disconnected. Storing output in buffer.");
                }
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error("Python error:", data.toString());
            });

            pythonProcess.on("close", (code) => {
                console.log(`Python process exited with code ${code}`);
            });
        } catch (error) {
            console.error("Error during processing:", error.message || error);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send("Error processing the transcript.");
            }
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});
