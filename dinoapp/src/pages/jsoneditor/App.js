import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './JSONEditor.css';
import binIcon from '../../assets/bin.png';
import arrowsIcon from '../../assets/arrows.png';
import addIcon from '../../assets/add.png';

const JSONEditor = () => {
  // The JSON schema provided by the user
  const initialJSONData = {
    "type": "object",
    "title": "User",
    "description": "A schema representing a user in the system.",
    "properties": {
      "id": {
        "type": "integer",
        "description": "The unique identifier for a user."
      },
      "username": {
        "type": "string",
        "description": "The username for the user.",
        "minLength": 3,
        "maxLength": 20
      },
      "email": {
        "type": "string",
        "format": "email",
        "description": "The user's email address."
      },
      "password": {
        "type": "string",
        "description": "The user's password.",
        "minLength": 8
      },
      "profile": {
        "type": "object",
        "description": "The user's profile information.",
        "properties": {
          "firstName": {
            "type": "string",
            "description": "The user's first name."
          },
          "lastName": {
            "type": "string",
            "description": "The user's last name."
          },
          "age": {
            "type": "integer",
            "description": "The user's age.",
            "minimum": 0
          },
          "address": {
            "type": "object",
            "description": "The user's address.",
            "properties": {
              "street": {
                "type": "string",
                "description": "The street part of the user's address."
              },
              "city": {
                "type": "string",
                "description": "The city part of the user's address."
              },
              "state": {
                "type": "string",
                "description": "The state part of the user's address."
              },
              "postalCode": {
                "type": "string",
                "description": "The postal code part of the user's address.",
                "pattern": "^[0-9]{5}(-[0-9]{4})?$"
              }
            }
          }
        }
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "description": "The date and time when the user was created."
      }
    }
  };

  // Helper function to generate unique IDs
  const generateId = () => {
    return Date.now() + Math.random();
  };

  // Function to convert JSON data to formData structure
  const convertJSONToFormData = (json) => {
    const formData = [];

    const parseObject = (obj) => {
      const result = [];
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const groupField = { id: generateId(), label: key, type: 'Group', inner: [] };
          groupField.inner = parseObject(value);
          result.push(groupField);
        } else if (Array.isArray(value)) {
          const groupField = { id: generateId(), label: key, type: 'Group', inner: [] };
          value.forEach((innerValue, index) => {
            groupField.inner.push({ id: generateId(), label: String(index), value: innerValue, type: 'Text' });
          });
          result.push(groupField);
        } else {
          result.push({ id: generateId(), label: key, value: value, type: 'Text' });
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

  // Initialize formData by converting the initial JSON data
  const initialFormData = convertJSONToFormData(initialJSONData);

  const transformFormData = (data) => {
    const result = {};

    const processFields = (fields) => {
      const res = {};
      fields.forEach((field) => {
        if (field.type === 'Text') {
          res[field.label] = field.value;
        } else if (field.type === 'Group') {
          res[field.label] = processFields(field.inner || []);
        }
      });
      return res;
    };

    data.forEach((row) => {
      if (Array.isArray(row)) {
        row.forEach((field) => {
          if (field.type === 'Text') {
            result[field.label] = field.value;
          } else if (field.type === 'Group') {
            result[field.label] = processFields(field.inner || []);
          }
        });
      }
    });

    return result;
  };

  const [formData, setFormData] = useState(initialFormData);
  const [jsonCode, setJSONCode] = useState(JSON.stringify(initialJSONData, null, 2));
  const [isValidJson, setIsValidJson] = useState(true);

  // Ref to track if jsonCode was changed from the Code Editor
  const jsonCodeFromEditor = useRef(false);

  useEffect(() => {
    if (jsonCodeFromEditor.current) {
      try {
        const parsedJson = JSON.parse(jsonCode);
        const updatedFormData = convertJSONToFormData(parsedJson);
        setFormData(updatedFormData);
        setIsValidJson(true);
      } catch (error) {
        console.error('Invalid JSON:', error);
        setIsValidJson(false);
      }
      jsonCodeFromEditor.current = false;
    }
  }, [jsonCode]);

  useEffect(() => {
    if (!jsonCodeFromEditor.current) {
      setJSONCode(JSON.stringify(transformFormData(formData), null, 2));
    }
  }, [formData]);

  const addField = (rowIndex, parentId) => {
    const newField = { id: generateId(), label: '', value: '', type: 'Text' };

    if (!parentId) {
      // Add new field to the root level of the specified row
      const updatedRows = formData.map((row, index) => {
        if (index === rowIndex) {
          return [...row, newField];
        }
        return row;
      });

      setFormData(updatedRows);
      return;
    }

    const addFieldToGroup = (field) => {
      if (field.id === parentId && field.type === 'Group') {
        return {
          ...field,
          inner: [...field.inner, newField],
        };
      } else if (field.type === 'Group' && field.inner) {
        return {
          ...field,
          inner: field.inner.map(addFieldToGroup),
        };
      }
      return field;
    };

    const updatedRows = formData.map((row, index) => {
      if (index === rowIndex) {
        return row.map(addFieldToGroup);
      }
      return row;
    });

    setFormData(updatedRows);
  };

  const deleteField = (id) => {
    const deleteFromGroup = (field) => {
      if (field.id === id) {
        return null; // Mark field for removal
      }
      if (field.type === 'Group' && field.inner) {
        const updatedInner = field.inner
          .map(deleteFromGroup)
          .filter(Boolean); // Remove null entries
        return { ...field, inner: updatedInner };
      }
      return field;
    };

    const updatedRows = formData
      .map((row) => row.map(deleteFromGroup).filter(Boolean))
      .filter((row) => row.length > 0);

    setFormData(updatedRows);
  };

  const handleInputChange = (e, id) => {
    const updatedRows = formData.map((row) => {
      return row.map((field) => updateFieldValue(field, id, e.target.value));
    });

    setFormData(updatedRows);
  };

  const updateFieldValue = (field, id, newValue) => {
    if (field.id === id) {
      return { ...field, value: newValue };
    } else if (field.type === 'Group' && field.inner) {
      return {
        ...field,
        inner: field.inner.map((innerField) => updateFieldValue(innerField, id, newValue)),
      };
    }
    return field;
  };

  const handleLabelChange = (e, id) => {
    const updatedRows = formData.map((row) => {
      return row.map((field) => updateFieldLabel(field, id, e.target.value));
    });

    setFormData(updatedRows);
  };

  const updateFieldLabel = (field, id, newLabel) => {
    if (field.id === id) {
      return { ...field, label: newLabel };
    } else if (field.type === 'Group' && field.inner) {
      return {
        ...field,
        inner: field.inner.map((innerField) => updateFieldLabel(innerField, id, newLabel)),
      };
    }
    return field;
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
    const newGroup = {
      id: generateId(),
      type: 'Group',
      label: 'newGroup',
      inner: [
        {
          id: generateId(),
          label: 'property',
          value: '',
          type: 'Text',
        },
      ],
    };

    // Wrap newGroup in an array to maintain the formData structure
    const updatedFormData = [...formData, [newGroup]];
    setFormData(updatedFormData);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found. Please log in.');
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const schema_name = prompt('Enter the schema name:', 'GeneratedSchema');

    const bodyParameters = {
      schema_name: schema_name,
      json_data: JSON.parse(jsonCode), // Parse the JSON string to an object
    };

    try {
      const response = await axios.post('http://localhost:8000/api/save-schema/', bodyParameters, config);
      console.log('Schema saved successfully:', response.data);
    } catch (error) {
      console.error('There was an error saving the schema:', error.response ? error.response.data : error.message);
    }
  };

  const handleDragStart = (e, rowIndex) => {
    e.dataTransfer.setData('rowIndex', rowIndex);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedRowIndex = e.dataTransfer.getData('rowIndex');
    if (draggedRowIndex === null) return;
    if (draggedRowIndex === targetIndex.toString()) return; // No change if same position

    const updatedRows = [...formData];
    const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
    updatedRows.splice(targetIndex, 0, draggedRow);

    setFormData(updatedRows);
  };

  const renderField = (field, rowIndex, parentFieldId = null) => {
    if (field.type === 'Group') {
      return (
        <div key={field.id} className='input-container group-container'>
          <div className='group-label'>
            <label>
              <input
                value={field.label}
                onChange={(e) => handleLabelChange(e, field.id)}
                onClick={(e) => e.stopPropagation()}
                className='label-field'
              />
            </label>
            <div className='innerButtons'>
              <span className='status-icon add-icon' onClick={() => addField(rowIndex, field.id)}>
                <img src={addIcon} alt='Add' />
              </span>
              <span className='status-icon delete-icon' onClick={() => deleteField(field.id)}>
                <img src={binIcon} alt='Delete' />
              </span>
              <span className='status-icon drag-icon'>
                <img src={arrowsIcon} alt='Drag' />
              </span>
            </div>
          </div>

          <div className='group-fields'>
            {field.inner.map((innerField) => renderField(innerField, rowIndex, field.id))}
          </div>
        </div>
      );
    }

    return (
      <div key={field.id} className='input-container'>
        <div className='input-wrapper'>
          <label className='label-field'>
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
          <div className='innerButtons'>
            <span className='status-icon drag-icon'>
              <img src={arrowsIcon} alt='Drag' />
            </span>
            <span className='status-icon add-icon' onClick={() => addField(rowIndex, parentFieldId)}>
              <img src={addIcon} alt='Add' />
            </span>
            <span className='status-icon delete-icon' onClick={() => deleteField(field.id)}>
              <img src={binIcon} alt='Delete' />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='json-editor-container'>
      <div className='editor'>
        <div className='visual-editor'>
          <div className='visual-editor-header'>
            <h3>Visual Editor</h3>
            <button className='add-button' onClick={addNewObject}>
              +
            </button>
          </div>
          {formData.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className='input-row'
              draggable
              onDragStart={(e) => handleDragStart(e, rowIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, rowIndex)}
              onDragEnd={handleDragEnd}
            >
              {row.map((field) => renderField(field, rowIndex))}
            </div>
          ))}
        </div>

        <div className='code-editor'>
          <h3>Code Editor</h3>
          <textarea
            className='code-area'
            value={jsonCode}
            onChange={(e) => {
              jsonCodeFromEditor.current = true;
              setJSONCode(e.target.value);
            }}
            style={{ width: '100%', height: '100%' }}
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
