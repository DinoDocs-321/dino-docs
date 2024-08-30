// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JSONEditor.css';
import mockData from './mockData';

const JSONEditor = () => {
  const [formData, setFormData] = useState({});
  const [jsonCode, setJSONCode] = useState('');

  useEffect(() => {
    // Load mock data when the component mounts
    setFormData(mockData);
    setJSONCode(JSON.stringify(mockData, null, 2));
  }, []);

  const handleInputChange = (e, key, subKey) => {
    const value = e.target.value;
    const updatedFormData = { ...formData };

    if (subKey) {
      updatedFormData[key][subKey] = value;
    } else {
      updatedFormData[key] = value;
    }

    setFormData(updatedFormData);
    setJSONCode(JSON.stringify(updatedFormData, null, 2));
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    try {
      const updatedFormData = JSON.parse(value);
      setFormData(updatedFormData);
      setJSONCode(value);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const handleSubmit = () => {
    axios.post('http://localhost:8000/api/save-json/', formData)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('There was an error saving the JSON data!', error);
      });
  };

  const handleDownload = () => {
    const blob = new Blob([jsonCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='json-editor-container'>
      <div className='visual-editor'>
        <h3>Visual Editor</h3>
        <label>
          ID
          <input
            type="text"
            value={formData.ID || ''}
            onChange={(e) => handleInputChange(e, 'ID')}
          />
        </label>
        <label>
          SortAs
          <input
            type="text"
            value={formData.SortAs || ''}
            onChange={(e) => handleInputChange(e, 'SortAs')}
          />
        </label>
        <label>
          GlossTerm
          <input
            type="text"
            value={formData.GlossTerm || ''}
            onChange={(e) => handleInputChange(e, 'GlossTerm')}
          />
        </label>
        <label>
          Acronym
          <input
            type="text"
            value={formData.Acronym || ''}
            onChange={(e) => handleInputChange(e, 'Acronym')}
          />
        </label>
        <label>
          Abbrev
          <input
            type="text"
            value={formData.Abbrev || ''}
            onChange={(e) => handleInputChange(e, 'Abbrev')}
          />
        </label>
        <label>
          GlossDef
          <input
            type="text"
            value={formData.GlossDef?.para || ''}
            onChange={(e) => handleInputChange(e, 'GlossDef', 'para')}
          />
        </label>
        <label>
          GlossSeeAlso
          <input
            type="text"
            value={formData.GlossDef?.GlossSeeAlso.join(', ') || ''}
            onChange={(e) =>
              handleInputChange(
                { target: { value: e.target.value.split(', ') } },
                'GlossDef',
                'GlossSeeAlso'
              )
            }
          />
        </label>
        <label>
          GlossSee
          <input
            type="text"
            value={formData.GlossSee || ''}
            onChange={(e) => handleInputChange(e, 'GlossSee')}
          />
        </label>
      </div>

      <div className='code-editor'>
        <h3>Code Editor</h3>
        <textarea
          value={jsonCode}
          onChange={handleCodeChange}
          style={{ width: '100%' }}
        />
      </div>
      <div className='buttons'>
        <button onClick={handleSubmit}>Save JSON Data</button>
        <button onClick={handleDownload}>Generate JSON Document</button>
      </div>
    </div>
  );
};

export default JSONEditor;
