const WebSocket = require("ws");
const { spawn } = require("child_process");
<<<<<<< HEAD
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

// Read OpenAI API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;
=======
const { Configuration, OpenAIApi } = require("openai");

// Configure OpenAI API
const configuration = new Configuration({
    apiKey: "<YOUR_OPENAI_API_KEY>", // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);
>>>>>>> d788c6a4acf1d6a9effcd71b797e7cbed6dadc40

// Start the WebSocket server
const wss = new WebSocket.Server({ port: 6789 });

// Spawn the Python script
const pythonProcess = spawn("python", ["src/model/model.py"]);

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
        console.log(`Received transcript: ${message}`);

        try {
            // Step 1: Summarize the transcript using OpenAI API
            console.log("Calling OpenAI API for summarization...");
<<<<<<< HEAD
            const endpoint = "https://api.openai.com/v1/chat/completions";

            const data = {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are an assistant providing summaries and brain-rot level analysis." },
                    { role: "user", content: `I will send you a transcript to a YouTube video. I want you to output a brainrot review of the video, about 3-4 sentences, describing how brainrot the video is and why you think that. Pretend someone is asking for a brainrot review. Do not summarize the video, rather, write 3-4 sentences about the brainrot level and your reasoning:\n\n${message}` },
                ],
                max_tokens: 150,
                temperature: 0.7,
            };

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            };

            const response = await axios.post(endpoint, data, { headers });
            const summary = response.data.choices[0].message.content.trim();
=======
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `I will send you a transcript to a YouTube video. I want you to output a brainrot review of the video, about 3-4 sentences, describing how brainrot the video is and why you think that. Pretend someone is asking for a brainrot review. Do not summarize the video, rather, write 3-4 sentences about the brainrot level and your reasoning:\n\n${message}`,
                max_tokens: 150,
                temperature: 0.7,
            });

            const summary = completion.data.choices[0].text.trim();
>>>>>>> d788c6a4acf1d6a9effcd71b797e7cbed6dadc40
            console.log(`Summary: ${summary}`);

            // Step 2: Send the summary to the Python model
            console.log("Sending summary to Python model...");
            pythonProcess.stdin.write(`${summary}\n`);

            // Step 3: Handle Python model's output and send it back to the client
            pythonProcess.stdout.once("data", (data) => {
                const modelOutput = data.toString().trim();
                console.log(`Python Model Output: ${modelOutput}`);
                ws.send(modelOutput); // Send the final output to the client
            });
<<<<<<< HEAD
=======

>>>>>>> d788c6a4acf1d6a9effcd71b797e7cbed6dadc40
        } catch (error) {
            console.error("Error in processing:", error);
            ws.send("Error processing the transcript. Please try again.");
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

<<<<<<< HEAD
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
});

// Handle Python script errors
pythonProcess.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
});

pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}`);
=======
    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python script exited with code ${code}`);
    });
>>>>>>> d788c6a4acf1d6a9effcd71b797e7cbed6dadc40
});
