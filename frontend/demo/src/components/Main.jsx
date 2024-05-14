import React, { useState } from 'react';
import { Page, Heading } from '@oliasoft-open-source/react-ui-library';

function Main() {
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
        <Heading top>Multiply one number with another</Heading>
  
        <div className="middle-column">
            <input type="number" value={number1} onChange={e => setNumber1(e.target.value)} />
            <input type="number" value={number2} onChange={e => setNumber2(e.target.value)} />
            <button onClick={handleSubmit}>Multiply</button>
            {result && <p>Result: {result}</p>}


        </div>
        </Page>
    );
}

export default Main;
