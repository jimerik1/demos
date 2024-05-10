import React, { useState, useRef } from 'react';
import { Table, Card, Heading, Icon, Flex, Divider, Button } from '@oliasoft-open-source/react-ui-library';

function TableBHA() {
    const headings = [
        "Component Name", "Length", "Weight", "Grade", 
        "Body OD", "Body ID", "Connection OD", "Connection ID"
    ];

    const buttonDisabled = true;
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

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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
                <Button
                    colored
                    label="Execute AI Magic"
                    onClick={handleExecute}
                />
            </Flex>

        </Card>
    );
}

export default TableBHA;
