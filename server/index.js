const cors = require('cors');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Set up memory storage to avoid saving file to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Load API key from environment variables for better security
const apiKeyOpenAI = process.env.API_KEY;
console.log(apiKeyOpenAI);

// Function to send payload to OpenAI API and parse the response
async function sendToAPI(fileBuffer, promptText, model) {
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

        const response = await axios.post('https://api.openai.com/v1/chat/completions', JSON.stringify(payload), { headers });
        
        if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
            const messageContent = response.data.choices[0].message.content;

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
    if (!req.file || !req.body.model || !req.body.prompt) {
        return res.status(400).json({ message: "File, model, and prompt are required." });
    }

    try {
        const data = await sendToAPI(req.file.buffer, req.body.prompt, req.body.model);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error processing your request.", error: error.toString() });
    }
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
