const axios = require("axios");

async function testOpenAI() {
    const apiKey = ""; // Replace with your actual OpenAI API key
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const data = {
        model: "gpt-4", // Specify the GPT-4 model
        messages: [
            {
                role: "system",
                content: "You are an assistant that provides concise and accurate summaries.",
            },
            {
                role: "user",
                content: "Summarize this text: OpenAI is a company developing AI technology.",
            },
        ],
        max_tokens: 100,
    };

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
    };

    try {
        const response = await axios.post(endpoint, data, { headers });
        console.log("OpenAI GPT-4 Response:", response.data.choices[0].message.content.trim());
    } catch (error) {
        if (error.response) {
            console.error("API Error:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testOpenAI();
