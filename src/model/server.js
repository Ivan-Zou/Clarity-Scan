const WebSocket = require("ws");
const { spawn } = require("child_process");
const axios = require("axios");
require("dotenv").config();

// OpenAI Configuration
const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
    console.error("OPENAI_API_KEY is not defined in .env file");
    process.exit(1); // Exit if API key is missing
}

// Start the WebSocket server
const wss = new WebSocket.Server({ port: 6789 });
console.log("WebSocket server started on ws://localhost:6789");
console.log("Server is ready for connections!");

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
        console.log(`Received message from client: ${message}`);
        let parsedMessage;

        // Parse the received message
        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            console.error("Error processing transcript: Invalid JSON format");
            ws.send("Error: Invalid JSON format. Ensure the message is properly serialized.");
            return;
        }

        const { transcript } = parsedMessage;
        if (!transcript) {
            ws.send("Error: Transcript data is missing in the received message.");
            return;
        }

        try {
            // Step 1: Summarize the transcript using OpenAI API
            console.log("Calling OpenAI API for summarization...");
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a summarization assistant." },
                        {
                            role: "user",
                            content: `I will send you a transcript to a YouTube video. I want you to output a brainrot review of the video, about 3-4 sentences, describing how brainrot the video is and why you think that. Do not summarize the video, rather, write 3-4 sentences about the brainrot level and your reasoning: ${transcript}`,
                        },
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

            // Step 2: Send the summary to the Python model
            console.log("Sending summary to Python model...");
            const pythonProcess = spawn("python", ["src/model/model.py"]);
            pythonProcess.stdin.write(summary + "\n");
            pythonProcess.stdin.end();

            pythonProcess.stdout.on("data", (data) => {
                console.log("Python model output:", data.toString());
                ws.send(data.toString().trim()); // Send model output to the client
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error("Python error:", data.toString());
            });

            pythonProcess.on("close", (code) => {
                console.log(`Python script exited with code ${code}`);
            });
        } catch (error) {
            console.error("Error during processing:", error.message || error);
            ws.send("Error processing the transcript. Please try again.");
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

console.log("Server is ready for connections!");
