import React, { useState, useRef } from 'react';
import { Table, Card, Heading, Icon } from '@oliasoft-open-source/react-ui-library'; // Ensure Icon is correctly imported

function ResultTable() {
    const headings = ['Section', 'Width', 'Height'];
    let units = ['', 'm', 'm'];
    let initialData = [...Array(10).keys()].map((c, i) => [i, i * 2, i * 2]);

    const [data, setData] = useState(initialData);
    const [unitStates, setUnitStates] = useState(units);
    const fileInputRef = useRef(null);

    const convertUnit = (fromUnit, toUnit, value) => {
        return fromUnit === 'm' && toUnit === 'ft' ? value * 3.28084 :
               fromUnit === 'ft' && toUnit === 'm' ? value / 3.28084 : value;
    };

    const handleAddRow = () => {
        const newData = [...data, ['', '', '']];
        setData(newData);
    };

    const handleDeleteRow = (index) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
    };

    const handleChangeValue = (event, rowIndex, columnIndex) => {
        const newData = data.map((row, idx) => {
            if (idx === rowIndex) {
                const newRow = [...row];
                newRow[columnIndex] = event.target.value;
                return newRow;
            }
            return row;
        });
        setData(newData);
    };

    const handleChangeUnit = (event, columnIndex) => {
        const newUnits = [...unitStates];
        const newData = data.map(row => {
            const newValue = convertUnit(newUnits[columnIndex], event.target.value, row[columnIndex]);
            row[columnIndex] = newValue;
            return row;
        });
        newUnits[columnIndex] = event.target.value;
        setUnitStates(newUnits);
        setData(newData);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log("File uploaded:", file);
        // Process the file as needed
    };

    return (
        <Card heading={<Heading>Example Table: BHA</Heading>}>
            <div style={{ position: 'relative' }}>
                <Icon name="arrow up" onClick={handleUploadClick} style={{ cursor: 'pointer', position: 'absolute', right: '20px', top: '5px' }} />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
            <Table
                table={{
                    headers: [{
                        cells: headings.map((heading, index) => ({
                            value: heading,
                            actions: index === 0 ? [{
                                primary: true,
                                label: 'Add',
                                icon: 'add',
                                onClick: handleAddRow
                            }] : undefined
                        }))
                    }, {
                        cells: headings.map((_, index) => index > 0 ? ({
                            options: [{ label: 'm', value: 'm' }, { label: 'ft', value: 'ft' }],
                            value: unitStates[index],
                            type: 'Select',
                            onChange: (event) => handleChangeUnit(event, index)
                        }) : {})
                    }],
                    rows: data.map((row, rowIndex) => ({
                        cells: row.map((cell, cellIndex) => ({
                            value: cell,
                            type: 'Input',
                            onChange: (event) => handleChangeValue(event, rowIndex, cellIndex)
                        })),
                        actions: [{
                            label: 'Delete',
                            icon: 'minus',
                            onClick: () => handleDeleteRow(rowIndex)
                        }]
                    }))
                }}
            />
        </Card>
    );
}

export default ResultTable;
