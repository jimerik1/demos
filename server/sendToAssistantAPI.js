const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const { API_KEY } = process.env;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollRunStatus(threadId, runId) {
    const maxAttempts = 30; // Adjust as needed
    const delayMs = 2000; // 2 seconds delay between attempts

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const runStatusResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                    'Content-Type': 'application/json',
                },
            }
        );

        const runStatus = runStatusResponse.data.status;
        console.log(`Run status: ${runStatus}`);

        if (runStatus === 'completed') {
            return runStatusResponse.data;
        }

        if (runStatus === 'failed' || runStatus === 'cancelled') {
            throw new Error(`Run ${runStatus}`);
        }

        await delay(delayMs);
    }

    throw new Error('Run polling timed out');
}

async function retrieveFinalMessage(threadId, runId) {
    try {
        // List the steps of the run
        const stepsResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                    'Content-Type': 'application/json',
                },
            }
        );

        // Log the steps to understand the structure
        console.log('Run steps response:', JSON.stringify(stepsResponse.data, null, 2));

        // Find the message creation step
        const messageCreationStep = stepsResponse.data.data.find(step => step.type === 'message_creation');

        if (!messageCreationStep) {
            throw new Error('No message creation step found in the run');
        }

        const messageId = messageCreationStep.step_details.message_creation.message_id;

        // Retrieve the message content
        const messageResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                    'Content-Type': 'application/json',
                },
            }
        );

        const finalMessage = messageResponse.data;
        console.log('Final message object:', JSON.stringify(finalMessage, null, 2)); // Log the final message object
        return finalMessage.content;
    } catch (error) {
        console.error('Error retrieving final message:', error);
        throw error;
    }
}

async function sendToAssistantAPI(fileBuffer, fileName, promptText, model) {
    console.log("sendToAssistantAPI triggered");

    try {
        // Step 1: Upload the file and get the file_id
        const form = new FormData();
        form.append('file', fileBuffer, fileName);
        form.append('purpose', 'assistants'); // Set the purpose to 'assistants'

        const fileUploadResponse = await axios.post(
            'https://api.openai.com/v1/files',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    ...form.getHeaders(),
                },
            }
        );
        const fileId = fileUploadResponse.data.id;
        console.log("File uploaded, file ID:", fileId);

        // Step 2: List all vector stores to verify the existing vector store ID
        const listVectorStoresResponse = await axios.get(
            'https://api.openai.com/v1/vector_stores',
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                },
            }
        );
        const vectorStores = listVectorStoresResponse.data.data;
        console.log("Available vector stores:", vectorStores);

        // Verify the existing vector store ID
        const existingVectorStoreId = 'vs_vjFY5WAzigvMqjLWo3WGm8rp'; // Use your manually created vector store ID
        const vectorStore = vectorStores.find(store => store.id === existingVectorStoreId);
        
        if (!vectorStore) {
            console.error(`Vector store with ID ${existingVectorStoreId} not found`);
            return;
        }

        console.log("Vector store verified:", vectorStore);

        // Step 3: Add the file to the existing vector store
        await axios.post(
            `https://api.openai.com/v1/vector_stores/${existingVectorStoreId}/files`,
            {
                file_id: fileId,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                },
            }
        );
        console.log("File added to vector store");

        // Step 4: Create a new thread with the prompt and file attached
        const threadResponse = await axios.post(
            'https://api.openai.com/v1/threads',
            {
                messages: [
                    {
                        role: "user",
                        content: promptText,
                        attachments: [
                            {
                                file_id: fileId,
                                tools: [{ type: "file_search" }],
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                    'Content-Type': 'application/json',
                },
            }
        );
        const threadId = threadResponse.data.id;
        console.log("Thread created, thread ID:", threadId);

        // Step 5: Create a run on the thread with the specified assistant
        const runResponse = await axios.post(
            `https://api.openai.com/v1/threads/${threadId}/runs`,
            {
                assistant_id: "asst_rvd8F1pWd5uuEymT9ZuLIGds", // Updated assistant ID
                model: model,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2', // Set the OpenAI-Beta header
                    'Content-Type': 'application/json',
                },
            }
        );

        const runId = runResponse.data.id;
        console.log("Run created:", runResponse.data);

        // Step 6: Poll for run status until completed
        await pollRunStatus(threadId, runId);

        // Step 7: Retrieve the final message content from the thread
        const finalMessageContent = await retrieveFinalMessage(threadId, runId);
        console.log("Final message content:", finalMessageContent);

        // Step 8: Extract and format JSON content
        if (Array.isArray(finalMessageContent) && finalMessageContent.length > 0 && finalMessageContent[0].type === 'text') {
            const messageText = finalMessageContent[0].text.value;
            const jsonStartIndex = messageText.indexOf('json\n') + 'json\n'.length;
            let jsonString = messageText.substring(jsonStartIndex);
            jsonString = jsonString.replace(/`/g, ''); // Remove backticks if any remain
            jsonString = jsonString.trim(); // Trim whitespace

            // Debug: Log the string to be parsed
            console.log("JSON String to be parsed:", jsonString);

            // Parse the JSON string into an object
            const jsonObject = JSON.parse(jsonString);

            console.log("Parsed JSON Object:", jsonObject); // Log the JSON object
            return jsonObject;  // Return the JSON object to the frontend
        } else {
            console.error("Final message content is not in the expected format:", finalMessageContent);
            return finalMessageContent;
        }
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

module.exports = sendToAssistantAPI;
