import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
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
import './JSONEditor.css';
import addIcon from '../../assets/add.png';
import binIcon from '../../assets/bin.png';

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

const JSONEditor = () => {
  const generateId = () => Date.now() + Math.random();

  const [formData, setFormData] = useState([
    {
      id: generateId().toString(),
      label: 'title',
      type: 'string',
      description: 'The title of the schema.',
      dataType: 'string',
      isMandatory: true, // Indicates this is a mandatory field that cannot be deleted
    },
    {
      id: generateId().toString(),
      label: 'description',
      type: 'string',
      description: 'A description of the schema.',
      dataType: 'string',
      isMandatory: true, // Indicates this is a mandatory field that cannot be deleted
    }
  ]);
  const [jsonCode, setJSONCode] = useState('{}');
  const jsonCodeFromEditor = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const addNewField = useCallback((parentId) => {
    const newField = {
      id: generateId().toString(),
      label: 'newField',
      type: 'string',
      description: '',
      dataType: 'string',
      children: [],
    };

    setFormData((prevFormData) => {
      if (!parentId) {
        return [...prevFormData, newField];
      }

      const addFieldToParent = (fields) =>
        fields.map((field) => {
          if (field.id === parentId) {
            return {
              ...field,
              children: [...(field.children || []), newField],
            };
          } else if (field.children) {
            return {
              ...field,
              children: addFieldToParent(field.children),
            };
          }
          return field;
        });

      return addFieldToParent(prevFormData);
    });
  }, []);

  const deleteField = useCallback((id) => {
    const removeField = (fields) => 
      fields
        .filter((field) => field.id !== id || field.isMandatory)
        .map((field) => ({
          ...field,
          children: field.children ? removeField(field.children) : [],
        }));

    setFormData((prev) => removeField(prev));
  }, []);

  const handleInputChange = (id, field, value) => {
    const updateField = (fields) =>
      fields.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        if (item.children) {
          return { ...item, children: updateField(item.children) };
        }
        return item;
      });

    setFormData((prevFormData) => updateField(prevFormData));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = formData.findIndex((item) => item.id === active.id);
      const newIndex = formData.findIndex((item) => item.id === over.id);

      const newFormData = [...formData];
      const [movedItem] = newFormData.splice(oldIndex, 1);
      newFormData.splice(newIndex, 0, movedItem);

      setFormData(newFormData);
    }
  };

  const convertFormDataToJson = (fields) => {
    const jsonObject = {
      title: '',
      description: '',
      properties: {},
    };
  
    fields.forEach((field) => {
      // Handle the root-level title and description separately.
      if (field.label === 'title') {
        jsonObject.title = field.description || 'Title of schema';
      } else if (field.label === 'description') {
        jsonObject.description = field.description || 'Description of schema';
      } else {
        // Process other fields into properties.
        const processFields = (fields) =>
          fields.reduce((acc, field) => {
            const fieldData = {
              type: field.type,
              description: field.description,
              dataType: field.dataType,
            };
  
            // Include minLength and maxLength if present and applicable.
            if (field.minLength !== undefined && field.minLength !== '') {
              fieldData.minLength = parseInt(field.minLength, 10);
            }
            if (field.maxLength !== undefined && field.maxLength !== '') {
              fieldData.maxLength = parseInt(field.maxLength, 10);
            }
  
            // Process nested properties if this field is an object.
            if (field.children && field.children.length > 0) {
              fieldData.properties = processFields(field.children);
            }
  
            acc[field.label] = fieldData;
            return acc;
          }, {});
  
        jsonObject.properties = {
          ...jsonObject.properties,
          ...processFields([field]),
        };
      }
    });
  
    return jsonObject;
  }
  

  const convertJsonToFormData = (json) => {
    const formData = [
      {
        id: generateId().toString(),
        label: 'title',
        type: 'string',
        description: json.title || '',
        dataType: '',
        isMandatory: true,
      },
      {
        id: generateId().toString(),
        label: 'description',
        type: 'string',
        description: json.description || '',
        dataType: '',
        isMandatory: true,
      }
    ];
  
    const processFields = (obj, parentKey = null) =>
      Object.keys(obj).map((key) => {
        const field = obj[key];
        const id = generateId().toString();
  
        return {
          id,
          label: key,
          type: field.type || 'string',
          description: field.description || '',
          dataType: field.type === 'object' ? 'object' : field.dataType || '',
          minLength: field.minLength || '',
          maxLength: field.maxLength || '',
          children: field.properties ? processFields(field.properties, id) : [],
        };
      });
  
    if (json.properties) {
      formData.push(...processFields(json.properties));
    }
  
    return formData;
  };
  

  useEffect(() => {
    if (!jsonCodeFromEditor.current) {
      const jsonObject = convertFormDataToJson(formData);
      setJSONCode(JSON.stringify(jsonObject, null, 2));
    }
    jsonCodeFromEditor.current = false;
  }, [formData]);

  useEffect(() => {
    if (jsonCodeFromEditor.current) {
      try {
        const parsedJson = JSON.parse(jsonCode);
        const newFormData = convertJsonToFormData(parsedJson);
        setFormData(newFormData);
      } catch (error) {
        console.error('Invalid JSON format:', error);
      }
    }
  }, [jsonCode]);

  const handleJsonChange = (e) => {
    jsonCodeFromEditor.current = true;
    setJSONCode(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const schemaName = prompt('Enter the schema name:', 'GeneratedSchema');
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:8000/api/save-schema/',
        {
          schema_name: schemaName,
          json_data: JSON.parse(jsonCode),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Schema saved:', response.data);
    } catch (error) {
      console.error('Error saving schema:', error);
    }
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

  return (
    <div className="mycontainer">
      <div className="editor">
        <div className="container visual-editor">
          <div className="visual-editor-header">
            <h3>Visual Editor</h3>
            <button className="add-button" onClick={() => addNewField(null)}>
              +
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={formData.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="fields-container">
                {formData.map((field, index) => (
                  <SortableItem
                    key={field.id}
                    field={field}
                    path={[index]}
                    onInputChange={handleInputChange}
                    addNewField={addNewField}
                    deleteField={deleteField}
                  />
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
            onChange={handleJsonChange}
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

const SortableItem = ({ field, path, onInputChange, addNewField, deleteField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determine if the field should not show a dataType selector
  const isTitleOrDescription = field.label === 'title' || field.label === 'description';

  // Determine if the field needs minLength and maxLength inputs based on its dataType
  const requiresLength = ['number', 'alphanumeric', 'numberRange', 'bankAccountNums'].includes(
    field.dataType
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="input-container group-container"
    >
      <div className="group-label">
        <input
          type="text"
          value={field.label}
          onChange={(e) => onInputChange(field.id, 'label', e.target.value)}
          className="label-field"
          placeholder="Field Name"
          readOnly={isTitleOrDescription} // Prevent changing the label of title and description
        />
        <div className="innerButtons">
          {!isTitleOrDescription && (
            <button className="status-icon add-icon" onClick={() => addNewField(field.id)}>
              <img src={addIcon} alt="Add" />
            </button>
          )}
          {!field.isMandatory && (
            <button className="status-icon delete-icon" onClick={() => deleteField(field.id)}>
              <img src={binIcon} alt="Delete" />
            </button>
          )}
        </div>
      </div>

      {/* Data Type Selector: Show only if it's not title or description */}
      {!isTitleOrDescription && (
        <select
          value={field.dataType}
          onChange={(e) => onInputChange(field.id, 'dataType', e.target.value)}
          className="value-input"
        >
          <option value="">Select Data Type</option>
          {DATA_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>
      )}

      {/* Description Field Input */}
      <input
        type="text"
        value={field.description}
        onChange={(e) => onInputChange(field.id, 'description', e.target.value)}
        className="value-input"
        placeholder="Description"
      />

      {/* MinLength and MaxLength Inputs - shown only if the dataType requires them */}
      {requiresLength && (
        <>
          <input
            type="number"
            value={field.minLength || ''}
            onChange={(e) => onInputChange(field.id, 'minLength', e.target.value)}
            className="value-input"
            placeholder="Min Length"
          />
          <input
            type="number"
            value={field.maxLength || ''}
            onChange={(e) => onInputChange(field.id, 'maxLength', e.target.value)}
            className="value-input"
            placeholder="Max Length"
          />
        </>
      )}

      {/* Render nested fields if present */}
      {field.children && field.children.length > 0 && (
        <div className="fields-container">
          {field.children.map((child, index) => (
            <SortableItem
              key={child.id}
              field={child}
              path={path.concat(index)}
              onInputChange={onInputChange}
              addNewField={addNewField}
              deleteField={deleteField}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default JSONEditor;
