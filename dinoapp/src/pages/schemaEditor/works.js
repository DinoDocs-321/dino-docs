import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './JSONEditor.css';
import binIcon from '../../assets/bin.png';
import addIcon from '../../assets/add.png';
import { useLocation } from 'react-router-dom';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const JSONEditor = () => {
  const location = useLocation();
  const { savedData } = location.state || {};

  const DATA_TYPES = [
    { value: 'names', label: 'Names', type: 'string' },
    { value: 'phoneFax', label: 'Phone / Fax', type: 'string' },
    { value: 'email', label: 'Email', type: 'string' },
    { value: 'date', label: 'Date', type: 'string', format: 'date' },
    { value: 'time', label: 'Time', type: 'string', format: 'time' },
    { value: 'company', label: 'Company', type: 'string' },
    { value: 'streetAddress', label: 'Street Address', type: 'string' },
    { value: 'city', label: 'City', type: 'string' },
    { value: 'postalZip', label: 'Postal / Zip', type: 'string' },
    { value: 'region', label: 'Region', type: 'string' },
    { value: 'country', label: 'Country', type: 'string' },
    {
      value: 'latitudeLongitude',
      label: 'Latitude/Longitude',
      type: 'array',
      items: { type: 'number' },
    },
    { value: 'fixedNumberOfWords', label: 'Fixed Number of Words', type: 'integer' },
    { value: 'randomNumber', label: 'Random Number', type: 'integer' },
    { value: 'alphanumeric', label: 'Alphanumeric', type: 'string' },
    { value: 'boolean', label: 'Boolean', type: 'boolean' },
    { value: 'autoIncrement', label: 'Auto Increment', type: 'integer' },
    { value: 'numberRange', label: 'Number Range', type: 'number' },
    { value: 'normalDistribution', label: 'Normal Distribution', type: 'number' },
    { value: 'guid', label: 'GUID', type: 'string' },
    { value: 'constant', label: 'Constant', type: 'string' },
    { value: 'computed', label: 'Computed', type: 'string' },
    { value: 'list', label: 'List', type: 'array', items: { type: 'string' } },
    { value: 'weightedList', label: 'Weighted List', type: 'array', items: { type: 'string' } },
    { value: 'colour', label: 'Colour', type: 'string' },
    { value: 'url', label: 'URL', type: 'string', format: 'url' },
    { value: 'currency', label: 'Currency', type: 'string' },
    { value: 'bankAccountNums', label: 'Bank Account Numbers', type: 'string' },
    { value: 'cvv', label: 'CVV', type: 'integer' },
    { value: 'pin', label: 'PIN', type: 'integer' },
    { value: 'object', label: 'Object', type: 'object' },
    { value: 'array', label: 'Array', type: 'array' },
  ];

  const initialJSONData = {
    type: 'object',
    title: 'User',
    description: 'A schema representing a user in the system.',
    properties: {
      id: {
        type: 'string',
        description: 'The unique identifier for a user.',
        dataType: 'alphanumeric',
      },
      username: {
        type: 'string',
        description: 'The username for the user.',
        dataType: 'names',
        minLength: 3,
        maxLength: 20,
      },
      email: {
        type: 'string',
        description: "The user's email address.",
        dataType: 'email',
      },
      password: {
        type: 'string',
        description: "The user's password.",
        dataType: 'alphanumeric',
        minLength: 8,
      },
      profile: {
        type: 'object',
        description: "The user's profile information.",
        properties: {
          firstName: {
            type: 'string',
            description: "The user's first name.",
            dataType: 'names',
          },
          lastName: {
            type: 'string',
            description: "The user's last name.",
            dataType: 'names',
          },
          age: {
            type: 'integer',
            description: "The user's age.",
            dataType: 'randomNumber',
            minimum: 0,
          },
          address: {
            type: 'object',
            description: "The user's address.",
            properties: {
              street: {
                type: 'string',
                description: "The street part of the user's address.",
                dataType: 'streetAddress',
              },
              city: {
                type: 'string',
                description: "The city part of the user's address.",
                dataType: 'city',
              },
              state: {
                type: 'string',
                description: "The state part of the user's address.",
                dataType: 'city',
              },
              postalCode: {
                type: 'string',
                description: "The postal code part of the user's address.",
                dataType: 'postalZip',
                pattern: '^[0-9]{5}(-[0-9]{4})?$',
              },
            },
          },
        },
      },
    },
  };

  const defaultJSONData = savedData || initialJSONData;

  const generateId = () => Date.now() + Math.random();

  const defaultProperties = [
    {
      id: generateId(),
      label: 'type',
      value: 'string',
      type: 'Text',
    },
    {
      id: generateId(),
      label: 'description',
      value: '',
      type: 'Text',
    },
    {
      id: generateId(),
      label: 'dataType',
      value: '',
      type: 'Text',
    },
  ];

  const convertJSONToFormData = (json) => {
    const parseObject = (obj) => {
      return Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return {
            id: generateId(),
            label: key,
            type: 'Group',
            inner: parseObject(value),
          };
        } else {
          return {
            id: generateId(),
            label: key,
            value: value,
            type: 'Text',
          };
        }
      });
    };
    return parseObject(json);
  };

  const transformFormData = (fields) => {
    const result = {};
    const processFields = (fields) => {
      const res = {};
      fields.forEach((field) => {
        if (field.type === 'Text') {
          res[field.label] = parseValue(field.value);
        } else if (field.type === 'Group') {
          res[field.label] = processFields(field.inner || []);
        }
      });
      return res;
    };
    return processFields(fields);
  };

  const parseValue = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const initialFormData = convertJSONToFormData(defaultJSONData);
  const [jsonCode, setJSONCode] = useState(savedData ? JSON.stringify(savedData, null, 2) : '');
  const [formData, setFormData] = useState(initialFormData);
  const [isValidJson, setIsValidJson] = useState(true);
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

  useEffect(() => {
    if (savedData) {
      setJSONCode(JSON.stringify(savedData, null, 2));
      const updatedFormData = convertJSONToFormData(savedData);
      setFormData(updatedFormData);
    }
  }, [savedData]);

  const addField = (parentField) => {
    const newField = { id: generateId(), label: '', value: '', type: 'Text' };
    parentField.inner = parentField.inner || [];
    parentField.inner.push(newField);
    setFormData([...formData]);
  };

  const addNewObject = () => {
    const newGroup = {
      id: generateId(),
      type: 'Group',
      label: 'newField',
      inner: defaultProperties,
    };
    setFormData([...formData, newGroup]);
  };

  // DnD Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    const activePath = findFieldPathById(formData, active.id);
    const overPath = findFieldPathById(formData, over.id);

    if (!activePath || !overPath) return;

    const updatedFormData = [...formData];
    const activeField = getFieldByPath(updatedFormData, activePath);

    removeFieldByPath(updatedFormData, activePath);
    insertFieldAtPath(updatedFormData, overPath, activeField);

    setFormData(updatedFormData);
  };

  const findFieldPathById = (fields, id, path = []) => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.id === id) {
        return path.concat(i);
      } else if (field.type === 'Group' && field.inner) {
        const innerPath = findFieldPathById(field.inner, id, path.concat(i, 'inner'));
        if (innerPath) return innerPath;
      }
    }
    return null;
  };

  const getFieldByPath = (fields, path) => {
    return path.reduce((acc, key) => acc[key], fields);
  };

  const removeFieldByPath = (fields, path) => {
    const lastKey = path.pop();
    const parent = getFieldByPath(fields, path);
    if (Array.isArray(parent)) {
      parent.splice(lastKey, 1);
    } else if (parent && parent.inner) {
      parent.inner.splice(lastKey, 1);
    }
  };

  const insertFieldAtPath = (fields, path, field) => {
    const lastKey = path.pop();
    const parent = getFieldByPath(fields, path);
    if (Array.isArray(parent)) {
      parent.splice(lastKey, 0, field);
    } else if (parent && parent.inner) {
      parent.inner.splice(lastKey, 0, field);
    }
  };

  const nonEditableLabels = ['type', 'description', 'dataType'];

  const SortableItem = ({ field, path = [] }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: field.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    if (field.type === 'Group') {
      return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group-container">
          <div className="group-label">
            <label>
              <input
                value={field.label}
                onChange={(e) => handleLabelChange(e, path)}
                className="label-field"
              />
            </label>
            <div className="innerButtons">
              <span className="status-icon add-icon" onClick={() => addField(field)}>
                <img src={addIcon} alt="Add" />
              </span>
              <span className="status-icon delete-icon" onClick={() => deleteField(path)}>
                <img src={binIcon} alt="Delete" />
              </span>
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={field.inner || []} strategy={verticalListSortingStrategy}>
              <div className="group-fields">
                {field.inner &&
                  field.inner.map((innerField, idx) => (
                    <SortableItem
                      key={innerField.id}
                      field={innerField}
                      path={path.concat(['inner', idx])}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      );
    }

    const isNonEditable = nonEditableLabels.includes(field.label);

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="input-container">
        <div className="input-wrapper">
          <label className="label-field">
            <input
              value={field.label}
              onChange={(e) => handleLabelChange(e, path)}
              className="label-field"
              readOnly={isNonEditable}
            />
          </label>
          {field.label === 'dataType' ? (
            <select
              className="value-input"
              value={field.value}
              onChange={(e) => handleInputChange(e, path)}
            >
              <option value="">Select Data Type</option>
              {DATA_TYPES.map((dataType) => (
                <option key={dataType.value} value={dataType.value}>
                  {dataType.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="value-input"
              type="text"
              value={field.value}
              onChange={(e) => handleInputChange(e, path)}
            />
          )}
          <div className="innerButtons">
            <span className="status-icon delete-icon" onClick={() => deleteField(path)}>
              <img src={binIcon} alt="Delete" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleLabelChange = (e, path) => {
    const updatedFormData = [...formData];
    const field = getFieldByPath(updatedFormData, path);
    const isNonEditable = nonEditableLabels.includes(field.label);
    if (!isNonEditable) {
      field.label = e.target.value;
      setFormData(updatedFormData);
    }
  };

  const handleInputChange = (e, path) => {
    const updatedFormData = [...formData];
    const field = getFieldByPath(updatedFormData, path);
    field.value = e.target.value;
    setFormData(updatedFormData);
  };

  const deleteField = (path) => {
    const updatedFormData = [...formData];
    removeFieldByPath(updatedFormData, path);
    setFormData(updatedFormData);
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
      json_data: JSON.parse(jsonCode),
    };

    try {
      const response = await axios.post(
        'http://localhost:8000/api/save-schema/',
        bodyParameters,
        config
      );
      console.log('Schema saved successfully:', response.data);
    } catch (error) {
      console.error(
        'There was an error saving the schema:',
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="mycontainer">
      <div className="editor">
        <div className="container visual-editor">
          <div className="visual-editor-header">
            <h3>Visual Editor</h3>
            <button className="add-button" onClick={addNewObject}>
              +
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={formData} strategy={verticalListSortingStrategy}>
              <div className="fields-container">
                {formData.map((field, index) => (
                  <SortableItem key={field.id} field={field} path={[index]} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="code-editor container">
          <h3>Code Editor</h3>
          <textarea
            className="code-area"
            value={jsonCode}
            onChange={(e) => {
              jsonCodeFromEditor.current = true;
              setJSONCode(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="cusButtons">
        <button className="cusbtn" onClick={generateJSONData}>
          Generate JSON Data
        </button>
        <button className="cusbtn" onClick={handleSubmit}>
          Save JSON Document
        </button>
      </div>
    </div>
  );
};

export default JSONEditor;
