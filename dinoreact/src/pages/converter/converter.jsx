import React, { useState, useEffect } from 'react'

const converter = () => {
    const [textFieldValue, setTextFieldValue] = useState('');

    useEffect(() => {
        const fetchData = async () => {
          // fetch data from database, needs tweeking
          const preLoadedData = 'This is pre-loaded data';
          setTextFieldValue(preLoadedData);
        };
    
        fetchData();
    }, []);

    const handleInputChange = (event) => {
        setTextFieldValue(event.target.value);
    };
      
  return (
    <div>
      <input
        type="bsondata"
        value={textFieldValue}
        onChange={handleInputChange}
        placeholder="BSON data"
        className="bsontextField"
      />
    </div>
  )
}

export default converter
