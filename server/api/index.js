const cors = require('cors');
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const app = express();
const sendToAssistantAPI = require('./sendToAssistantAPI');
const sendToAPI = require('./sendToAPI');

require('dotenv').config();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const apiKeyOpenAI = process.env.API_KEY;
console.log(apiKeyOpenAI);

const systemPrompts = JSON.parse(fs.readFileSync('./api/systemPrompts.json', 'utf8'));

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log("Received request on /upload");
    console.log("Request body:", req.body);

    if (!req.file || !req.body.model || !req.body.prompt || !req.body.modeAI) {
        console.log("Missing required parameters");
        return res.status(400).json({ message: "File, model, prompt, and AI Mode are required." });
    }

    console.log("Sending to OpenAI:", { model: req.body.model, prompt: req.body.prompt.length + " chars" });
    console.log("AI Mode is: ", req.body.modeAI);
    
    try {
        let data;

        if (req.body.modeAI === 'normal') {
            data = await sendToAPI(req.file.buffer, req.body.prompt, req.body.model);
        } else if (req.body.modeAI === 'assistant') {
            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const { model, prompt } = req.body;
    
            const response = await sendToAssistantAPI(fileBuffer, fileName, prompt, model);
            res.json(response);

        } else if (req.body.modeAI === 'choose') {
            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];

            if (imageExtensions.includes(fileExtension)) {
                console.log("File is an image, using sendToAPI");
                data = await sendToAPI(fileBuffer, req.body.prompt, req.body.model);
            } else {
                console.log("File is not an image, using sendToAssistantAPI");
                data = await sendToAssistantAPI(fileBuffer, fileName, req.body.prompt, req.body.model);
            }
        } else {
            throw new Error("Invalid AI Mode");
        }

        res.json(data);
    } catch (error) {
        console.error("Error processing your request:", error);
        res.status(500).json({ message: "Error processing your request.", error: error.toString() });
    }
});

app.post('/ask-ai', async (req, res) => {
    console.log("Received request on /ask-ai");
    console.log("Request body:", req.body);

    const { prompt, model, index } = req.body;

    if (!prompt || !model || !index) {
        console.log("Missing required parameters");
        return res.status(400).json({ message: "Prompt, model, and index are required." });
    }

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

            messageContent = messageContent.replace(/```json|```/g, '').trim();
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
