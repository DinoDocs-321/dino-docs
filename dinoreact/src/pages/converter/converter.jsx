import React, { useState, useEffect } from 'react';
import { BSON } from 'bson';
import './converter.css'

const Converter = () => {
  const [textFieldValue, setTextFieldValue] = useState('');

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
    link.href = url;
    link.download = 'content.bson';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='container'>
      <input
        type="text"
        value={textFieldValue}
        onChange={handleInputChange}
        placeholder="BSON data"
        className="bsonTextField"
      />
      <div className="bsonbtns">
        <button onClick={handleGenerateSave}>Save Schema & Document</button>
        <button onClick={handleGenerateBSONFile}>Generate BSON Document</button>
      </div>
    </div>
  );
};

export default Converter;
