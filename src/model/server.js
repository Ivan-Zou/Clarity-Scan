const WebSocket = require("ws");
const { spawn } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");

// Configure OpenAI API
const configuration = new Configuration({
    apiKey: "<YOUR_OPENAI_API_KEY>", // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);

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
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `I will send you a transcript to a YouTube video. I want you to output a brainrot review of the video, about 3-4 sentences, describing how brainrot the video is and why you think that. Pretend someone is asking for a brainrot review. Do not summarize the video, rather, write 3-4 sentences about the brainrot level and your reasoning:\n\n${message}`,
                max_tokens: 150,
                temperature: 0.7,
            });

            const summary = completion.data.choices[0].text.trim();
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

        } catch (error) {
            console.error("Error in processing:", error);
            ws.send("Error processing the transcript. Please try again.");
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python script exited with code ${code}`);
    });
});
