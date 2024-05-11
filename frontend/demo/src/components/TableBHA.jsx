import React, { useState, useRef } from 'react';
import { Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select } from '@oliasoft-open-source/react-ui-library';

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
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedAI);  // Append the selected AI model ID to the form data
    
        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending file.');
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
                        { label: 'GPT 4 Turbo', value: 'gpt4' },
                        { label: 'GPT 3.5 Turbo', value: 'gpt3' },
                        { label: 'Claude 3', value: 'claude3' },
                        { label: 'Google Bard', value: 'bard' },
                        { label: 'LLama 3', value: 'llama3' }
                    ]}
                    placeholder="Select AI engine"
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
                content: 'Please extract the following parameters in this document and return a json formatted structure with the data. Only return the json object and nothing else.\
                The document should be something related to a Bottom Hole Assembly (BHA) used in when drilling oil wells. It will consist of many components with unique properties for each component, as well as their own dimensions, lengths etc.\
                Use the following parameter names in the json object:\
                 - “Component_name”  - Look for a parameter that may be called something like “description” \"name\" something similar to that context, basically the name of each component in the BHA.\
                - “OD” - Look for a parameter that may be called somethng like “outer diameter” or something similar to that, or just try to guess based on the data.\
                - \"ID\" - Look for a parameter that may be called somethng like “inner diameter” or something similar to that, or just try to guess based on the data.\
                Make sure you get all of the points.',
                details: undefined,
                heading: 'This is the instructions (prompt) sent to the LLM',
                icon: false,
                maxHeight: undefined,
                onClose: function Ba(){},
                type: 'Info',
                visible: true,
                withDismiss: false
                  }}
            />
                        <Message
                message={{
                content: '...',
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




        </Card>
    );
}

export default TableBHA;
