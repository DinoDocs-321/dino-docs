import './generator.css'
import React, { useState } from 'react';

const dataTypeFunctions = {
    "Names": () => "Alex Smith",
    "PhoneFax": () => "(123) 456-7890",
    "Email": () => "example@example.com",
    "Street Address": () => "123 Main St",
    "City": () => "New York",
    "PostalZip": () => "10001",
    "Region": () => "NY",
    "Country": () => "USA",
    "Date": () => new Date().toLocaleDateString(),
    "Time": () => new Date().toLocaleTimeString(),
    "Company": () => "Acme Corp",
};

const aiString = {};

const Generator = () => {
  
    const [rows, setRows] = useState([
        { dataType: 'Names', keyTitle: 'Names', example: dataTypeFunctions["Names"](), tags: [], inputValue: '', userPrompt: 'User prompt' },
        { dataType: 'PhoneFax', keyTitle: 'Phone', example: dataTypeFunctions["PhoneFax"](), tags: [], inputValue: '', userPrompt: 'User prompt' },
    ]);

    const handleDataTypeChange = (index, event) => {
        const newDataType = event.target.value;
        const newRows = [...rows];
        newRows[index].dataType = newDataType;
        newRows[index].example = dataTypeFunctions[newDataType]();
        setRows(newRows);
    };

    const handleKeyTitleChange = (index, event) => {
        const newKeyTitle = event.target.value;
        const newRows = [...rows];
        newRows[index].keyTitle = newKeyTitle;
        setRows(newRows);
    };

    const handleExampleChange = (index, event) => {
        const newExample = event.target.value;
        const newRows = [...rows];
        newRows[index].example = newExample;
        setRows(newRows);
    };

    const handleTagInputChange = (index, event) => {
        const newRows = [...rows];
        newRows[index].inputValue = event.target.value;
        setRows(newRows);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Enter' && rows[index].inputValue.trim() !== '') {
        event.preventDefault();
        const newRows = [...rows];
        const newTag = rows[index].inputValue.trim();
        if (!newRows[index].tags.includes(newTag)) {
            newRows[index].tags.push(newTag);
        }
        //flush or clearing the input before adding
        newRows[index].inputValue = '';
        setRows(newRows);
        }
    };

    const removeTag = (rowIndex, tagIndex) => {
        const newRows = [...rows];
        newRows[rowIndex].tags = newRows[rowIndex].tags.filter((_, i) => i !== tagIndex);
        setRows(newRows);
    };

    const handleUserPromptChange = (index, event) => {
        const newUserPrompt = event.target.value;
        const newRows = [...rows];
        newRows[index].userPrompt = newUserPrompt;
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { dataType: '', keyTitle: '', example: '', tags: [], inputValue: '', userPrompt: '' }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const generateJSON = () => {
        const jsonObject = {};
        rows.forEach(row => {
        if (row.keyTitle) {
            jsonObject[row.keyTitle] = {
            example: row.example,
            tags: row.tags,
            userPrompt: row.userPrompt,
            };
        }
        });
        console.log('Generated JSON:', jsonObject);
        return jsonObject; 
    };

    return (
        <div>
        <h1>Data Generator</h1>
        <div className="table">
            <div className="header">
            <span>Domain</span>
            <span>Key Title</span>
            <span>Examples</span>
            <span>Options</span>
            <span>Domain Prompt Description</span>
            </div>
            {rows.map((row, index) => (
            <div key={index} className="row">
                <select value={row.dataType} onChange={(e) => handleDataTypeChange(index, e)}>
                <option value="Names">Names</option>
                <option value="PhoneFax">Phone / Fax</option>
                <option value="Email">Email</option>
                <option value="Street Address">Street Address</option>
                <option value="City">City</option>
                <option value="PostalZip">Postal / Zip</option>
                <option value="Region">Region</option>
                <option value="Country">Country</option>
                <option value="Date">Date</option>
                <option value="Time">Time</option>
                <option value="Company">Company</option>
                </select>
                <input
                type="text"
                placeholder="Key Title"
                value={row.keyTitle}
                onChange={(e) => handleKeyTitleChange(index, e)}
                />
                <input
                type="text"
                placeholder="Example"
                value={row.example}
                onChange={(e) => handleExampleChange(index, e)}
                />

                <div className="tag-input">
                <input
                    type="text"
                    value={row.inputValue}
                    onChange={(e) => handleTagInputChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="Press 'Enter' to add a tag"
                />
                <div className="tags">
                    {row.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">
                        {tag}
                        <button onClick={() => removeTag(index, tagIndex)}>x</button>
                    </span>
                    ))}
                </div>
                </div>

                <input
                type="text"
                placeholder="User Prompt"
                value={row.userPrompt}
                onChange={(e) => handleUserPromptChange(index, e)}
                />
                <button onClick={() => removeRow(index)}>Remove</button>
            </div>
            ))}
        </div>
        <button onClick={addRow}>Add Record</button>
        <button onClick={generateJSON}>Generate JSON</button>
        </div>
    );
};

export default Generator;
