// dinoapp/src/pages/manualGenerate/ManualGenerate.js
import React, { useState } from 'react';
import './manualGenerate.css'; // Import the CSS file

function ManualGenerate() {
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonPreview, setJsonPreview] = useState('');
  const [message, setMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/manual-generate/', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Upload failed: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setFileUrl(`/media/${data.filename}`); // Adjust the URL if needed
          setMessage(`File uploaded successfully: ${data.filename}`);
        } else {
          setMessage(`Upload failed: ${data.message}`);
        }
      })
      .catch((error) => {
        setMessage(`Upload error: ${error.message}`);
      });
  };

  const handleValidate = () => {
    try {
      JSON.parse(jsonText);
      setJsonPreview(JSON.stringify(JSON.parse(jsonText), null, 2));
      setMessage('JSON is valid.');
    } catch (error) {
      setMessage('Invalid JSON format.');
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
}

export default ManualGenerate;
