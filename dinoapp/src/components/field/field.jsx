// field.jsx
import React from 'react';
import './field.css';
import { getUniqueId } from '../../utils/uniqueID';

function Field(props) {
    const {
        field,
        index,
        dataTypes,
        dispatch,
        onRemove,
        parentField,
        fields, // Add fields prop
        getUniqueId, // Add getUniqueId prop
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

    // Drag-and-Drop Handlers
    function handleDragStart(e) {
        e.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ fieldId: field.id, parentFieldId: parentField ? parentField.id : null })
        );
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const draggedFieldId = data.fieldId;
        const draggedParentFieldId = data.parentFieldId;

        if (parentField && draggedParentFieldId === parentField.id) {
            // Rearranging within the same parent field
            const propertiesCopy = [...parentField.properties];
            const dragIndex = propertiesCopy.findIndex(f => f.id === draggedFieldId);
            const dropIndex = propertiesCopy.findIndex(f => f.id === field.id);

            if (dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
                const movedField = propertiesCopy.splice(dragIndex, 1)[0];
                propertiesCopy.splice(dropIndex, 0, movedField);
                dispatch({
                    type: 'UPDATE_FIELD',
                    fieldId: parentField.id,
                    key: 'properties',
                    value: propertiesCopy,
                });
            }
        } else if (!parentField && !draggedParentFieldId) {
            // Rearranging at the root level
            const fieldsCopy = [...fields];
            const dragIndex = fieldsCopy.findIndex(f => f.id === draggedFieldId);
            const dropIndex = fieldsCopy.findIndex(f => f.id === field.id);

            if (dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
                const movedField = fieldsCopy.splice(dragIndex, 1)[0];
                fieldsCopy.splice(dropIndex, 0, movedField);
                dispatch({ type: 'REORDER_FIELDS', newOrder: fieldsCopy });
            }
        }
    }

    return (
        <div
            className="field"
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Field content */}
            <div className="field-content">
                <label>Row {index + 1}</label>
                <div className="field-input-group">
                    <label>Data Type</label>
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
                </div>
                <div className="field-input-group">
                    <label>Key Title</label>
                    <input
                        type="text"
                        placeholder="Key Title"
                        value={field.keyTitle}
                        onChange={(e) => handleChange('keyTitle', e.target.value)}
                    />
                </div>
                <div className="field-input-group">
                    <label>Description</label>
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
                </div>
                <button type="button" onClick={onRemove} style={{ marginLeft: 'auto' }}>
                    &times;
                </button>
            </div>

            {/* Handle nested objects */}
            {field.dataType === 'object' && (
                <div className="nested-fields-container">
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
                                fields={fields}
                                getUniqueId={getUniqueId}
                            />
                        ))}

                    <button type="button" onClick={addNestedField}>
                        Add Nested Property
                    </button>
                </div>
            )}

            {/* Handle arrays */}
            {field.dataType === 'array' && (
                <div style={{ marginTop: '10px' }}>
                    <h4>Array Items:</h4>
                    {field.items ? (
                        <Field
                            field={field.items}
                            index={0}
                            dataTypes={dataTypes}
                            dispatch={dispatch}
                            onRemove={removeArrayItem}
                            parentField={field}
                            fields={fields}
                            getUniqueId={getUniqueId}
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