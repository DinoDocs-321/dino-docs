import React, { useState } from 'react';
import { BSON } from 'bson';
import { Buffer } from 'buffer';
import Form from 'react-bootstrap/Form';
import './JSONConverter.css';

const JSONConverter = () => {
    const [textFieldValue, setTextFieldValue] = useState('');
    const [conversionResult, setConversionResult] = useState('');

    const handleInputChange = (event) => {
        setTextFieldValue(event.target.value);
    };

    const handleGenerateSave = () => {
        const blob = new Blob([textFieldValue], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleGenerateJSONFile = () => {
        if (conversionResult) {
            const blob = new Blob([conversionResult], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'convertedJSON.json';
            link.click();
            URL.revokeObjectURL(url);
        } else {
            alert('No JSON data available to download.');
        }
    };

    const handleConvert = () => {
        try {
            const trimmedInput = textFieldValue.trim();
            console.log("Input received:", trimmedInput);

            if (!trimmedInput) {
                throw new Error("Input cannot be empty.");
            }

            const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
            let bsonBinary;

            if (base64Regex.test(trimmedInput)) {
                const decodedBuffer = Buffer.from(trimmedInput, 'base64');
                bsonBinary = new Uint8Array(decodedBuffer);
            } else {
                const byteValues = trimmedInput.split(',').map(Number);
                bsonBinary = new Uint8Array(byteValues);
            }

            console.log("Decoded BSON Binary:", bsonBinary);

            if (bsonBinary.length < 4) {
                throw new Error("Invalid BSON data: length is less than 4 bytes.");
            }

            const jsonObject = BSON.deserialize(bsonBinary);
            const prettyJSON = JSON.stringify(jsonObject, null, 2);
            setConversionResult(prettyJSON);

        } catch (error) {
            console.error('Error during conversion:', error);
            alert(error.message || 'An error occurred during conversion. Please check the console for more details.');
        }
    }

    return (
        <div className='container'>
            <div className="explanation">
                <p>Convert your Base64 BSON Binary into JSON</p>
                <p><strong>Small sample input:</strong> DwAAABBCbGFoAAEAAAAA</p>
                <p><strong>More complex input:</strong> MQAAAARCU09OACYAAAACMAAIAAAAYXdlc29tZQABMQAzMzMzMzMUQBAyAMIHAAAAAA</p>
            </div>
            <Form.Group className="jsonTextField" controlId="exampleForm.ControlTextarea1">
                <Form.Control
                    as="textarea" rows={10}
                    value={textFieldValue}
                    onChange={handleInputChange}
                    placeholder="Enter BSON data"
                />
            </Form.Group>
            <div className="jsonbtns">
                <button onClick={handleGenerateSave}>Save BSON Document</button>
                <button onClick={handleGenerateJSONFile}>Generate JSON Document</button>
                <button onClick={handleConvert}>Convert to JSON</button>
            </div>
            {conversionResult && (
                <div className="conversionResult">
                    <h3>Conversion Result (JSON document):</h3>
                    <pre>{conversionResult}</pre>
                </div>
            )}
        </div>
    );
};

export default JSONConverter;