import React, { useState, useRef, useEffect } from 'react';
import { Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select, Accordion } from '@oliasoft-open-source/react-ui-library';
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

    //Set constants
    const [loading, setLoading] = useState(false);
    const [promptResponse, setPromptResponse] = useState("Response from LLM will be displayed here");
    const [file, setFile] = useState(null);
    const [buttonDisabled, setButtonDisabled] = useState(true); // Initializing buttonDisabled as a state variable

        // Adding state for storing the selected AI engine
    const [selectedAI, setSelectedAI] = useState("");

    // Modify the Select component's onChange handler to update the selectedAI state
    const handleAIChange = (event) => {
        setSelectedAI(event.target.value);
    };

    // Example function that uses the selectedAI state
    const executeWithAI = () => {
        console.log("Selected AI engine:", selectedAI);
        // You can now use selectedAI as an input to any function
    };
    const [selectedPrompt, setSelectedPrompt] = useState({
        id: '1',
        text: 'Prompt 1 (less specified)',
        value: 'Your first prompt text here...'
    });

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
    
        setLoading(true); // Show spinner and start status text changes
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedAI);
        formData.append('prompt', selectedPrompt.value); // Use the selected prompt value
    
        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const newData = await response.json();  // Assuming the response is JSON
                console.log(newData);  // Log the response to check its structure

            // Normalize data if it comes in a nested structure
            if (newData.components) {
                newData = newData.components;
            }


                setData(newData);  // Update the state with the new data
                setPromptResponse(JSON.stringify(newData, null, 2));
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending file.');
        } finally {
            setLoading(false); // Hide spinner
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

    const [isExpanded, setIsExpanded] = useState(false);
    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
      };
    

    return (
        <Card heading={<Heading>Example Table: BHA</Heading>}>
            <div style={{ position: 'relative' }}>
                <Icon name="upload" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer', position: 'absolute', right: '20px', top: '5px' }} />
                <input type="file" ref={fileInputRef} onChange={(e) => console.log("File uploaded:", e.target.files[0])} style={{ display: 'none' }} />
            </div>
            <Table
                table={{
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
            />

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
                onClose: function Ba(){},
                type: 'Success',
                visible: true,
                withDismiss: false
                }}
            />


            </Grid>

            </Accordion>



        </Card>
    );
}

export default TableBHA;
