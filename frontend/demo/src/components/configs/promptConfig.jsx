// promptConfig.js
const promptConfig = {
    BHA: [
        {
            id: '1',
            details: '(default)',
            text: 'Prompt 1',
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
            - \“Connection ID\” - Look for a parameter that may be called something like “connection outer diameter” or something similar to that for the connection, or just try to guess based on the data. Only return a number and assume it is in inches. "Comments" - if you must give short comments then do it here.\
            Make sure you get all of the points and always only use a number for all parameters except Component Name which is a string. Always respond with all of the parameters per component even if they are empty. We want to order the json object with drill pipe at the top, so if the data shows components from the bottom up (such as a drill bit or similar as the first component) then return your response with the last component first and then go in that order.'
            },
        {
            id: '2',
            details: '(alternative 1)',
            text: 'Prompt 2',
            value: 'Please extract the following parameters from this document and return a JSON formatted structure with the data. Only return the JSON object and nothing else. The document may be a simple specification sheet or a detailed report containing tables with the relevant data. The document will be related to a Bottom Hole Assembly (BHA) used in drilling oil wells. It will consist of many components, each with unique properties and dimensions. Use the following parameter names in the JSON object:\
            - “Component Name” - Look for a parameter that may be called “description” or “name” or something similar that indicates the name of each component in the BHA.\
            - “Length” - If there is any information about the length of individual components, place that here.\
            - “Weight” - Look for a parameter that may be called “weight” or something similar.\
            - “Grade” - If there is any information about a steel property for each component named “grade” or something similar, place it here.\
            - “Body OD” - Look for a parameter that may be called “outer diameter” or something similar for the string body.\
            - “Body ID” - Look for a parameter that may be called “inner diameter” or something similar for the string body.\
            - “Connection OD” - Look for a parameter that may be called “connection outer diameter” or something similar for the connection. Only return a number and assume it is in inches.\
            - “Connection ID” - Look for a parameter that may be called “connection inner diameter” or something similar for the connection. Only return a number and assume it is in inches.\
            Please follow these additional guidelines:\
            1. Search throughout the entire document, including text, tables, and any other sections, to find the relevant data.\
            2. Ensure that all parameters are included for each component, even if some values are empty or not found.\
            3. Do not infer or make up data if it cannot be found in the document.\
            4. The JSON object should order the components with the drill pipe at the top. If the data shows components from the bottom up (e.g., a drill bit or similar as the first component), return your response with the last component first and then go in that order.\
            Example JSON structure:\
            {\
                \"Component Name\": \"Drill Pipe\",\
                \"Length\": 1500,\
                \"Weight\": 23.77,\
                \"Grade\": \"E\",\
                \"Body OD\": \"5.5\",\
                \"Body ID\": \"4.778\",\
                \"Connection OD\": \"7\",\
                \"Connection ID\": \"4\"\
            }\
            '
            },
        {
            id: '3',
            details: '(alternative 2)',
            text: 'Prompt 3',
            value: 'Please analyze this document, which pertains to a Bottom Hole Assembly (BHA) used in oil well drilling, and extract specific parameters. The document may be a brief spec sheet or an extensive report with tables. Return the data as a JSON object with the following structure:\
            - “Component Name” - The name or description of each component.\
            - “Length” - The length of each component, if available.\
            - “Weight” - The weight of each component, if available.\
            - “Grade” - The steel grade or similar property of each component, if available.\
            - “Body OD” - The outer diameter of the string body.\
            - “Body ID” - The inner diameter of the string body.\
            - “Connection OD” - The outer diameter of the connection, in inches.\
            - “Connection ID” - The inner diameter of the connection, in inches.\
            Additional instructions:\
            1. Search the entire document, including text and tables, for the relevant data.\
            2. Ensure all parameters are included for each component, even if some values are missing.\
            3. Do not infer or fabricate data if it is not explicitly found in the document.\
            4. Sort the components so that the drill pipe is at the top. If the data is ordered from the bottom up, reverse the order so that the last component in the document appears first in the JSON.\
            '
            }
    ],
    POREPRESSURE: [
        {
            id: '4',
            details: '(default)',
            text: 'Prompt 4',
            value: "You will help extracting information about Pore Pressure tables from my customers documents. My customers are drilling engineers who need to populate a table in my app, and you will help them extract information about the pore pressure. It will come in the form of a table.\
            You need to extract this data from documents and return a valid json format with this data so we can use your response to populate a table.\
            The json structure needs to be strictly formatted as follows for each component\
            [\
              {\
                \'Depth\': ,\
                \'PorePressureGradient: ,\
                \'PorePressure: ,\
              }\
            ]\
            Depth: This is the depth of the point of interest, usually in meters or feet\
            PorePressureGradient: This is the Pore Pressure converted to a density value, usually in sg (specific gravity) or ppg.\
            PorePressure: This is the absolute pressure of the pore pressure at the particular depth.\
            Do not make up data. If you cannot find a pore pressure gradient or pore pressure value at a particular depth, just ignore it. \
            If you can find only one parameter in addition to depth, then you have to calculate the other. Here is how you do it:\
            If you find pore pressure gradient but no pore pressure, use the following calculation to find the pore pressure:\
            Pore Pressure = PorePressureGradient * 0.0981 * Depth\
            This will give the pore pressure in bar, assuming pore pressure gradient is in sg.\
            Equally, if you can find the pore pressure but not the pore pressure gradient, use the following calculation to find it:\
            Pore Pressure Gradient = Pore Pressure / (0.0981 * Depth)\
            This will give your Pore Pressure gradient in sg assuming your pore pressure is in bar.\
            Only ever return a strictly formatted JSON object as we will use your response to populate a table. Therefore never add any characters or sentences outside of the json structure.\
            "
        },
        {
            id: '5',
            details: '(alternative 1)',
            text: 'Prompt 5',
            value: 'Please extract the following parameters from this document and return a JSON formatted structure with the data...'
        },
        {
            id: '6',
            details: '(alternative 2)',
            text: 'Prompt 6',
            value: 'Please analyze this document, which pertains to a Bottom Hole Assembly (BHA) used in oil well drilling, and extract specific parameters...'
        }
    ]
};

export default promptConfig;
