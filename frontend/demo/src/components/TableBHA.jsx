import React, { useState, useRef, useEffect } from 'react';
import { 
    Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select, 
    Accordion, Text, ProgressBar, Menu, Modal, Dialog, TextArea 
} from '@oliasoft-open-source/react-ui-library';
import Prompts from './Prompts';

function TableBHA() {
    //OPEN AI Vector Store ID and Assistant ID. Must setup a separate one on Open AI for each table.
    const VECTOR_STORE_ID = 'vs_vjFY5WAzigvMqjLWo3WGm8rp';
    const ASSISTANT_ID = 'asst_PWDU6iDMlBEtIFPNpbiVHv0Q';
    const TABLETYPE = "BHA";

    // Variable Declarations
    const headings = [
        "Component Name", "Length", "Weight", "Grade", 
        "Body OD", "Body ID", "Connection OD", "Connection ID", "Comments"
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
            "Connection ID": "4",
            "Comments": ''
        },
        {
            "Component Name": "Casing String",
            "Length": 3615,
            "Weight": 72,
            "Grade": "L-80",
            "Body OD": "13.375",
            "Body ID": "12.347",
            "Connection OD": "0",
            "Connection ID": "4",
            "Comments": ''
        }
    ];

    const messages = [
        "Initializing upload", "Initializing upload.", "Initializing upload..", "Initializing upload...",
        "Reading payload", "Reading payload.", "Reading payload..", "Reading payload...",
        "Diving into the details", "Diving into the details.", "Diving into the details..",
        "interesting", "interesting.", "interesting..",
        "I think I have it now", "I think I have it now.", "I think I have it now..",
        "Unpacking the mysteries of the universe", "Unpacking the mysteries of the universe.", "Unpacking the mysteries of the universe..",
        "Summoning data wizards", "Summoning data wizards.", "Summoning data wizards..",
        "Converting caffeine into code", "Converting caffeine into code..", "Converting caffeine into code..",
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
        "Completing"
    ];

    const [data, setData] = useState(initialData);
    const [promptResponse, setPromptResponse] = useState("Response from LLM will be displayed here");
    const [file, setFile] = useState(null);
    const [buttonDisabled, setButtonDisabled] = useState(true); 
    const [isDragAndDrop, setIsDragAndDrop] = useState(false);
    const [fetchTime, setFetchTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState("");
    const [modeAI, setModeAI] = useState("");
    const [selectedAI, setSelectedAI] = useState(""); 
    const [selectedPrompt, setSelectedPrompt] = useState({
        id: '1',
        text: 'Prompt 1 (default)',
        value: 'Please extract the following parameters in this document and return a json formatted structure with the data...'
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalInputValue, setModalInputValue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentUnits, setCurrentUnits] = useState(units);

    const messageIntervalRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Handlers
    const toggleModal = () => setIsModalVisible(!isModalVisible);

    const handleModalInputChange = (event) => setModalInputValue(event.target.value);

    const handleModalExecute = async () => {
        if (!selectedAI) {
            alert('Please select an AI model before executing.');
            return;
        }

        setIsModalVisible(false);
        setLoading(true);
        setProgress(0);
        setCurrentMessage(messages[0]);
        startMessageInterval();
        startProgressInterval();

        const startTime = Date.now();
        try {
            const response = await fetch('http://localhost:3001/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: modalInputValue,
                    model: selectedAI,
                    index: "bha",
                    vectorStoreId: VECTOR_STORE_ID,
                    assistantId: ASSISTANT_ID
                })
            });

            if (response.ok) {
                const newData = await response.json();
                const endTime = Date.now();
                setFetchTime((endTime - startTime) / 1000);
                const filteredData = filterData(newData);
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
            clearInterval(messageIntervalRef.current);
            clearInterval(progressIntervalRef.current);
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setButtonDisabled(false);
    };

    const handleFileUpload = () => fileInputRef.current.click();

    const handleExecute = async () => {
        if (!file) {
            alert("Please upload a file first.");
            return;
        }

        const startTime = Date.now();
        setLoading(true);
        setProgress(0);
        setCurrentMessage(messages[0]);
        startMessageInterval();
        startProgressInterval();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedAI);
        formData.append('prompt', selectedPrompt.id === 'user-defined' ? modalInputValue : selectedPrompt.value);
        formData.append('modeAI', modeAI);
        formData.append('vectorStoreId', VECTOR_STORE_ID);
        formData.append('assistantId', ASSISTANT_ID);

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newData = await response.json();
                const endTime = Date.now();
                setFetchTime((endTime - startTime) / 1000);
                const filteredData = filterData(newData);
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
            clearInterval(messageIntervalRef.current);
            clearInterval(progressIntervalRef.current);
        }
    };

    const handleDragOver = (event) => event.preventDefault();

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length) {
            setFile(files[0]);
            setIsDragAndDrop(true);
            setButtonDisabled(false);
            setSelectedAI("gpt-4o");
            setModeAI("choose");
        }
    };

    const toggleAccordion = () => setIsExpanded(!isExpanded);

    const handleAIChange = (event) => setSelectedAI(event.target.value);

    const handleModeAI = (event) => setModeAI(event.target.value);

    const handleUnitChange = (unit, index) => {
        let newUnits = [...currentUnits];
        newUnits[index] = unit;
        setCurrentUnits(newUnits);
        setData(data.map(item => ({
            ...item,
            "Length": index === 0 ? convertUnit(item["Length"], "Length", unit) : item["Length"],
            "Weight": index === 1 ? convertUnit(item["Weight"], "Weight", unit) : item["Weight"]
        })));
    };

    // Functions
    const filterData = (data) => {
        return data.map(item => {
            const { "Length Unit": _, "Weight Unit": __, "Body OD Unit": ___,  ...filteredItem } = item;
            return filteredItem;
        });
    };

    const convertUnit = (value, unitType, unit) => {
        let convertedValue;
        if (unitType === "Length") {
            convertedValue = unit === "m" ? value / 3.28084 : value * 3.28084;
        } else if (unitType === "Weight") {
            convertedValue = unit === "kg/m" ? value / 1.48816 : value * 1.48816;
        } else {
            convertedValue = value;
        }
        return parseFloat(convertedValue.toFixed(2));
    };

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

    const startProgressInterval = () => {
        progressIntervalRef.current = setInterval(() => {
            setProgress(prevProgress => {
                const nextProgress = prevProgress + (100 / 50);
                if (nextProgress >= 100) {
                    clearInterval(progressIntervalRef.current);
                    return 100;
                }
                return nextProgress;
            });
        }, 500);
    };

    useEffect(() => {
        return () => {
            clearInterval(messageIntervalRef.current);
            clearInterval(progressIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (isDragAndDrop && file) {
            handleExecute();
            setIsDragAndDrop(false);
        }
    }, [file, isDragAndDrop]);

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
                            headers: [
                                {
                                    cells: headings.map((heading, index) => ({
                                        value: heading,
                                        actions: index < 2 ? [{
                                            primary: true,
                                            label: `Toggle ${heading === "Length" ? "m/ft" : "kg/m/ppf"}`,
                                            onClick: () => handleUnitChange(index)
                                        }] : undefined
                                    }))
                                },
                                {
                                    cells: [
                                        {}, // No unit for "Component Name"
                                        {
                                            native: true,
                                            onChange: (e) => handleUnitChange(e.target.value, 0),
                                            options: [
                                                { label: 'm', value: 'm' },
                                                { label: 'ft', value: 'ft' }
                                            ],
                                            type: 'Select',
                                            value: { label: currentUnits[0], value: currentUnits[0] }
                                        },
                                        {
                                            native: true,
                                            onChange: (e) => handleUnitChange(e.target.value, 1),
                                            options: [
                                                { label: 'kg/m', value: 'kg/m' },
                                                { label: 'ppf', value: 'ppf' }
                                            ],
                                            type: 'Select',
                                            value: { label: currentUnits[1], value: currentUnits[1] }
                                        },
                                        {}, // No unit for "Grade"
                                        {}, // No unit for "Body OD"
                                        {}, // No unit for "Body ID"
                                        {}, // No unit for "Connection OD"
                                        {}, // No unit for "Connection ID"
                                        {}  // No unit for "Comments"
                                    ]
                                }
                            ],
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
                        <Text>{currentMessage}</Text>
                        <ProgressBar
                            colored
                            percentage={progress}
                            width="100%"
                        />
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
                                { label: 'Claude 3', value: 'claude3', details: 'Anthropic', disabled: true },
                                { label: 'Gemini', value: 'gemini', details: 'Google', disabled: true },
                                { label: 'Llama 3', value: 'llama3', details: 'Meta', disabled: true }
                            ]}
                            placeholder="Select AI engine"
                            searchable
                            width="auto"
                        />

                        <Prompts onSelect={(prompt) => setSelectedPrompt(prompt)} value={selectedPrompt.id} tableType={TABLETYPE} />

                        <Select
                            onChange={handleModeAI}
                            value={modeAI}
                            options={[
                                { label: 'AI Mode', type: 'Heading' },
                                { label: 'Choose for me', value: 'choose', details: '(default)' },
                                { label: 'Normal', value: 'normal' },
                                { label: 'Assistant', value: 'assistant' }
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
                                content: selectedPrompt.value,
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
                            heading: 'User Defined Prompt',
                            content: (
                                <div>
                                    <TextArea value={modalInputValue} onChange={handleModalInputChange} placeholder="Enter your custom prompt here..." />
                                </div>
                            ),
                            footer: (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <Button label="Cancel" onClick={toggleModal} />
                                    <Button label="Save" onClick={() => { setSelectedPrompt({ id: 'user-defined', value: modalInputValue }); toggleModal(); }} />
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
