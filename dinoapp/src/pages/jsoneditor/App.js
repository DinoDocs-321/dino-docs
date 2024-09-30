import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JSONEditor.css';
import binIcon from '../../assets/bin.png';
import arrowsIcon from '../../assets/arrows.png';
import addIcon from '../../assets/add.png';

const JSONEditor = () => {
  const initialFormData = [
    [{
      id: Date.now(),
      label: 'id',
      type: 'Group',
      inner: [
        { id: Date.now() + 1, label: 'type', value: 'integer', type: 'Text' },
        { id: Date.now() + 2, label: 'description', value: 'The unique identifier for a user.', type: 'Text' }
      ]
    }],

    [{
      id: Date.now() + 3,
      label: 'username',
      type: 'Group',
      inner: [
        { id: Date.now() + 4, label: 'type', value: 'string', type: 'Text' },
        { id: Date.now() + 5, label: 'description', value: 'The username for the user.', type: 'Text' },
        { id: Date.now() + 6, label: 'minLength', value: 3, type: 'Text' },
        { id: Date.now() + 7, label: 'maxLength', value: 20, type: 'Text' }
      ]
    }],

    [{
      id: Date.now() + 8,
      label: 'email',
      type: 'Group',
      inner: [
        { id: Date.now() + 9, label: 'type', value: 'string', type: 'Text' },
        { id: Date.now() + 10, label: 'format', value: 'email', type: 'Text' },
        { id: Date.now() + 11, label: 'description', value: "The user's email address.", type: 'Text' }
      ]
    }],
    [{
      id: Date.now() + 12,
      label: 'password',
      type: 'Group',
      inner: [
        { id: Date.now() + 13, label: 'type', value: 'string', type: 'Text' },
        { id: Date.now() + 14, label: 'description', value: "The user's password.", type: 'Text' },
        { id: Date.now() + 15, label: 'minLength', value: 8, type: 'Text' }
      ]
    }],

    [{
      id: Date.now() + 16,
      label: 'profile',
      type: 'Group',
      inner: [
        { id: Date.now() + 17, label: 'type', value: 'object', type: 'Text' },
        { id: Date.now() + 18, label: 'description', value: "The user's profile information.", type: 'Text' },
        {
          id: Date.now() + 19,
          label: 'properties',
          type: 'Group',
          inner: [
            { id: Date.now() + 20, label: 'firstName', type: 'Group', inner: [
                { id: Date.now() + 21, label: 'type', value: 'string', type: 'Text' },
                { id: Date.now() + 22, label: 'description', value: "The user's first name.", type: 'Text' }
              ]
            },
            { id: Date.now() + 23, label: 'lastName', type: 'Group', inner: [
                { id: Date.now() + 24, label: 'type', value: 'string', type: 'Text' },
                { id: Date.now() + 25, label: 'description', value: "The user's last name.", type: 'Text' }
              ]
            },
            { id: Date.now() + 26, label: 'age', type: 'Group', inner: [
                { id: Date.now() + 27, label: 'type', value: 'integer', type: 'Text' },
                { id: Date.now() + 28, label: 'description', value: "The user's age.", type: 'Text' },
                { id: Date.now() + 29, label: 'minimum', value: 0, type: 'Text' }
              ]
            },
            { id: Date.now() + 30, label: 'address', type: 'Group', inner: [
                { id: Date.now() + 31, label: 'type', value: 'object', type: 'Text' },
                { id: Date.now() + 32, label: 'description', value: "The user's address.", type: 'Text' },
                {
                  id: Date.now() + 33,
                  label: 'properties',
                  type: 'Group',
                  inner: [
                    { id: Date.now() + 34, label: 'street', type: 'Group', inner: [
                        { id: Date.now() + 35, label: 'type', value: 'string', type: 'Text' },
                        { id: Date.now() + 36, label: 'description', value: "The street part of the user's address.", type: 'Text' }
                      ]
                    },
                    { id: Date.now() + 37, label: 'city', type: 'Group', inner: [
                        { id: Date.now() + 38, label: 'type', value: 'string', type: 'Text' },
                        { id: Date.now() + 39, label: 'description', value: "The city part of the user's address.", type: 'Text' }
                      ]
                    },
                    { id: Date.now() + 40, label: 'state', type: 'Group', inner: [
                        { id: Date.now() + 41, label: 'type', value: 'string', type: 'Text' },
                        { id: Date.now() + 42, label: 'description', value: "The state part of the user's address.", type: 'Text' }
                      ]
                    },
                    { id: Date.now() + 43, label: 'postalCode', type: 'Group', inner: [
                        { id: Date.now() + 44, label: 'type', value: 'string', type: 'Text' },
                        { id: Date.now() + 45, label: 'description', value: "The postal code part of the user's address.", type: 'Text' },
                        { id: Date.now() + 46, label: 'pattern', value: '^[0-9]{5}(-[0-9]{4})?$', type: 'Text' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }],

    [{
      id: Date.now() + 47,
      label: 'createdAt',
      type: 'Group',
      inner: [
        { id: Date.now() + 48, label: 'type', value: 'string', type: 'Text' },
        { id: Date.now() + 49, label: 'description', value: "The date and time when the user was created.", type: 'Text' },
        { id: Date.now() + 50, label: 'format', value: 'date-time', type: 'Text' }
      ]
    }]
  ];

  const transformFormData = (data) => {
    const result = {};

    data.forEach(row => {
      if (Array.isArray(row)) {
        row.forEach(field => {
          if (field.type === 'Text') {
            result[field.label] = field.value;
          } else if (field.type === 'Group') {
            const groupData = {};
            if (Array.isArray(field.inner)) {
              field.inner.forEach(innerField => {
                if (innerField.type === 'Text') {
                  groupData[innerField.label] = innerField.value;
                } else if (innerField.type === 'Group') {
                  const innerGroupData = [];
                  if (Array.isArray(innerField.inner)) {
                    innerField.inner.forEach(innerInnerField => {
                      if (innerInnerField.type === 'Text') {
                        innerGroupData.push(innerInnerField.value);
                      }
                    });
                  }
                  groupData[innerField.label] = innerGroupData;
                }
              });
            }
            result[field.label] = groupData;
          }
        });
      }
    });

    return result;
  };

  const [formData, setFormData] = useState(initialFormData);
  const [jsonCode, setJSONCode] = useState(JSON.stringify(transformFormData(initialFormData), null, 2));
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonCode);
      const updatedFormData = convertJSONToFormData(parsedJson);
      setFormData(updatedFormData);
      setIsValidJson(true);
    } catch (error) {
      console.error('Invalid JSON:', error);
      setIsValidJson(false);
    }
  }, [jsonCode]);

  const convertJSONToFormData = (json) => {
    const formData = [];

    const parseObject = (obj) => {
      const result = [];
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const groupField = { id: Date.now() + Math.random(), label: key, type: 'Group', inner: [] };
          groupField.inner = parseObject(value);
          result.push(groupField);
        } else if (Array.isArray(value)) {
          const groupField = { id: Date.now() + Math.random(), label: key, type: 'Group', inner: [] };
          value.forEach((innerValue, index) => {
            groupField.inner.push({ id: Date.now() + Math.random(), label: String(index), value: innerValue, type: 'Text' });
          });
          result.push(groupField);
        } else {
          result.push({ id: Date.now() + Math.random(), label: key, value: value, type: 'Text' });
        }
      });
      return result;
    };

    Object.entries(json).forEach(([key, value]) => {
      const row = parseObject({ [key]: value });
      formData.push(row);
    });

    return formData;
  };


  const addField = (rowIndex, parentId) => {
    const newField = { id: Date.now(), label: '', value: '', type: 'Text' };

    const addFieldToGroup = (group) => {
      if (group.id === parentId && group.type === 'Group') {
        group.inner.push(newField);
      } else if (group.inner) {
        group.inner.forEach(addFieldToGroup);
      }
    };

    const updatedRows = formData.map((row, index) => {
      if (index === rowIndex) {
        return row.map((field) => {
          if (field.id === parentId && field.type === 'Group') {
            // If the parent is found, add the new field to its inner array
            addFieldToGroup(field);
          }
          return field;
        });
      }
      return row;
    });

    setFormData(updatedRows);
    setJSONCode(JSON.stringify(transformFormData(updatedRows), null, 2));
  };

  const deleteField = (id) => {
    const deleteFromGroup = (group) => {
      if (group.inner) {
        group.inner = group.inner.filter(innerField => innerField.id !== id);
        group.inner.forEach(deleteFromGroup);
      }
    };

    const updatedRows = formData.map(row => {
      row.forEach(deleteFromGroup);
      return row.filter(field => {
        if (field.id === id && field.label === 'ID') {
          alert('The ID field cannot be deleted.');
          return true; // Prevent deletion of ID fields
        }
        return field.id !== id;
      });
    }).filter(row => row.length > 0);

    setFormData(updatedRows);
    setJSONCode(JSON.stringify(transformFormData(updatedRows), null, 2));
  };

  const handleInputChange = (e, id) => {
    const updatedRows = formData.map(row =>
      row.map(field =>
        field.id === id ? { ...field, value: e.target.value } : field
      )
    );
    setFormData(updatedRows);
    setJSONCode(JSON.stringify(transformFormData(updatedRows), null, 2));
  };

  const handleLabelChange = (e, id) => {
    const updatedRows = formData.map(row =>
      row.map(field =>
        field.id === id ? { ...field, label: e.target.value } : field
      )
    );
    setFormData(updatedRows);
    setJSONCode(JSON.stringify(transformFormData(updatedRows), null, 2));
  };

  const generateJSONData = () => {
    const blob = new Blob([jsonCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.json';
    a.click();
    URL.revokeObjectURL(url);
  };


  const addNewObject = () => {
    // Define the structure of a new group with a 'group-label' field
    const newGroup = {
      id: Date.now() + Math.random(),
      type: 'Group',
      inner: [
        {
          id: Date.now() + Math.random() + 1,
          label: 'group-label',
          value: '',
          type: 'Text',
        },
        // Add more fields inside the group if necessary
      ],
    };

    // Append the new group to the existing formData
    const updatedFormData = [...formData, newGroup];
    setFormData(updatedFormData);

    // Update the JSON view
    const updatedJSON = JSON.stringify(updatedFormData.map(transformFormData), null, 2);
    setJSONCode(updatedJSON);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('No access token found. Please log in.');
        return;
    }
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const schema_name = prompt("Enter the schema name:", "GeneratedSchema");

    const bodyParameters = {
        schema_name: schema_name,
        json_data: JSON.parse(jsonCode)  // Parse the JSON string to an object
    };

    try {
        const response = await axios.post('http://localhost:8000/api/save-schema/', bodyParameters, config);
        console.log('Schema saved successfully:', response.data);
    } catch (error) {
        console.error('There was an error saving the schema:', error.response ? error.response.data : error.message);
    }
};

  const handleDragStart = (e, rowIndex) => {
    e.dataTransfer.setData("rowIndex", rowIndex);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedRowIndex = e.dataTransfer.getData("rowIndex");
    if (draggedRowIndex === null) return;
    if (draggedRowIndex === targetIndex.toString()) return; // No change if same position

    const updatedRows = [...formData];
    const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
    updatedRows.splice(targetIndex, 0, draggedRow);

    setFormData(updatedRows);
    const updatedJSON = JSON.stringify(transformFormData(updatedRows), null, 2);
    setJSONCode(updatedJSON);
  };

  const renderField = (field, rowIndex, parentFieldId = null) => {
    if (field.type === 'Group') {
      return (
        <div key={field.id} className='input-container group-container'>
          <div className='group-label'>
            <label>
              <input
                value={field.label}
                onChange={(e) => handleLabelChange(e, field.id, parentFieldId)}
                onClick={(e) => e.stopPropagation()}
                className='label-field'
              />
            </label>
            <div className='innerButtons'>
              <span className='status-icon add-icon' onClick={() => addField(rowIndex, field.id)}><addIcon/></span>
              <span className='status-icon delete-icon' onClick={() => deleteField(field.id)}><binIcon/></span>
              <span className='status-icon drag-icon'><arrowsIcon/></span>
            </div>
          </div>

          <div className='group-fields'>
            {field.inner.map(innerField => renderField(innerField, rowIndex, field.id))}
          </div>
        </div>
      );
    }

    return (
        <div key={field.id}
          className='input-container'
          draggable
          onDragStart={(e) => handleDragStart(e, rowIndex)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, rowIndex)}
        >
            <div className='input-wrapper'>
              <label classname='label-field'>
                <input
                    value={field.label}
                    onChange={(e) => handleLabelChange(e, field.id)}
                    onClick={(e) => e.stopPropagation()}
                    className='label-field'
                />
              </label>

              <input
                className='value-input'
                type='text'
                value={field.value}
                onChange={(e) => handleInputChange(e, field.id)}
              />
                <span className='status-icon drag-icon'><arrowsIcon/></span>
                <span className='status-icon add-icon' onClick={() => addField(0)}><addIcon/></span>
                <span className='status-icon delete-icon' onClick={() => deleteField(field.id)}><binIcon/></span>


            </div>
        </div>
    );
  };
  return (
    <div className='json-editor-container'>
      <div className='editor'>

        <div className='visual-editor'>
          <div className="visual-editor-header">
            <h3>Visual Editor</h3>
            <button className='add-button' onClick={addNewObject}>+</button>
          </div>
          {formData.map((row, rowIndex) => (
            <div
                key={rowIndex}
                className='input-row'
                draggable
                onDragStart={(e) => handleDragStart(e, rowIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, rowIndex)}
                onDragEnd={handleDragEnd}>
                {row.map(field => renderField(field, rowIndex))}
            </div>
          ))}
        </div>

        <div className='code-editor'>
          <h3>Code Editor</h3>
          <textarea
            className='code-area'
            value={jsonCode}
            onChange={(e) => setJSONCode(e.target.value)}
            style={{ width: '100%', height: '100%'}}
          />
        </div>

      </div>

      <div className='buttons'>
        <button onClick={generateJSONData}>Generate JSON Data</button>
        <button onClick={handleSubmit}>Save JSON Document</button>
      </div>
    </div>


  );
};

export default JSONEditor;
