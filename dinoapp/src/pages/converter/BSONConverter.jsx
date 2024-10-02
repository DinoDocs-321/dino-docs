import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BSON } from 'bson';
import Form from 'react-bootstrap/Form';
import './BSONConverter.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

const BSONConverter = () => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [conversionResult, setConversionResult] = useState('');
  const location = useLocation();

  // Updated function to handle a regular JSON object
  const transformSchemaToKeyValue = (schema) => {
    const keyValuePairs = {};
    if (schema.properties) {
      Object.keys(schema.properties).forEach((key) => {
        const property = schema.properties[key];
        // Determine the default value based on the property type
        if (property.type === 'string') {
          keyValuePairs[key] = ''; // Default for strings
        } else if (property.type === 'integer') {
          keyValuePairs[key] = 0; // Default for integers
        } else if (property.type === 'boolean') {
          keyValuePairs[key] = false; // Default for booleans
        } else if (property.type === 'array') {
          keyValuePairs[key] = []; // Default for arrays
        } else {
          keyValuePairs[key] = null; // Default for other types
        }
      });
    }
    return keyValuePairs;
  };

  useEffect(() => {
    if (location.state && location.state.savedData) {
      const transformedData = transformSchemaToKeyValue(location.state.savedData);
      setTextFieldValue(JSON.stringify(transformedData, null, 2)); // Pretty print the JSON
    } else {
      const preLoadedData = '{"key": "value"}';
      setTextFieldValue(preLoadedData);
    }
  }, [location.state]);

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
      const blob = new Blob([bsonData.buffer], { type: 'application/bson' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'content.bson';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating BSON:', error);
      alert('Invalid JSON. Please check your input.');
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/convert/', {
        data: textFieldValue,
      });

      setConversionResult(response.data.converted_data);
    } catch (error) {
      console.error('Error during conversion:', error);
      alert('An error occurred during conversion. Please check the console for more details.');
    }
  };

  return (
    <Container>
      <Row>
        <Form.Group className="bsonTextField" controlId="exampleForm.ControlTextarea1">
          <Form.Control
            as="textarea"
            rows={10}
            value={textFieldValue}
            onChange={handleInputChange}
            placeholder="Enter JSON data"
          />
        </Form.Group>
      </Row>
      <Row>
        <div className="bsonbtns">
          <button onClick={handleGenerateSave}>Save JSON Document</button>
          <button onClick={handleGenerateBSONFile}>Generate BSON Document</button>
        </div>
      {conversionResult && (
        <div className="conversionResult">
          <h3>Conversion Result (BSON as hex):</h3>
          <pre>{conversionResult}</pre>
        </div>
      )}
      </Row>
    </Container>
  );
};

export default BSONConverter;