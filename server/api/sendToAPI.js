const axios = require('axios');
require('dotenv').config();

const { API_KEY } = process.env;

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
            'Authorization': `Bearer ${API_KEY}`
        };

        console.log("Making HTTP POST request to OpenAI");
        const startTime = new Date();  // Timestamp before the request

        const response = await axios.post('https://api.openai.com/v1/chat/completions', JSON.stringify(payload), { headers }); // ACTUAL REQUEST
        
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

            // Validate and format the JSON string
            if (jsonString) {
                try {
                    // Parse the JSON string into an object
                    const jsonObject = JSON.parse(jsonString);

                    console.log("Parsed JSON Object:", jsonObject); // Log the JSON object
                    return jsonObject;  // Return the JSON object to the frontend
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    return null;  // Handle JSON parsing error
                }
            } else {
                console.log("JSON string is empty after formatting.");
                return null;  // Handle empty JSON string
            }
        } else {
            console.log("No valid message content available in the response.");
            return null;  // Handle cases where no valid message content is available
        }
        
    } catch (error) {
        console.error('Error processing the response:', error);
        throw error;
    }
}

// Export the sendToAPI function
module.exports = sendToAPI;
