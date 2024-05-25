import React, { useState, useRef } from 'react';
import { Page, Heading, Button, Flex, Divider, Tabs, Drawer, Icon } from '@oliasoft-open-source/react-ui-library';
import TableBHA from './TableBHA';
import TablePP from './TablePP';
import LibraryTable from './LibraryTable';

function Main2() {
    const [selectedTab, setSelectedTab] = useState({ label: 'Tab', value: 0 }); // Updated state


    return (

        <Page>
            <Heading top>AI Parser for Tables</Heading>
            <Tabs
                name="example"
                value={selectedTab.value}
                options={[
                    { label: 'BHA', value: 0 },
                    { label: 'Pore Pressure file', value: 1 },
                    { label: 'Connection Library (mass upload)', value: 2 }
                ]}
                onChange={(evt) => {
                    const { value, label } = evt.target; // Assuming evt.target correctly contains these
                    setSelectedTab({ value, label });
                }}
            />
            <div>
                {selectedTab.value === 0 && <TableBHA />}
                {selectedTab.value === 1 && <TablePP />}
                {selectedTab.value === 2 && <LibraryTable />}
            </div>
        </Page>
        
    );
}

export default Main2;
