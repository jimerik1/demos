// Prompts.jsx
import React, { useState } from 'react';
import { Select, Modal, Dialog, Button, TextArea, Icon } from '@oliasoft-open-source/react-ui-library';
import promptConfig from './configs/promptConfig';

function Prompts({ onSelect, value, tableType }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [userPrompt, setUserPrompt] = useState('');

    const prompts = promptConfig[tableType] || [];

    const handleChange = (e) => {
        const selectedOption = prompts.find(p => p.id === e.target.value);
        if (selectedOption.id === 'user-defined') {
            setModalVisible(true); // Open the modal if User Defined is selected
        } else {
            onSelect(selectedOption);
        }
    };

    const handleConfirm = () => {
        onSelect({ ...prompts.find(p => p.id === 'user-defined'), value: userPrompt });
        setModalVisible(false); // Close the modal and pass the user defined prompt
    };

    return (
        <>
            <Select
                onChange={handleChange}
                value={value}
                options={prompts.map(p => ({ label: p.text, value: p.id, details: p.details, icon: p.icon }))}
                placeholder="Choose your prompt"
                searchable
                width="auto"
            />

            {isModalVisible && (
                <Modal visible={isModalVisible} centered onEscape={() => setModalVisible(false)}>
                    <Dialog dialog={{
                        onClose: () => setModalVisible(false),
                        heading: 'Define Your Own Prompt',
                        content: (
                            <TextArea
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                placeholder="Type your prompt here..."
                            />
                        ),
                        footer: (
                            <>
                                <Button label="Confirm" onClick={handleConfirm} />
                                <Button label="Cancel" onClick={() => setModalVisible(false)} />
                            </>
                        )
                    }} />
                </Modal>
            )}
        </>
    );
}

export default Prompts;
