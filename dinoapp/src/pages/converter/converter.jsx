import React, { useState } from 'react';
import { BSON } from 'bson';
import axios from 'axios';
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

    const handleInputChange = (event) => {
        setTextFieldValue(event.target.value);
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
            } else if (file.type === 'application/octet-stream' || file.name.endsWith('.bson')) {
                setFileType('bson');
                const bsonBuffer = new Uint8Array(content);
                const jsonObject = BSON.deserialize(bsonBuffer);
                setTextFieldValue(JSON.stringify(jsonObject, null, 2));
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
            const data = JSON.parse(textFieldValue);
            if (fileType === 'json') {
                const bsonData = BSON.serialize(data);
                const blob = new Blob([bsonData.buffer], { type: 'application/bson' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'converted.bson';
                link.click();
                URL.revokeObjectURL(url);
            } else {
                const blob = new Blob([textFieldValue], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'converted.json';
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating file:', error);
            alert('Invalid JSON. Please check your input.');
        }
    };

    // const handleConvert = async () => {
    //     try {
    //         const response = await axios.post('http://localhost:8000/api/convert/', {
    //             data: textFieldValue,
    //             fileType,
    //         });
    //         setConversionResult(response.data.converted_data);
    //     } catch (error) {
    //         console.error('Error during conversion:', error);
    //         alert('An error occurred during conversion. Please check the console for more details.');
    //     }
    // };

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <Form.Group controlId="fileUpload">
                        <Form.Label>Upload JSON or BSON File</Form.Label>
                        <Form.Control type="file" accept=".json,.bson" onChange={handleFileUpload} />
                    </Form.Group>
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
                <div className="buttons">
                    <button onClick={handleGenerateFile}>
                        {fileType === 'json' ? 'Generate BSON File' : 'Generate JSON File'}
                    </button>
                    {/* <button onClick={handleConvert}>Convert via API</button> */}
                </div>
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
