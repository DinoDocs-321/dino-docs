import React, { useState } from 'react';
import { BSON } from 'bson';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import './converter.css';

const Converter = () => {
    const [textFieldValue, setTextFieldValue] = useState('');
    const [conversionResult, setConversionResult] = useState('');
    const [fileType, setFileType] = useState('json'); // 'json' or 'bson'
    const [isValidJson, setIsValidJson] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const handleInputChange = (event) => {
        const content = event.target.value;
        setTextFieldValue(content);
        validateJson(content);
    };

    const validateJson = (content) => {
        try {
            JSON.parse(content);
            setIsValidJson(true);
            setUploadMessage('Valid JSON uploaded.');
        } catch (e) {
            setIsValidJson(false);
            setUploadMessage('Invalid JSON. Please correct the format.');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                setFileType('json');
                setTextFieldValue(content);
                validateJson(content);
            } else if (file.type === 'application/octet-stream' || file.name.endsWith('.bson')) {
                setFileType('bson');
                const bsonBuffer = new Uint8Array(content);
                const jsonObject = BSON.deserialize(bsonBuffer);
                const jsonString = JSON.stringify(jsonObject, null, 2);
                setTextFieldValue(jsonString);
                validateJson(jsonString);
            } else {
                alert('Unsupported file type. Please upload a JSON or BSON file.');
            }
        };
        if (file.type === 'application/octet-stream' || file.name.endsWith('.bson')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    const handleGenerateFile = () => {
        try {
            // Parse the input JSON
            const data = JSON.parse(textFieldValue);
    
            // Wrap the data in an object if it is an array
            const dataToSerialize = Array.isArray(data) ? { data } : data;
    
            if (fileType === 'json') {
                // Serialize the wrapped data or object
                const bsonData = BSON.serialize(dataToSerialize);
                const blob = new Blob([bsonData.buffer], { type: 'application/bson' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'converted.bson';
                link.click();
                URL.revokeObjectURL(url);
            } else {
                // For JSON, directly convert to a file
                const blob = new Blob([textFieldValue], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'converted.json';
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating file:', error.message);
            alert(`Invalid JSON. Error: ${error.message}`);
        }
    };    

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <Form.Group controlId="fileUpload">
                        <Form.Label>Upload JSON or BSON File</Form.Label>
                        <Form.Control type="file" accept=".json,.bson" onChange={handleFileUpload} />
                    </Form.Group>
                    {uploadMessage && <div className="upload-message">{uploadMessage}</div>}
                </Col>
            </Row>
            <Row>
                <Form.Group controlId="textField">
                    <Form.Control
                        as="textarea"
                        rows={10}
                        value={textFieldValue}
                        onChange={handleInputChange}
                        placeholder="Enter or upload JSON/BSON data"
                    />
                </Form.Group>
            </Row>
            <Row>
                {isValidJson && (
                     <div className="buttons">
                        <button onClick={handleGenerateFile} className="me-2 btn btn-link cus-btn">
                            {fileType === 'json' ? 'Generate BSON File' : 'Generate JSON File'}
                        </button>
                    </div>
                )}
            </Row>
            {conversionResult && (
                <Row>
                    <Col>
                        <div className="conversionResult">
                            <h3>Conversion Result:</h3>
                            <pre>{conversionResult}</pre>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Converter;
