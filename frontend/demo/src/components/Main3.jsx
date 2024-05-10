import React, { useState, useRef } from 'react';
import { Page, Heading, Button, Flex, Divider } from '@oliasoft-open-source/react-ui-library';
import ResultTable from './TableBHA';

function Main3() {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);  // Set the file to state
    };

    const handleFileUpload = () => {
        fileInputRef.current.click();  // Trigger the file input when button is clicked
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
            alert(data.message);  // Show the response from the server
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending file.');
        }
    };

    return (
        <Page>
            <Heading top>AI Parser for Tables</Heading>
            <ResultTable />
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
        </Page>
    );
}

export default Main3;
