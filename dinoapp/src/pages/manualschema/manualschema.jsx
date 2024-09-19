import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ManualSchema = () => {
  const [textFieldValue, setTextFieldValue] = useState('');

  useEffect(() => {
    const preLoadedData = '{"key": "value"}'; 
    setTextFieldValue(preLoadedData);
  }, []);

  const handleInputChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; 
    if (file) {
      const reader = new FileReader(); 
      reader.onload = function(e) {
        const fileContent = e.target.result; 
        setTextFieldValue(fileContent); 
      };
      reader.readAsText(file); 
    }
  };

  return (
    <Container>
      <Row>
        <Form.Group controlId="formFileLg" className="mb-3">
          <Form.Label>Upload File</Form.Label>
          <Form.Control type="file" size="lg" onChange={handleFileUpload} />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group className="TextField" controlId="exampleForm.ControlTextarea1">
          <Form.Control
            as="textarea"
            rows={10}
            value={textFieldValue}
            onChange={handleInputChange}
            placeholder="Enter or upload JSON data"
          />
        </Form.Group>
      </Row>
      <Row>
        <div className="bsonbtns">
          <button>Edit JSON Schema</button>
          <button>Generate JSON Document</button>
        </div>
      </Row>
    </Container>
  );
};

export default ManualSchema;
