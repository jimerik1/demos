import React from 'react';
import { Select } from '@oliasoft-open-source/react-ui-library';

const prompts = [
    {
        id: '1',
        text: 'Prompt 1 (less specified)',
        value: 'Your first prompt text here...'
    },
    {
        id: '2',
        text: 'Prompt 2 (more specified)',
        value: 'Your second prompt text here...'
    },
    {
        id: '3',
        text: 'Prompt 3 (most specified)',
        value: 'Please extract the following parameters in this document and return a json formatted structure with the data. Only return the json object and nothing else.\
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
        Make sure you get all of the points and always only use a number for all parameters except Component Name which is a string. Always respond with all of the parameters per component even if they are empty. We want to order the json object with drill pipe at the top, so if the data shows components from the bottom up (such as a drill bit or similar as the first component) then return your response with the last component first and then go in that order.'
    }
];

function Prompts({ onSelect, value }) {
    return (
        <Select
            onChange={(e) => onSelect(prompts.find(p => p.id === e.target.value))}
            value={value} // This ensures the select shows the current value
            options={prompts.map(p => ({ label: p.text, value: p.id }))}
            placeholder="Choose your prompt"
            searchable
            width="auto"
        />
    );

}

export default Prompts;
