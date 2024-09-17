import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JSONEditor.css';
import binIcon from '../../assets/bin.png';
import arrowsIcon from '../../assets/arrows.png';
import addIcon from '../../assets/add.png';

const JSONEditor = () => {
  const initialFormData = [
    [{ id: Date.now(), label: 'ID', value: 'SML', type: 'Text' }],
    [{ id: Date.now() + 1, label: 'SortAs', value: 'SGML', type: 'Text' }],
    [{ id: Date.now() + 2, label: 'GlossTerm', value: 'Standard Generalized Markup Language', type: 'Text' }],
    [{ id: Date.now() + 3, label: 'Acronym', value: 'SGML', type: 'Text' }],
    [{ id: Date.now() + 4, label: 'Abbrev', value: 'ISO 8879:198', type: 'Text' }],
    [{
      id: Date.now() + 5,
      label: 'GlossDef',
      type: 'Group',
      inner: [
        { id: Date.now() + 6, label: 'para', value: 'A meta-markup', type: 'Text' },
        {
          id: Date.now() + 7,
          label: 'GlossSeeAlso',
          type: 'Group',
          inner: [
            { id: Date.now() + 8, label: '1', value: 'GML', type: 'Text' },
            { id: Date.now() + 9, label: '2', value: 'XML', type: 'Text' },
          ]
        }
      ]
    }],
    [{ id: Date.now() + 10, label: 'GlossSee', value: 'markup', type: 'Text' }]
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
      if (group.id === parentId) {
        if (!group.inner) {
          group.inner = [];
        }
        group.inner.push(newField);
      } else if (group.inner) {
        group.inner.forEach(addFieldToGroup);
      }
    };

    const updatedRows = formData.map((row, index) => {
      if (index === rowIndex) {
        let fieldAdded = false;

        // Check if the parentId exists in the current row
        const newRow = row.map(field => {
          if (field.id === parentId && field.type === 'Group') {
            addFieldToGroup(field);
            fieldAdded = true;
          }
          return field;
        });

        if (!fieldAdded) {
          // Add the new field directly to the row and place it under the current parent
          const parentIndex = row.findIndex(field => field.id === parentId);
          if (parentIndex !== -1) {
            newRow.splice(parentIndex + 1, 0, newField); // Insert the new field right after the parent
          } else {
            newRow.push(newField); // If parentId is not found, add it to the end
          }
        }

        return newRow;
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

  const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const addNewObject = () => {
    const newObjectTemplate = deepCopy(initialFormData);
    const newObject = newObjectTemplate.map(row => row.map(field => ({
      ...field,
      id: Date.now() + Math.random(),
      value: field.value,
    })));

    const updatedFormData = [...formData, ...newObject];
    setFormData(updatedFormData);

    const updatedJSON = JSON.stringify(updatedFormData.map(transformFormData), null, 2);
    setJSONCode(updatedJSON);
  };

  const handleSubmit = () => {
    try {
        // If jsonCode is a stringified JSON, use JSON.parse to convert it to an object
        const jsonData = JSON.parse(jsonCode);

        axios.post('http://localhost:8000/api/save-json/', jsonData)
            .then(response => {
                console.log(response.data);  // Handle successful response
            })
            .catch(error => {
                console.error('There was an error saving the JSON data!', error);
            });
    } catch (e) {
        console.error('Invalid JSON format!', e);  // Handle JSON parsing error
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
    const isIDField = field.label === 'ID';

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
                    disabled={isIDField}
                    className={isIDField ? 'ID-input' : 'label-field'}
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

                {isIDField && (
                    <button className='unique-button'>Unique</button>
                )}
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
