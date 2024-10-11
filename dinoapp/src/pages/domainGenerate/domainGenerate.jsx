import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './domainGenerate.css';

const DomainGenerate = () => {
  const [jsonText, setJsonText] = useState('');
  const [schemaFile, setSchemaFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [schemaFileContents, setSchemaFileContents] = useState(null);
  const [isSchemaDropped, setIsSchemaDropped] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (file, isSchema) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);
        if (isSchema) {
          setSchemaFileContents(JSON.stringify(parsedJson, null, 2));
          setMessage('Schema file uploaded successfully');
        }
      } catch (error) {
        setMessage(`Invalid JSON format in the ${isSchema ? 'schema' : 'domain'} file`);
      }
    };

    reader.readAsText(file);
  };

  const handleSchemaFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setSchemaFile(selectedFile);
      handleFileUpload(selectedFile, true);
      setIsSchemaDropped(true);
    }
  };

  const handleSchemaFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSchemaFile(droppedFile);
      handleFileUpload(droppedFile, true);
      setIsSchemaDropped(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(true);
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(false);
    }
  };

  const validateJsonFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/api/validate-json-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error validating file: ' + error.response?.data?.message || error.message);
    }
  };

  const validateJsonText = async () => {
    if (!jsonText.trim()) {
      setMessage('Please enter JSON text to validate.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/validate-json-text/', { jsonText });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error validating JSON text: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleValidateSchemaFile = () => {
    if (schemaFile) {
      validateJsonFile(schemaFile);
    } else {
      setMessage('Please upload a schema file to validate.');
    }
  };

  const handleEditJSON = async () => {
    let dataToSend = null;
  
    if (schemaFile) {
      try {
        const schemaFileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(JSON.parse(reader.result));
          reader.onerror = reject;
          reader.readAsText(schemaFile);
        });
        dataToSend = schemaFileContent;
      } catch (error) {
        setMessage('Error reading schema file: ' + error.message);
        return;
      }
    } else if (jsonText) {
      try {
        dataToSend = JSON.parse(jsonText);
      } catch (error) {
        setMessage('Invalid JSON text provided.');
        return;
      }
    }
  
    if (!dataToSend) {
      setMessage('Please provide a schema file or JSON text.');
      return;
    }
  
    // Navigate to JSONEditor with the schema data as state
    navigate('/JSONEditor', { state: { savedData: dataToSend } });
  };
  

  return (
    <div className="domain-generate-container">
      <div className="upload-section">
        <h2 className="section-title">Upload Files</h2>
        <div className="drop-box-container">
          <div
            className={`upload-box file-drop-area ${isSchemaDropped ? 'dropped' : ''}`}
            data-type="schema"
            onDragOver={handleDragOver}
            onDrop={handleSchemaFileDrop}
            onDragLeave={handleDragLeave}
          >
            <p>Drag and Drop Schema File Here</p>
            <span>
              Or{' '}
              <a href="#" onClick={() => document.getElementById('schema-upload').click()}>Browse</a>
            </span>
            <input
              type="file"
              id="schema-upload"
              onChange={handleSchemaFileChange}
              className="file-input"
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <button onClick={handleValidateSchemaFile}>Validate Schema File</button>
        <p className="message">{message || '\u00A0'}</p>
      </div>
      <div className="json-input-section">
        <h2 className="section-title">Paste JSON Input</h2>
        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste your JSON here..."
        />
        <button onClick={validateJsonText}>Validate JSON Text</button>
        <p className="message">{message || '\u00A0'}</p>
      </div>
      <br />
      <div className="action-buttons">
        <button onClick={handleEditJSON}>+ Edit JSON Schema</button>
      </div>
    </div>
  );
};

export default DomainGenerate;
