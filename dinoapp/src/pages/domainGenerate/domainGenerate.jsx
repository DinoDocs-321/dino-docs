import React, { useState } from 'react';
import { serialize } from 'bson';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './domainGenerate.css';

const DomainGenerate = () => {
  const [jsonText, setJsonText] = useState('');
  const [schemaFile, setSchemaFile] = useState(null);
  const [domainFile, setDomainFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [schemaFileContents, setSchemaFileContents] = useState(null);
  const [domainFileContents, setDomainFileContents] = useState(null);
  const [isSchemaDropped, setIsSchemaDropped] = useState(false);
  const [isDomainDropped, setIsDomainDropped] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (file, isSchema) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);
        if (isSchema) {
          setSchemaFileContents(JSON.stringify(parsedJson, null, 2));
          setMessage('Schema file uploaded successfully');
        } else {
          setDomainFileContents(JSON.stringify(parsedJson, null, 2));
          setMessage('Domain file uploaded successfully');
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

  const handleDomainFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setDomainFile(selectedFile);
      handleFileUpload(selectedFile, false);
      setIsDomainDropped(true);
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

  const handleDomainFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setDomainFile(droppedFile);
      handleFileUpload(droppedFile, false);
      setIsDomainDropped(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(true);
    } else {
      setIsDomainDropped(true);
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(false);
    } else {
      setIsDomainDropped(false);
    }
  };

  const handleFileUploadBoth = async () => {
    if (!schemaFile && !domainFile) {
      setMessage('Please upload at least one file (schema or domain).');
      return;
    }

    const formData = new FormData();
    if (schemaFile || domainFile) {
      formData.append('file', schemaFile || domainFile);
    }

    try {
      const response = await axios.post('http://localhost:8000/api/validate-json-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error uploading files: ' + error.response?.data?.message || error.message);
    }
  };

  const validateJsonFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/api/validate-json-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error validating file: ' + error.response?.data?.message || error.message);
    }
  };

  const validateJsonText = async () => {
    if (!jsonText) {
      setMessage('Please enter JSON text to validate.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/validate-json-text/', { jsonText });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      
      if (error.response) {
        // Server responded with a status other than 2xx
        setMessage('Error validating JSON text: ' + (error.response.data?.message || 'Unknown error from server'));
      } else if (error.request) {
        // Request was made but no response was received
        setMessage('Error validating JSON text: No response from server.');
      } else {
        // Other errors (e.g., issue with setting up request)
        setMessage('Error validating JSON text: ' + error.message);
      }
    }
  };

  // Add new onClick handlers for buttons
  const handleValidateSchemaFile = () => {
    if (schemaFile) {
      validateJsonFile(schemaFile, 'schema');
    } else {
      setMessage('Please upload a schema file to validate.');
    }
  };

  const handleValidateDomainFile = () => {
    if (domainFile) {
      validateJsonFile(domainFile, 'domain');
    } else {
      setMessage('Please upload a domain file to validate.');
    }
  };

  const handleValidateJSONInput = () => {
    validateJsonText();
  };

  const handleGenerate = async () => {
    if (!schemaFile && !domainFile && !jsonText) {
        setMessage('Please upload a schema file, domain file, or enter JSON text.');
        return;
    }

    const formData = new FormData();
    if (schemaFile) {
        formData.append('schemaFile', schemaFile);
    }
    if (domainFile) {
        formData.append('domainFile', domainFile);
    }
    if (jsonText) {
        formData.append('jsonText', jsonText);
    }

    try {
        const response = await axios.post('http://localhost:8000/api/generate/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Navigate to "/generate" and pass the response data
        navigate('generate/', { state: { generatedData: response.data } });
    } catch (error) {
        console.error('Error generating data:', error);
        setMessage('Error generating data: ' + error.message);
    }
  };

  const handleJSONEditor = async () => {
    if (!jsonText && !schemaFile && !domainFile) {
      setMessage('Please provide JSON text, schema file, or domain file.');
      return;
    }

    const formData = new FormData();
    if (schemaFile) {
      formData.append('schemaFile', schemaFile);
    }
    if (domainFile) {
      formData.append('domainFile', domainFile);
    }
    if (jsonText) {
      formData.append('jsonText', jsonText);
    }

    try {
      // Send the data to your backend
      const response = await axios.post('http://localhost:8000/api/save-schema/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Assuming the backend responds with the saved data or a success message
      const savedData = response.data.savedData; // Adjust based on your backend response structure

      // Redirect to /JSONEditor with the saved data
      navigate('/JSONEditor', { state: { savedData } });
    } catch (error) {
      console.error(error);
      setMessage('Error saving data: ' + error.response?.data?.message || error.message);
    }
  };

  const handleDownloadBson = async () => {
    let dataToSend = null;
  
    // Check if JSON text is provided
    if (jsonText) {
      try {
        dataToSend = JSON.parse(jsonText); // Parse JSON text
      } catch (error) {
        setMessage('Invalid JSON text provided.');
        return;
      }
    } 

    // Check if a schema file is uploaded
    else if (schemaFile) {
      try {
        const schemaFileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(JSON.parse(reader.result)); // Resolve with parsed JSON
          reader.onerror = reject;
          reader.readAsText(schemaFile); // Read the schema file
        });
        dataToSend = schemaFileContent; // Use the content of the schema file
      } catch (error) {
        setMessage('Error reading schema file: ' + error.message);
        return;
      }
    } 
    // Check if a domain file is uploaded
    else if (domainFile) {
      try {
        const domainFileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(JSON.parse(reader.result)); // Resolve with parsed JSON
          reader.onerror = reject;
          reader.readAsText(domainFile); // Read the domain file
        });
        dataToSend = domainFileContent; // Use the content of the domain file
      } catch (error) {
        setMessage('Error reading domain file: ' + error.message);
        return;
      }
    } else {
      setMessage('Please provide JSON data or upload a schema/domain file.');
      return;
    }
  
    // If we have valid data to send, proceed to convert to BSON
    try {
      const response = await axios.post('http://localhost:8000/api/convert/', {
        data: dataToSend, // Send the collected data
      }, {
        responseType: 'blob', // Important for downloading files
      });
  
      // Create a URL for the BSON data blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.bson'); // Set the filename
      document.body.appendChild(link);
      link.click(); // Trigger the download
      link.remove(); // Clean up the DOM
    } catch (error) {
      console.error(error);
      setMessage('Error downloading BSON: ' + (error.response?.data?.message || error.message));
    }
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
              <a href="#" onClick={() => document.getElementById('schema-upload').click()}>
                Browse
              </a>
            </span>
            <input
              type="file"
              id="schema-upload"
              onChange={handleSchemaFileChange}
              className="file-input"
              style={{ display: 'none' }} // Hide the input
            />
          </div>

          <div
            className={`upload-box file-drop-area ${isDomainDropped ? 'dropped' : ''}`}
            data-type="domain"
            onDragOver={handleDragOver}
            onDrop={handleDomainFileDrop}
            onDragLeave={handleDragLeave}
          >
            <p>Drag and Drop Domain File Here</p>
            <span>
              Or{' '}
              <a href="#" onClick={() => document.getElementById('domain-upload').click()}>
                Browse
              </a>
            </span>
            <input
              type="file"
              id="domain-upload"
              onChange={handleDomainFileChange}
              className="file-input"
              style={{ display: 'none' }} // Hide the input
            />
          </div>
        </div>

        <button onClick={handleValidateSchemaFile}>Validate Schema File</button>
        <button onClick={handleValidateDomainFile}>Validate Domain File</button>
        <button onClick={handleFileUploadBoth}>Upload Both</button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="json-input-section">
        <h2 className="section-title">Paste JSON Input</h2>
        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste your JSON here..."
        />
        <button onClick={handleValidateJSONInput}>Validate JSON</button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="action-buttons">
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={handleJSONEditor}>Open JSON Editor</button>
        <button onClick={handleDownloadBson}>Download BSON</button>
      </div>
    </div>
  );
};

export default DomainGenerate;