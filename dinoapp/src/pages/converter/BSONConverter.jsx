import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BSON } from 'bson';
import Form from 'react-bootstrap/Form';
import './BSONConverter.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Buffer } from 'buffer';

const BSONConverter = () => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [conversionResult, setConversionResult] = useState('');
  const location = useLocation();
  const { savedData } = location.state || {};
  
  useEffect(() => {
    if (savedData) {
      setTextFieldValue(JSON.stringify(savedData, null, 2)); // Directly set savedData in JSON format to the text field
    } else {
      const preLoadedData = '{"key": "field"}'; // If no savedData is present, use a default JSON value
      setTextFieldValue(preLoadedData);
    }
  }, [savedData]);

  const handleInputChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  const handleGenerateSave = () => {
    const blob = new Blob([textFieldValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateBSONFile = () => {
    try {
      const data = JSON.parse(textFieldValue);
      const bsonData = BSON.serialize(data);
      const bsonHex = Buffer.from(bsonData).toString('hex');
      const blob = new Blob([bsonData.buffer], { type: 'application/bson' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'content.bson';
      link.click();
      URL.revokeObjectURL(url);
      setConversionResult(bsonHex); 
    } catch (error) {
      console.error('Error generating BSON:', error);
      alert('Invalid JSON. Please check your input.');
    }
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col className="text-center mt-4">
          <h1>BSON Converter Page</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={8}> {/* Center the form by controlling column width */}
          <Form.Group className="bsonTextField" controlId="exampleForm.ControlTextarea1">
            <Form.Control
              as="textarea"
              rows={10}
              value={textFieldValue}
              onChange={handleInputChange}
              placeholder="Enter JSON data"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col className="text-center"> {/* Ensure buttons are centered */}
          <div className="bsonbtns">
            <button onClick={handleGenerateSave}>Save JSON Document</button>
            <button onClick={handleGenerateBSONFile}>Generate BSON Document</button>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8}>
          {conversionResult && (
            <div className="conversionResult">
              <h3>Conversion Result (BSON as hex):</h3>
              <pre>{conversionResult}</pre>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BSONConverter;