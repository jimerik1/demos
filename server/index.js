const cors = require('cors');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');  // Import the file system module
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Set up memory storage to avoid saving file to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Load API key from environment variables 
const apiKeyOpenAI = process.env.API_KEY;
console.log(apiKeyOpenAI);

// Load system prompts from external file (Only used for "Ask AI" feature)
const systemPrompts = JSON.parse(fs.readFileSync('./systemPrompts.json', 'utf8'));

// Function to send payload to OpenAI API and parse the response
async function sendToAPI(fileBuffer, promptText, model) {
    console.log("Preparing to send data to OpenAI API");
    try {
        const base64Image = fileBuffer.toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        const payload = {
            model: model,
            messages: [{
                role: "user",
                content: [{
                    type: "text",
                    text: promptText
                }, {
                    type: "image_url",
                    image_url: { url: imageUrl }
                }]
            }],
            max_tokens: 3000
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyOpenAI}`
        };

        console.log("Making HTTP POST request to OpenAI");
        const startTime = new Date();  // Timestamp before the request

        const response = await axios.post('https://api.openai.com/v1/chat/completions', JSON.stringify(payload), { headers }); //ACTUAL REQUEST
        
        const endTime = new Date();  // Timestamp after the response
        console.log("Received response from OpenAI");
        const responseTime = endTime - startTime;  // Calculate the response time
        console.log(`Received response from OpenAI in ${responseTime} ms`);


        if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
            const messageContent = response.data.choices[0].message.content;
            console.log("OpenAI Response:", messageContent);

            // Debug: Log the string to be parsed
            console.log("JSON String to be parsed:", messageContent);

            // Extract JSON from formatted message content
            const jsonStartIndex = messageContent.indexOf('json\n') + 'json\n'.length;
            let jsonString = messageContent.substring(jsonStartIndex);
            jsonString = jsonString.replace(/`/g, ''); // Remove backticks if any remain
            jsonString = jsonString.trim(); // Trim whitespace

            // Debug: Log the string to be parsed
            console.log("JSON String to be parsed:", jsonString);

            // Parse the JSON string into an object
            const jsonObject = JSON.parse(jsonString);

            console.log("Parsed JSON Object:", jsonObject); // Log the JSON object
            return jsonObject;  // Return the JSON object to the frontend
        } else {
            console.log("No valid message content available in the response.");
            return null;  // Handle cases where no valid message content is available
        }
        
    } catch (error) {
        console.error('Error processing the response:', error);
        throw error;
    }
}

// Endpoint to upload files and send them to the OpenAI API
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log("Received request on /upload");
    if (!req.file || !req.body.model || !req.body.prompt) {
        console.log("Missing required parameters");
        return res.status(400).json({ message: "File, model, and prompt are required." });
    }

    console.log("Sending to OpenAI:", { model: req.body.model, prompt: req.body.prompt.length + " chars" });
    try {
        const data = await sendToAPI(req.file.buffer, req.body.prompt, req.body.model);
        res.json(data);
    } catch (error) {
        console.error("Error processing your request:", error);
        res.status(500).json({ message: "Error processing your request.", error: error.toString() });
    }
});

// New endpoint to handle "Ask AI" requests
app.post('/ask-ai', async (req, res) => {
    console.log("Received request on /ask-ai");
    console.log("Request body:", req.body); // Log the request body for debugging

    const { prompt, model, index } = req.body;

    if (!prompt || !model || !index) {
        console.log("Missing required parameters");
        return res.status(400).json({ message: "Prompt, model, and index are required." });
    }

    // Get the system prompt based on the index
    const systemPrompt = systemPrompts[index] || systemPrompts["default"];

    const payload = {
        model: model,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 3000,
        temperature: 0.7
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyOpenAI}`
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });
        if (response.data.choices && response.data.choices.length > 0) {
            let messageContent = response.data.choices[0].message.content;
            console.log("OpenAI Response:", messageContent);

            // Clean the JSON response by removing markdown code fences
            messageContent = messageContent.replace(/```json|```/g, '').trim();

            // Parse the cleaned JSON string into an object
            const jsonObject = JSON.parse(messageContent);
            res.json(jsonObject);
        } else {
            res.status(500).json({ message: "No valid response from OpenAI." });
        }
    } catch (error) {
        console.error('Error processing the response:', error);
        res.status(500).json({ message: "Error processing your request.", error: error.toString() });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
