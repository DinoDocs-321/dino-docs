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

  // Handle input change for manual typing in textarea
  const handleInputChange = (event) => {
    setTextFieldValue(event.target.value);
  };

  // Handle file upload and read file content
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the first file from the input
    if (file) {
      const reader = new FileReader(); // Create a new FileReader
      reader.onload = function(e) {
        const fileContent = e.target.result; // Get the file content
        setTextFieldValue(fileContent); // Set file content to text field
      };
      reader.readAsText(file); // Read the file content as text
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
