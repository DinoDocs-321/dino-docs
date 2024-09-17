import './generator.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Generator = () => {
    const [schema, setSchema] = useState('');
    const [format, setFormat] = useState('json'); // Just generate JSON
    const [numSamples, setNumSamples] = useState(10);
    const [response, setResponse] = useState(null);
    const [rows, setRows] = useState([]);
    const [dataTypes, setDataTypes] = useState([]); // Store data types

    // Fetch data types from the API when the component mounts
    useEffect(() => {
        const fetchDataTypes = async () => {
            try {
                const result = await axios.get('http://127.0.0.1:8000/api/data-types/');
                setDataTypes(result.data);
            } catch (error) {
                console.error('Error fetching data types:', error);
            }
        };
        fetchDataTypes();
    }, []);

    // Function to generate the JSON schema based on the current rows
    const generateJSON = () => {
        const jsonObject = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": "Generated Schema",
            "description": "This schema was generated by the user",
            "properties": {},
            "required": []
        };
    
        rows.forEach(row => {
            if (row.keyTitle) {
                jsonObject.properties[row.keyTitle] = {
                    type: row.dataType,
                    description: row.userPrompt || '',
                    example: row.example || ''
                };
                jsonObject.required.push(row.keyTitle);  // Add the key to required if it has a title
            }
        });
    
        setSchema(JSON.stringify(jsonObject, null, 2));  // Nicely format the generated JSON
    };

    // Function to handle the form submission and send data to the backend
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Generate JSON schema before submitting
        generateJSON();

        // Prepare the data to send to the backend
        const dataToSend = {
            schema,  // Pass the generated schema
            format,  // e.g., 'json'
            num_samples: numSamples,  // Number of samples
            rows: rows.map(row => ({
                dataType: row.dataType,
                keyTitle: row.keyTitle,
                userPrompt: row.userPrompt
            }))  // Send each row's data type, key title, and user prompt
        };

        console.log('Sending data:', dataToSend);  // Optional: Log data to ensure correctness

        try {
            const result = await axios.post('http://127.0.0.1:8000/api/data-types/', dataToSend, {
                headers: {
                    'Content-Type': 'application/json'  // Ensure the content type is JSON
                }
            });
            
            // Handle the response from the server
            console.log('Response from server:', result.data);
            setResponse(result.data);  // Store the response data
        } catch (error) {
            // Handle any errors during the request
            console.error('There was an error generating the documents!', error);
        }
    };

    // Function to add a new row
    const addRow = () => {
        setRows([...rows, { dataType: '', keyTitle: '', example: '', userPrompt: '' }]);
    };

    // Function to remove a row
    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    // Handlers for input changes
    const handleDataTypeChange = (index, event) => {
        const newDataType = event.target.value;
        const newRows = [...rows];
        newRows[index].dataType = newDataType;
        setRows(newRows);
    };

    const handleKeyTitleChange = (index, event) => {
        const newKeyTitle = event.target.value;
        const newRows = [...rows];
        newRows[index].keyTitle = newKeyTitle;
        setRows(newRows);
    };

    const handleExampleChange = (index, event) => {
        const newExample = event.target.value;
        const newRows = [...rows];
        newRows[index].example = newExample;
        setRows(newRows);
    };

    const handleUserPromptChange = (index, event) => {
        const newUserPrompt = event.target.value;
        const newRows = [...rows];
        newRows[index].userPrompt = newUserPrompt;
        setRows(newRows);
    };

    return (
        <div>
            <h1>Data Generator</h1>
            <div className="table">
                <div className="header">
                    <span>Domain</span>
                    <span>Key Title</span>
                    <span>Examples</span>
                    <span>Domain Prompt Description</span>
                </div>
                {rows.map((row, index) => (
                    <div key={index} className="row">
                        <select value={row.dataType} onChange={(e) => handleDataTypeChange(index, e)}>
                            {dataTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Key Title"
                            value={row.keyTitle}
                            onChange={(e) => handleKeyTitleChange(index, e)}
                        />
                        <input
                            type="text"
                            placeholder="Example"
                            value={row.example}
                            onChange={(e) => handleExampleChange(index, e)}
                        />
                        <input
                            type="text"
                            placeholder="User Prompt"
                            value={row.userPrompt}
                            onChange={(e) => handleUserPromptChange(index, e)}
                        />
                        <button onClick={() => removeRow(index)}>Remove</button>
                    </div>
                ))}
            </div>
            <button onClick={addRow}>Add Record</button>
            <button onClick={generateJSON}>Generate Documents</button>
            <button onClick={handleSubmit}>Submit</button>
            {response && (
                <div className="response">
                    <h3>Response from Server:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default Generator;