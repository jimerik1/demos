import React, { useState, useRef } from 'react';
import { Page, Heading, Button, Flex, Divider, Tabs, Drawer, Icon } from '@oliasoft-open-source/react-ui-library';
import TableBHA from './TableBHA';

function Main3() {
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
                    { label: 'Pore Pressure image', value: 2 },
                    { label: 'Trajectory', value: 3 },
                    { label: 'Connection Library', value: 4 }
                ]}
                onChange={(evt) => {
                    const { value, label } = evt.target; // Assuming evt.target correctly contains these
                    setSelectedTab({ value, label });
                }}
            />
            <div>
                {selectedTab.value === 0 && <TableBHA />}
                {selectedTab.value === 1 && <div><h3>Tab 1 Content</h3></div>}
                {selectedTab.value === 2 && <div><h3>Tab 2 Content</h3></div>}
                {selectedTab.value === 3 && <div><h3>Tab 3 Content</h3></div>}
                {selectedTab.value === 4 && <div><h3>Disabled Content</h3></div>}
            </div>
        </Page>
        
    );
}

export default Main3;
