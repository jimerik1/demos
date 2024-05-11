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

    const prompt ='Please extract the following parameters in this document and return a json formatted structure with the data. Only return the json object and nothing else.\
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
    Make sure you get all of the points and always only use a number for all parameters except Component Name which is a string. Always respond with all of the parameters per component even if they are empty. We want to order the json object with drill pipe at the top, so if the data shows components from the bottom up (such as a drill bit or similar as the first component) then return your response with the last component first and then go in that order.';

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
        formData.append('model', selectedAI);
        formData.append('prompt', prompt);
    
        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const newData = await response.json();  // Assuming the response is JSON
                console.log(newData);  // Log the response to check its structure
                setData(newData);  // Update the state with the new data
                setPromptResponse(JSON.stringify(newData, null, 2));
            } else {
                throw new Error('Network response was not ok');
            }
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
                        { label: 'GPT 4 Turbo', value: 'gpt-4-turbo' },
                        { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo' },
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
                content: prompt,
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




        </Card>
    );
}

export default TableBHA;
