import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BSON } from 'bson';
import Form from 'react-bootstrap/Form';
import './converter.css';

const Converter = () => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [conversionResult, setConversionResult] = useState('');

  useEffect(() => {
    const preLoadedData = '{"key": "value"}'; 
    setTextFieldValue(preLoadedData);
  }, []);

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
    <div className='converContainer'>
      <Form.Group className="bsonTextField" controlId="exampleForm.ControlTextarea1">
        <Form.Control
          as="textarea" rows={10}
          value={textFieldValue}
          onChange={handleInputChange}
          placeholder="Enter JSON data"
        />
      </Form.Group>
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
    </div>
  );
};

export default Converter;