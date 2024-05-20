import React, { useState, useRef, useEffect } from 'react';
import { Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select, Accordion, Text, ProgressBar, Menu, Modal, Dialog, TextArea } from '@oliasoft-open-source/react-ui-library';
import Prompts from './Prompts';

function TableBHA() {
    const headings = [
        "Component Name", "Length", "Weight", "Grade", 
        "Body OD", "Body ID", "Connection OD", "Connection ID"
    ];

    const units = ["m", "kg/m"]; // Default units for Length and Weight
    const initialData = [
        {
            "Component Name": "Drill Pipe",
            "Length": 1500,
            "Weight": 23.77,
            "Grade": "E",
            "Body OD": "5.5",
            "Body ID": "4.778",
            "Connection OD": "7",
            "Connection ID": "4"
        },
        {
            "Component Name": "Casing String",
            "Length": 3615,
            "Weight": 72,
            "Grade": "L-80",
            "Body OD": "13.375",
            "Body ID": "12.347",
            "Connection OD": "0",
            "Connection ID": "0"
        }
    ];

    // Filter function to remove unwanted parameters
    const filterData = (data) => {
        return data.map(item => {
            const { "Length Unit": _, "Weight Unit": __, "Body OD Unit": ___, "Comments": ____, ...filteredItem } = item;
            return filteredItem;
        });
    };

    // Set constants
    const [promptResponse, setPromptResponse] = useState("Response from LLM will be displayed here");
    const [file, setFile] = useState(null);
    const [buttonDisabled, setButtonDisabled] = useState(true); // Initializing buttonDisabled as a state variable
    const [isDragAndDrop, setIsDragAndDrop] = useState(false);

    const [fetchTime, setFetchTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState("");
    const [modeAI, setModeAI] = useState("");
    const messages = [
        "Initializing upload", "Initializing upload.", "Initializing upload..", "Initializing upload...",
        "Reading payload", "Reading payload.", "Reading payload..", "Reading payload...",
        "Diving into the details", "Diving into the details.", "Diving into the details..",
        "interesting", "interesting.", "interesting..",
        "I think I have it now", "I think I have it now.", "I think I have it now..",
        "Unpacking the mysteries of the universe", "Unpacking the mysteries of the universe.", "Unpacking the mysteries of the universe..",
        "Summoning data wizards", "Summoning data wizards.", "Summoning data wizards..",
        "Converting caffeine into code", "Converting caffeine into code.", "Converting caffeine into code..",
        "Finding Waldo", "Finding Waldo.", "Finding Waldo..",
        "Herding digital cats", "Herding digital cats.", "Herding digital cats..",
        "Charging flux capacitor", "Charging flux capacitor.", "Charging flux capacitor..",
        "Assembling Avengers", "Assembling Avengers.", "Assembling Avengers..",
        "Polishing pixels", "Polishing pixels.", "Polishing pixels..",
        "Engaging warp drive", "Engaging warp drive.", "Engaging warp drive..",
        "Reticulating splines", "Reticulating splines.", "Reticulating splines..",
        "Preparing dance moves", "Preparing dance moves.", "Preparing dance moves..",
        "Almost there", "Almost there.", "Almost there..",
        "Patience, young padawan", "Patience, young padawan.", "Patience, young padawan..",
        "Calculating the meaning of life", "Calculating the meaning of life.", "Calculating the meaning of life..",
        "Just a sec... or two", "Just a sec... or two.", "Just a sec... or two..",
        "Channeling my inner Einstein", "Channeling my inner Einstein.", "Channeling my inner Einstein..",
        "Hacking the mainframe", "Hacking the mainframe.", "Hacking the mainframe..",
        "Decoding the Matrix", "Decoding the Matrix.", "Decoding the Matrix..",
        "Loading... still loading", "Loading... still loading.", "Loading... still loading..",
        "Uploading the awesomeness", "Uploading the awesomeness.", "Uploading the awesomeness..",
        "Summoning the magic", "Summoning the magic.", "Summoning the magic..",
        "Processing data...", "Finalizing.", "Finalizing..", "Finalizing...",
        "Finalizing", "Finalizing.", "Finalizing..", "Finalizing...",
        "Finalizing.", "Finalizing..", "Finalizing...",
        "Finalizing.", "Finalizing..", "Finalizing...",
        "AI Hickups", "AI Hickups.", "AI Hickups..", "AI Hickups...",
        "AI Hickups...", "Very soon now.", "Very soon now..", "Very soon now...",
        "Very soon now.", "Very soon now..", "Very soon now...",
        "Very soon now.", "Very soon now..", "Very soon now...",
        "Very soon now.", "Very soon now..", "Very soon now...",
        "Complete"
      ];
    

    const messageIntervalRef = useRef(null);
    const progressIntervalRef = useRef(null);

    //State for modal visibility and input
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalInputValue, setModalInputValue] = useState("");

    //Toggle Modal visibility
    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    //Handle modal input change
    const handleModalInputChange = (event) => {
        setModalInputValue(event.target.value);
    };

    //Handle modal execute
    const handleModalExecute = async () => {
        if (!selectedAI) {
            alert('Please select an AI model before executing.');
            return;
        }

        console.log("Executing with input:", modalInputValue);
        setIsModalVisible(false);
        setLoading(true);
        setProgress(0);
        setCurrentMessage(messages[0]);
        startMessageInterval();
        startProgressInterval();

        const startTime = Date.now(); // Capture start time
        try {
            const response = await fetch('http://localhost:3001/ask-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: modalInputValue,
                    model: selectedAI,
                    index: "bha"  // Use the appropriate index for the system prompt
                })
            });

            if (response.ok) {
                const newData = await response.json();
                const endTime = Date.now();  // Capture end time
                setFetchTime((endTime - startTime) / 1000);  // Calculate total time in seconds
                console.log(newData);  // Log the response to check its structure

                const filteredData = filterData(newData); // Filter the data before setting state
                setData(filteredData);
                setPromptResponse(JSON.stringify(filteredData, null, 2));
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending request to AI.');
        } finally {
            setLoading(false);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup intervals when component unmounts or loading stops
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []); // Empty dependency array ensures this runs on mount and unmount only

    useEffect(() => {
        if (isDragAndDrop && file) {
            handleExecute();
            setIsDragAndDrop(false);
        }
    }, [file, isDragAndDrop]);

    // Adding state for storing the selected AI engine
    const [selectedAI, setSelectedAI] = useState(""); 

    // Modify the Select component's onChange handler to update the selectedAI state
    const handleAIChange = (event) => {
        setSelectedAI(event.target.value);
    };

    // modeAI handler
    const handleModeAI = (event) => {
        setModeAI(event.target.value);
    };

    // Example function that uses the selectedAI state
    const executeWithAI = () => {
        console.log("Selected AI engine:", selectedAI);
        // You can now use selectedAI as an input to any function
    };

    const [selectedPrompt, setSelectedPrompt] = useState({
        id: '1',
        text: 'Prompt 1 (default)',
        value: 'Please extract the following parameters in this document and return a json formatted structure with the data. Only return the json object and nothing else.\
        The document should be something related to a Bottom Hole Assembly (BHA) used in when drilling oil wells. It will consist of many components with unique properties for each component, as well as their own dimensions, lengths etc.\
        Use the following parameter names in the json object:\
         - “Component Name”  - Look for a parameter that may be called something like “description” \"name\" something similar to that context, basically the name of each component in the BHA.\
        - \"Length\" - if there is any information about the length of individual components, place that here.\
        - \"Weight\" - look for a parameter that may be called \"weight\" or something similar. \
        - \"Grade\" - If there is any information about a steel property for each component named \"grade\" or something that resembles this, then place it here.\
        - \“Body OD\” - Look for a parameter that may be called something like “outer diameter” or something similar to that for the string body, or just try to guess based on the data.\
        - \"Body ID\" - Look for a parameter that may be called something like “inner diameter” or something similar to that for the string body, or just try to guess based on the data.\
        - \“Connection OD\” - Look for a parameter that may be called something like “connection outer diameter” or something similar to that for the connection, or just try to guess based on the data. Only return a number and assume it is in inches.\
        - \“Connection ID\” - Look for a parameter that may be called something like “connection outer diameter” or something similar to that for the connection, or just try to guess based on the data. Only return a number and assume it is in inches.\
        Make sure you get all of the points and always only use a number for all parameters except Component Name which is a string. Always respond with all of the parameters per component even if they are empty. We want to order the json object with drill pipe at the top, so if the data shows components from the bottom up (such as a drill bit or similar as the first component) then return your response with the last component first and then go in that order.'
    });

    // Handling Loader (messages)
    const startMessageInterval = () => {
        let messageIndex = 0;
        messageIntervalRef.current = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length) {
                setCurrentMessage(messages[messageIndex]);
            } else {
                clearInterval(messageIntervalRef.current);
            }
        }, 300);
    };

    // Handling Loader (progressbar)
    const startProgressInterval = () => {
        progressIntervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                const nextProgress = prevProgress + (100 / 50);
                if (nextProgress >= 100) {
                    clearInterval(progressIntervalRef.current);
                    return 100; // Ensure it does not exceed 100
                }
                return nextProgress;
            });
        }, 500);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setButtonDisabled(false); // Correctly updating the state
    };

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleExecute = async () => {
        if (!file) {
            alert("Please upload a file first.");
            return;
        }

        const startTime = Date.now(); // Capture start time
        setLoading(true);
        setProgress(0);
        setCurrentMessage(messages[0]);
        startMessageInterval();
        startProgressInterval();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedAI);
        formData.append('prompt', selectedPrompt.value); // Use the selected prompt value
        formData.append('modeAI', modeAI); // Use the selected mode AI value

        try {
            const response = await fetch('http://localhost:5001/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const newData = await response.json();  // Assuming the response is JSON
                const endTime = Date.now();  // Capture end time
                setFetchTime((endTime - startTime) / 1000);  // Calculate total time in seconds
                console.log(newData);  // Log the response to check its structure

                const filteredData = filterData(newData); // Filter the data before setting state
                setData(filteredData);
                setPromptResponse(JSON.stringify(filteredData, null, 2));
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending file.');
        } finally {
            setLoading(false);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    };

    const handleExecuteAssistant = async () => {
        if (!file) {
            alert("Please upload a file first.");
            return;
        }

        const startTime = Date.now(); // Capture start time
        setLoading(true);
        setProgress(0);
        setCurrentMessage(messages[0]);
        startMessageInterval();
        startProgressInterval();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedAI);
        formData.append('prompt', selectedPrompt.value); // Use the selected prompt value

        try {
            const response = await fetch('http://localhost:3001/api/uploadAssistant', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const newData = await response.json();  // Assuming the response is JSON
                const endTime = Date.now();  // Capture end time
                setFetchTime((endTime - startTime) / 1000);  // Calculate total time in seconds
                console.log(newData);  // Log the response to check its structure

                const filteredData = filterData(newData); // Filter the data before setting state
                setData(filteredData);
                setPromptResponse(JSON.stringify(filteredData, null, 2));
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending file.');
        } finally {
            setLoading(false);
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    };

    const [data, setData] = useState(initialData);
    const [currentUnits, setCurrentUnits] = useState(units);
    const fileInputRef = useRef(null);

    // Convert units (meters to feet, kg/m to ppf, etc.)
    const convertUnit = (value, unitType) => {
        if (unitType === "Length") {
            return currentUnits[0] === "m" ? value * 3.28084 : value / 3.28084; // m to ft or vice versa
        } else if (unitType === "Weight") {
            return currentUnits[1] === "kg/m" ? value * 1.48816 : value / 1.48816; // kg/m to ppf or vice versa
        }
        return value;
    };

    const handleUnitToggle = (index) => {
        let newUnits = [...currentUnits];
        if (index === 0) { // Toggle Length units
            newUnits[0] = currentUnits[0] === "m" ? "ft" : "m";
        } else if (index === 1) { // Toggle Weight units
            newUnits[1] = currentUnits[1] === "kg/m" ? "ppf" : "kg/m";
        }
        setCurrentUnits(newUnits);
        setData(data.map(item => ({
            ...item,
            "Length": convertUnit(item["Length"], "Length"),
            "Weight": convertUnit(item["Weight"], "Weight")
        })));
    };

    // Drag and Drop Handlers
    const handleDragOver = (event) => {
        event.preventDefault(); // Necessary to allow the drop
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length) {
            setFile(files[0]);
            setIsDragAndDrop(true);
            setButtonDisabled(false);
            // Set default AI model and prompt
            setSelectedAI("gpt-4o"); // default set to 'gpt-4o'
            setModeAI("choose"); //
            setSelectedPrompt({
                id: '1',
                text: 'Prompt 1',
                details: '(most specified)',
                value: 'Please extract the following parameters in this document and return a json formatted structure with the data. Only return the json object and nothing else.\
                The document should be something related to a Bottom Hole Assembly (BHA) used in when drilling oil wells. It will consist of many components with unique properties for each component, as well as their own dimensions, lengths etc.\
                Use the following parameter names in the json object:\
                 - “Component Name”  - Look for a parameter that may be called something like “description” \"name\" something similar to that context, basically the name of each component in the BHA.\
                - \"Length\" - if there is any information about the length of individual components, place that here.\
                - \"Weight\" - look for a parameter that may be called \"weight\" or something similar. \
                - \"Grade\" - If there is any information about a steel property for each component named \"grade\" or something that resembles this, then place it here.\
                - \“Body OD\” - Look for a parameter that may be called something like “outer diameter” or something similar to that for the string body, or just try to guess based on the data.\
                - \"Body ID\" - Look for a parameter that may be called something like “inner diameter” or something similar to that for the string body, or just try to guess based on the data.\
                - \“Connection OD\” - Look for a parameter that may be called something like “connection outer diameter” or something similar to that for the connection, or just try to guess based on the data. Only return a number and assume it is in inches.\
                - \“Connection ID\” - Look for a parameter that may be called something like “connection outer diameter” or something similar to that for the connection, or just try to guess based on the data. Only return a number and assume it is in inches.\
                Make sure you get all of the points and always only use a number for all parameters except Component Name which is a string. Always respond with all of the parameters per component even if they are empty. We want to order the json object with drill pipe at the top, so if the data shows components from the bottom up (such as a drill bit or similar as the first component) then return your response with the last component first and then go in that order.'
            });
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div style={{ width: '80%' }}>
            <Card heading={<Heading>Example Table: BHA</Heading>} >
                <div style={{ position: 'relative' }}>
                    <Icon name="upload" onClick={handleFileUpload} style={{ cursor: 'pointer', position: 'absolute', right: '20px', top: '5px' }} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
                <div onDragOver={handleDragOver} onDrop={handleDrop} style={{ width: '100%' }}>
                    <Table
                        table={{
                            actions: [
                                {
                                  childComponent: 
                                    <Menu menu={{ label: 'Ask the AI', sections: [{ label: 'Ask AI to generate BHA', type: 'Option', onClick: toggleModal }, { label: 'Ask AI to fix existing BHA', type: 'Option' }], small: true, trigger: 'DropDownButton' }} />
                                }
                              ],
                          
                            columnWidths: ['200px', '100px', '100px', 'auto', '100px', '100px', '100px', '100px'],
                            headers: [{
                                cells: headings.map((heading, index) => ({
                                    value: heading,
                                    actions: index < 2 ? [{
                                        primary: true,
                                        label: `Toggle ${heading === "Length" ? "m/ft" : "kg/m/ppf"}`,
                                        onClick: () => handleUnitToggle(index)
                                    }] : undefined
                                }))
                            }],
                            rows: data.map(item => ({
                                cells: Object.values(item).map(value => ({ value }))
                            }))
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                </div>

                <div id="loading content" style={{ display: loading ? 'block' : 'none' }}>
                    <Divider />
                    <Grid columns="1fr 4fr">
                        <Text>{currentMessage}                        <ProgressBar
                            colored
                            percentage={progress}
                            width="100%"
                        /></Text>

                    </Grid>
                </div>

                <Divider />

                <Accordion
                    bordered
                    expanded={isExpanded}
                    heading={<Heading onClickHelp={() => toggleAccordion()}>Advanced</Heading>}
                >
                    <Flex gap="var(--padding-sm)">
                        <Button label="Upload File" onClick={handleFileUpload} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Select
                            onChange={handleAIChange}
                            value={selectedAI}
                            options={[
                                { label: 'Select AI Engine', type: 'Heading' },
                                { label: 'GPT 4o', value: 'gpt-4o', details: 'Open AI' },
                                { label: 'GPT 4 Turbo', value: 'gpt-4-turbo', details: 'Open AI' },
                                { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo', details: 'Open AI' },
                                { label: 'Claude 3', value: 'claude3', details: 'Anthropic' },
                                { label: 'Gemini', value: 'gemini', details: 'Google' },
                                { label: 'Llama 3', value: 'llama3', details: 'Meta' }
                            ]}
                            placeholder="Select AI engine"
                            searchable
                            width="auto"
                        />

                        <Prompts onSelect={(prompt) => setSelectedPrompt(prompt)} value={selectedPrompt.id} />

                        <Select
                            onChange={handleModeAI}
                            value={modeAI}
                            options={[
                                { label: 'AI Mode', type: 'Heading'},
                                { label: 'Choose for me', value: 'choose', details: '(default)'},
                                { label: 'Normal', value: 'normal' },
                                { label: 'Assistant', value: 'assistant' },

                            ]}
                            placeholder="Select AI Mode"
                            searchable
                            width="auto"
                        />

                        <Button
                            colored
                            disabled={buttonDisabled}
                            label="Execute AI Magic"
                            onClick={handleExecute}
                        />
                    </Flex>
                    <Divider />

                    <Grid gap>
                        <Message
                            message={{
                                content: selectedPrompt.value, // Display the currently selected prompt
                                heading: 'This is the instructions (prompt) sent to the LLM',
                                type: 'Info',
                                visible: true,
                            }}
                        />

                        <Message
                            message={{
                                content: promptResponse,
                                details: undefined,
                                heading: 'Raw response from LLM',
                                icon: false,
                                maxHeight: undefined,
                                onClose: function Ba() { },
                                type: 'Success',
                                visible: true,
                                withDismiss: false
                            }}
                        />
                        <Text>Total time for fetching response: {fetchTime} seconds</Text>
                    </Grid>
                </Accordion>

                <Modal visible={isModalVisible} centered>
                    <Dialog 
                        dialog={{
                            heading: 'Ask AI to Generate BHA',
                            content: (
                                <div>
                                    <TextArea value={modalInputValue} onChange={handleModalInputChange} placeholder="Enter your custom prompt here..." />
                                </div>
                            ),
                            footer: (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <Button label="Cancel" onClick={toggleModal} />
                                    <Button label="Execute" onClick={handleModalExecute} />
                                </div>
                            ),
                            onClose: toggleModal
                        }} 
                    />
                </Modal>

            </Card>
        </div>
    );
}

export default TableBHA;
