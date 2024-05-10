import React, { useState } from 'react';
import { Page, Heading, Button, Flex, Divider } from '@oliasoft-open-source/react-ui-library';
import ResultTable from './ResultTable';

function Main2() {
    const [number1, setNumber1] = useState('');
    const [number2, setNumber2] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        const response = await fetch('http://localhost:3001/multiply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ number1: Number(number1), number2: Number(number2) }),
        });
        const data = await response.json();
        setResult(data.result);
    };

    return (

        <Page>
        <Heading top>AI Parser for Tables</Heading>
  
        <ResultTable />
        <Divider />

        <Flex gap="var(--padding-sm)">
            <Button label="Upload File" />
            <Button
                colored
                label="Execute AI Magic"
            />
        </Flex>


        </Page>
    );
}

export default Main2;
