import React from 'react';
import { getUniqueId } from '../../utils/uniqueID'; // Import getUniqueId function

function Field(props) {
    const {
        field,
        index,
        dataTypes,
        dispatch,
        onRemove,
        parentField,
        handleDragStart,
        handleDragOver,
        handleDrop,
    } = props;

    function handleChange(key, value) {
        dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, key: key, value: value });
    }

    function addNestedField() {
        const newField = {
            id: getUniqueId(),
            keyTitle: '',
            dataType: '',
            description: '',
            attributes: {},
            properties: [],
            items: null,
        };
        dispatch({
            type: 'UPDATE_FIELD',
            fieldId: field.id,
            key: 'properties',
            value: (field.properties || []).concat([newField]),
        });
    }

    function removeNestedField(nestedFieldId) {
        dispatch({
            type: 'UPDATE_FIELD',
            fieldId: field.id,
            key: 'properties',
            value: field.properties.filter((f) => f.id !== nestedFieldId),
        });
    }

    function addArrayItem() {
        const newItem = {
            id: getUniqueId(),
            keyTitle: '',
            dataType: '',
            description: '',
            attributes: {},
            properties: [],
            items: null,
        };
        dispatch({
            type: 'UPDATE_FIELD',
            fieldId: field.id,
            key: 'items',
            value: newItem,
        });
    }

    function removeArrayItem() {
        dispatch({
            type: 'UPDATE_FIELD',
            fieldId: field.id,
            key: 'items',
            value: null,
        });
    }

    return (
        <div
            className="field"
            style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}
            draggable
            onDragStart={(e) => handleDragStart(e, index, parentField)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index, parentField)}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Row {index + 1}</span>
                <select
                    value={field.dataType}
                    onChange={(e) => handleChange('dataType', e.target.value)}
                >
                    <option value="">Select Data Type</option>
                    {dataTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Key Title"
                    value={field.keyTitle}
                    onChange={(e) => handleChange('keyTitle', e.target.value)}
                />
                {/* Conditional rendering of 'Start Value' or 'Description' */}
                {field.dataType === 'autoIncrement' ? (
                    <input
                        type="number"
                        placeholder="Start Value"
                        value={field.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                ) : (
                    <input
                        type="text"
                        placeholder="Description"
                        value={field.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                )}
                <button type="button" onClick={onRemove} style={{ marginLeft: 'auto' }}>
                    &times;
                </button>
            </div>

            {/* Handle nested objects */}
            {field.dataType === 'object' && (
                <div style={{ marginTop: '10px' }}>
                    <button type="button" onClick={addNestedField}>
                        Add Nested Property
                    </button>
                    {field.properties &&
                        field.properties.map((propField, idx) => (
                            <Field
                                key={propField.id}
                                field={propField}
                                index={idx}
                                dataTypes={dataTypes}
                                dispatch={dispatch}
                                onRemove={() => removeNestedField(propField.id)}
                                parentField={field}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                            />
                        ))}
                </div>
            )}

            {/* Handle arrays */}
            {field.dataType === 'array' && (
                <div style={{ marginTop: '10px' }}>
                    <h4>Array Items:</h4>
                    {field.items ? (
                        <Field
                            field={field.items}
                            dataTypes={dataTypes}
                            dispatch={dispatch}
                            onRemove={removeArrayItem}
                        />
                    ) : (
                        <button type="button" onClick={addArrayItem}>
                            Add Array Item
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Field;
