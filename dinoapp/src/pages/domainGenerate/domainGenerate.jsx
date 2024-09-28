import React, { useState } from 'react';
import { serialize } from 'bson'; // Import serialize function from bson
import { useNavigate } from 'react-router-dom';
import './domainGenerate.css';
import JSONEditor from '../jsoneditor/App.js'; // Adjust the path accordingly

const DomainGenerate = () => {
  const [jsonText, setJsonText] = useState(''); // Single JSON input for schema
  const [schemaFile, setSchemaFile] = useState(null); // File for schema
  const [domainFile, setDomainFile] = useState(null); // File for domain
  const [message, setMessage] = useState(null);
  const [schemaFileContents, setSchemaFileContents] = useState(null); // For displaying schema file contents
  const [domainFileContents, setDomainFileContents] = useState(null); // For displaying domain file contents
  const [isSchemaDropped, setIsSchemaDropped] = useState(false); // Track if a schema file has been dropped
  const [isDomainDropped, setIsDomainDropped] = useState(false); // Track if a domain file has been dropped
  const [jsonSchema, setJsonSchema] = useState('');
  const navigate = useNavigate();

  const handleSchemaFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setSchemaFile(selectedFile);
    setMessage(null); // Clear message when new file is selected
    setSchemaFileContents(null); // Clear previous file contents
    setIsSchemaDropped(!!selectedFile); // Update drop state based on selected file
  };

  const handleDomainFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setDomainFile(selectedFile);
    setMessage(null); // Clear message when new file is selected
    setDomainFileContents(null); // Clear previous file contents
    setIsDomainDropped(!!selectedFile); // Update drop state based on selected file
  };

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

    reader.readAsText(file); // Read the file as text
  };

  // Schema validation: Checks for basic properties in a JSON schema
  const isValidSchema = (jsonObject) => {
    return jsonObject && typeof jsonObject === 'object' && jsonObject.hasOwnProperty('type') && jsonObject.hasOwnProperty('properties');
  };

  // Domain validation: Define the structure for a valid domain JSON (adjust according to your domain model)
  const isValidDomain = (jsonObject) => {
    return jsonObject && typeof jsonObject === 'object' && jsonObject.hasOwnProperty('domain') && Array.isArray(jsonObject.domain);
  };

  // Handles the dropped schema file and validates it
  const handleSchemaFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target.result);
          if (isValidSchema(parsedJson)) {
            setSchemaFile(droppedFile);
            setIsSchemaDropped(true); // Update drop state
            handleFileUpload(droppedFile, true); // Process as schema
            setMessage('Schema file is valid.');
          } else {
            setMessage('Invalid Schema file.');
          }
        } catch (error) {
          setMessage('Error parsing JSON in the schema file.');
        }
      };
      reader.readAsText(droppedFile); // Read the file as text
    }
  };

  // Handles the dropped domain file and validates it
  const handleDomainFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target.result);
          if (isValidDomain(parsedJson)) {
            setDomainFile(droppedFile);
            setIsDomainDropped(true); // Update drop state
            handleFileUpload(droppedFile, false); // Process as domain
            setMessage('Domain file is valid.');
          } else {
            setMessage('Invalid Domain file.');
          }
        } catch (error) {
          setMessage('Error parsing JSON in the domain file.');
        }
      };
      reader.readAsText(droppedFile); // Read the file as text
    }
  };

  const handleFileUploadBoth = () => {
    if (schemaFile) {
      handleFileUpload(schemaFile, true); // Upload schema file
    }
    if (domainFile) {
      handleFileUpload(domainFile, false); // Upload domain file
    }
    if (!schemaFile && !domainFile) {
      setMessage('Please upload at least one file (schema or domain).');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior to allow drop
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(true); // Indicate that a schema file is being dragged over
    } else {
      setIsDomainDropped(true); // Indicate that a domain file is being dragged over
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.dataset.type === 'schema') {
      setIsSchemaDropped(false); // Reset drop state when leaving the area
    } else {
      setIsDomainDropped(false); // Reset drop state when leaving the area
    }
  };

  const handleDownloadBson = () => {
    try {
      let jsonData;

      if (schemaFileContents) {
        jsonData = JSON.parse(schemaFileContents);
      } else if (jsonText) {
        jsonData = JSON.parse(jsonText);
      } else {
        setMessage('No JSON content available to save as BSON.');
        return;
      }

      const bsonData = serialize(jsonData); // Use serialize from bson

      const blob = new Blob([bsonData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.bson'; // Set the filename
      link.click();
      URL.revokeObjectURL(url);

      setMessage('BSON file downloaded successfully.');
    } catch (error) {
      setMessage('Error while converting JSON to BSON.');
    }
  };

  const goToJSONEditor = () => {
    try {
      let jsonData;

      // Check if schema file content exists, otherwise use the input field
      if (schemaFileContents) {
        jsonData = JSON.parse(schemaFileContents);
      } else if (jsonText) {
        jsonData = JSON.parse(jsonText);
      } else {
        setMessage('No JSON content available to redirect.');
        return;
      }

      // Pass the JSON schema as state when navigating to /JSONEditor
      navigate('/JSONEditor', { state: { jsonSchema: jsonData } });
    } catch (error) {
      setMessage('Error while processing the JSON schema.');
    }
  };

  const goToGenerate = () => {
    navigate('/generate');
  };

  const handleValidateJSONInput = () => {
    try {
      const parsedJson = JSON.parse(jsonText);
      if (isValidSchema(parsedJson)) {
        setMessage('JSON input is valid.');
      } else {
        setMessage('Invalid JSON input.');
      }
    } catch (error) {
      setMessage('Invalid JSON format in the input field.');
    }
  };

  return (
    <div className="domain-generate-container">
      {/* File Upload Section */}
      <div className="upload-section">
        <h2 className="section-title">Upload Files</h2>
        <div className="drop-box-container">
          {/* Schema Drop Box */}
          <div
            className={`upload-box file-drop-area ${isSchemaDropped ? 'dropped' : ''}`}
            data-type="schema" onDragOver={handleDragOver} onDrop={handleSchemaFileDrop} onDragLeave={handleDragLeave}
          >
            <p>Drag n Drop Schema File Here</p>
            <span>Or <a href="#" onClick={() => document.getElementById('schema-upload').click()}>Browse</a></span>
            <input
              type="file"
              id="schema-upload"
              onChange={handleSchemaFileChange}
              className="file-input"
            />
          </div>

          {/* Domain Drop Box */}
          <div
            className={`upload-box file-drop-area ${isDomainDropped ? 'dropped' : ''}`}
            data-type="domain"
            onDragOver={handleDragOver}
            onDrop={handleDomainFileDrop}
            onDragLeave={handleDragLeave}
          >
            <p>Drag n Drop Domain File Here</p>
            <span>Or <a href="#" onClick={() => document.getElementById('domain-upload').click()}>Browse</a></span>
            <input
              type="file"
              id="domain-upload"
              onChange={handleDomainFileChange}
              className="file-input"
            />
          </div>
        </div>

        <button onClick={handleFileUploadBoth}>Upload Both</button>
        {message && <p className="message">{message}</p>}
      </div>

      {/* JSON Input Section */}
      <div className="json-input-section">
        <h2 className="section-title">Paste JSON Input</h2>
        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste your JSON here..."
        />
        <button onClick={handleValidateJSONInput}>Validate JSON</button>
      </div>
      <div>{message && <p className="message">{message}</p>}</div>

      {/* Actions */}
      <div className="action-buttons">
        <button onClick={goToGenerate}>Generate</button>
        <button onClick={goToJSONEditor}>Open JSON Editor</button>
        <button onClick={handleDownloadBson}>Download BSON</button>
      </div>
    </div>
  );
};

export default DomainGenerate;
