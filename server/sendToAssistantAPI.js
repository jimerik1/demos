const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const { API_KEY } = process.env;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollRunStatus(threadId, runId) {
    const maxAttempts = 30;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const runStatusResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
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
        const stepsResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Run steps response:', JSON.stringify(stepsResponse.data, null, 2));

        const messageCreationStep = stepsResponse.data.data.find(step => step.type === 'message_creation');

        if (!messageCreationStep) {
            throw new Error('No message creation step found in the run');
        }

        const messageId = messageCreationStep.step_details.message_creation.message_id;

        const messageResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json',
                },
            }
        );

        const finalMessage = messageResponse.data;
        console.log('Final message object:', JSON.stringify(finalMessage, null, 2));
        return finalMessage.content;
    } catch (error) {
        console.error('Error retrieving final message:', error);
        throw error;
    }
}

async function listVectorStores() {
    try {
        const vectorStoresResponse = await axios.get(
            'https://api.openai.com/v1/vector_stores',
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2',
                },
            }
        );
        console.log("Available vector stores:", JSON.stringify(vectorStoresResponse.data, null, 2));
    } catch (error) {
        console.error('Error listing vector stores:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function attachFileToVectorStore(fileId, vectorStoreId, retries = 3) {
    try {
        await axios.post(
            `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
            { file_id: fileId },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2',
                },
            }
        );
        console.log("File added to vector store");
    } catch (error) {
        console.error('Error attaching file to vector store:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }

        if (retries > 0) {
            console.log(`Retrying to attach file to vector store... (${retries} retries left)`);
            await delay(2000);
            await attachFileToVectorStore(fileId, vectorStoreId, retries - 1);
        } else {
            throw new Error('Failed to attach file to vector store after multiple attempts');
        }
    }
}

async function deleteFile(fileId) {
    try {
        await axios.delete(
            `https://api.openai.com/v1/files/${fileId}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`File ${fileId} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function sendToAssistantAPI(fileBuffer, fileName, promptText, model) {
    console.log("sendToAssistantAPI triggered");

    let fileId;
    try {
        await listVectorStores();

        const form = new FormData();
        form.append('file', fileBuffer, fileName);
        form.append('purpose', 'assistants');

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
        fileId = fileUploadResponse.data.id;
        console.log("File uploaded, file ID:", fileId);

        const existingVectorStoreId = 'vs_vjFY5WAzigvMqjLWo3WGm8rp';
        const existingAssistantId = 'asst_rvd8F1pWd5uuEymT9ZuLIGds';

        await attachFileToVectorStore(fileId, existingVectorStoreId);

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
                tool_resources: {
                    file_search: {
                        vector_store_ids: [existingVectorStoreId],
                    },
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json',
                },
            }
        );
        const threadId = threadResponse.data.id;
        console.log("Thread created, thread ID:", threadId);

        const runResponse = await axios.post(
            `https://api.openai.com/v1/threads/${threadId}/runs`,
            {
                assistant_id: existingAssistantId,
                model: model,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json',
                },
            }
        );

        const runId = runResponse.data.id;
        console.log("Run created:", runResponse.data);

        await pollRunStatus(threadId, runId);

        const finalMessageContent = await retrieveFinalMessage(threadId, runId);
        console.log("Final message content:", finalMessageContent);

        if (Array.isArray(finalMessageContent) && finalMessageContent.length > 0 && finalMessageContent[0].type === 'text') {
            const messageText = finalMessageContent[0].text.value;
            const jsonStartIndex = messageText.indexOf('json\n') + 'json\n'.length;
            let jsonString = messageText.substring(jsonStartIndex);
            jsonString = jsonString.replace(/`/g, '');
            jsonString = jsonString.trim();

            console.log("JSON String to be parsed:", jsonString);

            const jsonObject = JSON.parse(jsonString);

            console.log("Parsed JSON Object:", jsonObject);
            return jsonObject;
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
    } finally {
        if (fileId) {
            await deleteFile(fileId);
        }
    }
}

module.exports = sendToAssistantAPI;
