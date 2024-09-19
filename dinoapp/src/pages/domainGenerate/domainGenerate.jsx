import React, { useState } from 'react';
import axios from 'axios';

const JsonValidator = () => {
  const [jsonText, setJsonText] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload and validation
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await axios.post('http://127.0.0.1:8000/api/validate-json-file/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('File validated successfully');
      // Assuming you want to preview the uploaded file (adjust this based on your use case)
      setFileUrl(URL.createObjectURL(file));
    } catch (error) {
      setMessage('There was an error validating the file');
    }
  };

  // Handle JSON text validation
  const handleValidate = async () => {
    try {
      const result = await axios.post('http://127.0.0.1:8000/api/validate-json-text/', { jsonText });
      setJsonPreview(JSON.stringify(result.data, null, 2));
      setMessage('JSON validated successfully');
    } catch (error) {
      setMessage('There was an error validating the JSON');
    }
  };

  return (
    <div className="manual-generate-container">
      <div className="upload-section">
        <h1>Upload File</h1>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
          <button type="submit" className="button">Upload</button>
        </form>
        {message && <p className="message">{message}</p>}
        {fileUrl && (
          <div>
            <h2>Uploaded Document</h2>
            <iframe
              src={fileUrl}
              className="iframe"
              title="Uploaded Document"
            ></iframe>
          </div>
        )}
      </div>

      <div className="json-section">
        <h2>Paste JSON Document</h2>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste your JSON here..."
          className="textarea"
        />
        <button onClick={handleValidate} className="button">Validate</button>
        {jsonPreview && (
          <pre className="json-preview">{jsonPreview}</pre>
        )}
      </div>

      <div className="button-row">
        <button className="row-button">Button 1</button>
        <button className="row-button">Button 2</button>
        <button className="row-button">Button 3</button>
      </div>
    </div>
  );
};

export default JsonValidator;
