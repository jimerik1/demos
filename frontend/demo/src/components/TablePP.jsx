import React, { useState, useRef, useEffect } from 'react';
import { 
    Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select, 
    Accordion, Text, ProgressBar, Menu, Modal, Dialog, TextArea 
} from '@oliasoft-open-source/react-ui-library';
import Prompts from './Prompts';

function TablePP() {

    // OPEN AI Vector Store ID and Assistant ID. Must setup a separate one on Open AI for each table.
    const VECTOR_STORE_ID = 'vs_ZULDJZp0byAi5T8WBQ8M14a8';
    const ASSISTANT_ID = 'asst_hmOt91fA7i3KedwOkbAbwJXX';
    const TABLETYPE = "POREPRESSURE";

    // Variable Declarations
    const headings = [
        "Depth (m)", "Pore Pressure Gradient (sg)", "Pore Pressure (bar)"
    ];

    const units = ["m", "sg", "bar"]; // Default units
    const initialData = [
        {
            "Depth (m)": 1000,
            "Pore Pressure Gradient (sg)": 1.1,
            "Pore Pressure (bar)": 110
        },
        {
            "Depth (m)": 2000,
            "Pore Pressure Gradient (sg)": 1.2,
            "Pore Pressure (bar)": 240
        }
    ];

    const messages = [
        // same messages as in TableBHA
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
        id: '4',
        text: 'Prompt 4 (default)',
        value: "You will help extracting information about Pore Pressure tables from my customers documents. My customers are drilling engineers who need to populate a table in my app, and you will help them extract information about the pore pressure. It will come in the form of a table.\
        You need to extract this data from documents and return a valid json format with this data so we can use your response to populate a table.\
        The json structure needs to be strictly formatted as follows for each component\
        [\
          {\
            'Depth': ,\
            'PorePressureGradient: ,\
            'PorePressure: ,\
          }\
        ]\
        Depth: This is the depth of the point of interest, usually in meters or feet\
        PorePressureGradient: This is the Pore Pressure converted to a density value, usually in sg (specific gravity) or ppg.\
        PorePressure: This is the absolute pressure of the pore pressure at the particular depth.\
        Do not make up data. If you cannot find a pore pressure gradient or pore pressure value at a particular depth, just ignore it. \
        If you can find only one parameter in addition to depth, then you have to calculate the other. Here is how you do it:\
        If you find pore pressure gradient but no pore pressure, use the following calculation to find the pore pressure:\
        Pore Pressure = PorePressureGradient * 0.0981 * Depth\
        This will give the pore pressure in bar, assuming pore pressure gradient is in sg.\
        Equally, if you can find the pore pressure but not the pore pressure gradient, use the following calculation to find it:\
        Pore Pressure Gradient = Pore Pressure / (0.0981 * Depth)\
        This will give your Pore Pressure gradient in sg assuming your pore pressure is in bar.\
        Only ever return a strictly formatted JSON object as we will use your response to populate a table. Therefore never add any characters or sentences outside of the json structure.\
        "
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
                    index: "pp",
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
        formData.append('prompt', selectedPrompt.value);
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
            "Depth (m)": index === 0 ? convertUnit(item["Depth (m)"], "Depth", unit) : item["Depth (m)"],
            "Pore Pressure Gradient (sg)": index === 1 ? convertUnit(item["Pore Pressure Gradient (sg)"], "Pore Pressure Gradient", unit) : item["Pore Pressure Gradient (sg)"],
            "Pore Pressure (bar)": index === 2 ? convertUnit(item["Pore Pressure (bar)"], "Pore Pressure", unit) : item["Pore Pressure (bar)"]
        })));
    };

    // Functions
    const filterData = (data) => {
        return data.map(item => {
            const { Depth, PorePressureGradient, PorePressure } = item;
            return {
                "Depth (m)": Depth,
                "Pore Pressure Gradient (sg)": PorePressureGradient,
                "Pore Pressure (bar)": PorePressure
            };
        });
    };

    const convertUnit = (value, unitType, unit) => {
        let convertedValue;
        if (unitType === "Depth") {
            convertedValue = unit === "m" ? value / 3.28084 : value * 3.28084;
        } else if (unitType === "Pore Pressure Gradient") {
            convertedValue = unit === "sg" ? value / 1.19826 : value * 1.19826; // Assuming 1 sg = 1.19826 ppg
        } else if (unitType === "Pore Pressure") {
            convertedValue = unit === "bar" ? value / 14.5038 : value * 14.5038; // Assuming 1 bar = 14.5038 psi
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
            <Card heading={<Heading>Example Table: Pore Pressure</Heading>} >
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
                                        <Menu menu={{ label: 'Ask the AI', sections: [{ label: 'Ask AI to generate Pore Pressure', type: 'Option', onClick: toggleModal }, { label: 'Ask AI to fix existing Pore Pressure', type: 'Option' }], small: true, trigger: 'DropDownButton' }} />
                                }
                            ],
                            columnWidths: ['200px', '200px', '200px'],
                            headers: [
                                {
                                    cells: headings.map((heading, index) => ({
                                        value: heading,
                                        actions: [{
                                            primary: true,
                                            label: `Toggle ${heading}`,
                                            onClick: () => {
                                                const newUnit = currentUnits[index] === "m" ? "ft" : 
                                                                currentUnits[index] === "sg" ? "ppg" : 
                                                                currentUnits[index] === "bar" ? "psi" : "m";
                                                handleUnitChange(newUnit, index);
                                            }
                                        }]
                                    }))
                                },
                                {
                                    cells: [
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
                                                { label: 'sg', value: 'sg' },
                                                { label: 'ppg', value: 'ppg' }
                                            ],
                                            type: 'Select',
                                            value: { label: currentUnits[1], value: currentUnits[1] }
                                        },
                                        {
                                            native: true,
                                            onChange: (e) => handleUnitChange(e.target.value, 2),
                                            options: [
                                                { label: 'bar', value: 'bar' },
                                                { label: 'psi', value: 'psi' }
                                            ],
                                            type: 'Select',
                                            value: { label: currentUnits[2], value: currentUnits[2] }
                                        }
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
                            heading: 'Ask AI to Generate Pore Pressure',
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

export default TablePP;
