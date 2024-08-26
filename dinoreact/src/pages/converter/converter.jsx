import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BSON } from 'bson';
import Form from 'react-bootstrap/Form';
import './converter.css';

const Converter = () => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [conversionResult, setConversionResult] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const preLoadedData = 'This is pre-loaded data';
      setTextFieldValue(preLoadedData);
    };

    fetchData();
  }, []);

  const handleInputChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  const handleGenerateSave = () => {
    const blob = new Blob([textFieldValue], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateBSONFile = () => {
    const data = { content: textFieldValue };
    const bsonData = BSON.serialize(data);
    const blob = new Blob([bsonData], { type: 'application/bson' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'content.bson';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('/api/convert/', {
        type: 'json_to_bson', 
        data: textFieldValue
      });
      setConversionResult(response.data.converted);
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionResult('Error during conversion');
    }
  };

  return (
    <div className='container'>
      <Form.Group className="bsonTextField" controlId="exampleForm.ControlTextarea1">
            <Form.Control
              as="textarea" rows={10}
              value={textFieldValue}
              onChange={handleInputChange}
              placeholder="Enter JSON or BSON data"
            />
      </Form.Group>
      <div className="bsonbtns">
        <button onClick={handleGenerateSave}>Save Schema & Document</button>
        <button onClick={handleGenerateBSONFile}>Generate BSON Document</button>
        <button onClick={handleConvert}>Convert Data</button>
      </div>
      {conversionResult && (
        <div className="conversionResult">
          <h3>Conversion Result:</h3>
          <pre>{conversionResult}</pre>
        </div>
      )}
    </div>
  );
};

export default Converter;
