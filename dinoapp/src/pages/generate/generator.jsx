import React, { useState, useEffect, useReducer, useCallback } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import './generator.css';
import Field from '../../components/field/field';
import SchemaList from '../../components/schema/schemaList.jsx';
import { getUniqueId } from '../../utils/uniqueID';

function Generator() {

    // States
    const [schemaTitle, setSchemaTitle] = useState('');
    const [schemaDescription, setSchemaDescription] = useState('');
    const [numSamples, setNumSamples] = useState(3);
    const [response, setResponse] = useState(null);

    // Available data types for fields
    const [dataTypes, setDataTypes] = useState([]);

    // Error handling
    const [fieldErrors, setFieldErrors] = useState({});
    const [schemaErrors, setSchemaErrors] = useState({});
    const [showValidationError, setShowValidationError] = useState(false);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Saved schemas
    const [savedSchemas, setSavedSchemas] = useState([]);
    const [showSchemaModal, setShowSchemaModal] = useState(false);

    // Fetch data types when component mounts
    useEffect(() => {
        const fetchDataTypes = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/data-types/');
                setDataTypes(res.data);
            } catch (err) {
                console.error('Error fetching data types:', err);
            }
        };
        fetchDataTypes();
    }, []);

    // Scroll to top when validation errors are shown
    useEffect(() => {
        if (showValidationError) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showValidationError]);

    // Fetch saved schemas
    const fetchSavedSchemas = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Please log in to import a schema.');
            return;
        }

        try {
            const res = await axios.get('http://127.0.0.1:8000/api/saved-schemas/', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSavedSchemas(res.data);
        } catch (err) {
            console.error('Error fetching saved schemas:', err);
            alert('Session inactive, please log in again.');
        }
    }, []);

    // Handle opening the schema modal and fetching schemas
    const handleOpenSchemaModal = () => {
        fetchSavedSchemas();
        setShowSchemaModal(true);
    };

    // Handle schema selection from saved schemas
    const handleSchemaSelect = async (schemaId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Please log in to import a schema.');
            return;
        }

        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/saved-schemas/${schemaId}/`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const schemaData = res.data.json_data;
            importSchema(schemaData);
            setShowSchemaModal(false);
        } catch (err) {
            console.error('Error fetching schema details:', err);
            alert('Failed to fetch schema details.');
        }
    };

    // Import schema data into form fields
    const importSchema = (schemaData) => {
        if (dataTypes.length === 0) {
            alert('Data types are not loaded yet. Please try again in a moment.');
            return;
        }

        // Basic validation
        if (
            schemaData &&
            schemaData.type === 'object' &&
            schemaData.properties &&
            typeof schemaData.properties === 'object'
        ) {
            const importedFields = schemaPropertiesToFields(schemaData.properties);
            setSchemaTitle(schemaData.title || '');
            setSchemaDescription(schemaData.description || '');
            dispatch({ type: 'SET_FIELDS', fields: importedFields });
        } else {
            alert('Invalid schema format. Cannot import this schema.');
        }
    };

    // Convert schema properties to form fields
    const schemaPropertiesToFields = (properties) => {
        const fieldsArray = [];

        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                const prop = properties[key];
                const field = {
                    id: getUniqueId(),
                    keyTitle: key,
                    dataType: mapSchemaPropertyToDataType(prop),
                    description: prop.description || '',
                    attributes: {},
                    properties: [],
                    items: null,
                };

                // Map relevant attributes
                ['minLength', 'maxLength', 'minimum', 'maximum'].forEach((attr) => {
                    if (prop[attr] !== undefined) {
                        field.attributes[attr] = prop[attr];
                    }
                });

                // Handle nested objects
                if (prop.type === 'object' && prop.properties) {
                    field.properties = schemaPropertiesToFields(prop.properties);
                }

                // Handle arrays and lists
                if (prop.type === 'array' && prop.items) {
                    if (Array.isArray(prop.items)) {
                        field.dataType = 'list';
                        field.items = prop.items.map((item) => schemaPropertyToField(item));
                    } else {
                        field.dataType = 'array';
                        field.items = schemaPropertyToField(prop.items);
                    }
                }

                fieldsArray.push(field);
            }
        }

        return fieldsArray;
    };

    // Convert a single schema property to a form field
    const schemaPropertyToField = (prop) => {
        const field = {
            id: getUniqueId(),
            keyTitle: '',
            dataType: mapSchemaPropertyToDataType(prop),
            description: prop.description || '',
            attributes: {},
            properties: [],
            items: null,
        };

        // Map relevant attributes
        ['minLength', 'maxLength', 'minimum', 'maximum'].forEach((attr) => {
            if (prop[attr] !== undefined) {
                field.attributes[attr] = prop[attr];
            }
        });

        // Handle nested objects
        if (prop.type === 'object' && prop.properties) {
            field.properties = schemaPropertiesToFields(prop.properties);
        }

        // Handle arrays and lists
        if (prop.type === 'array' && prop.items) {
            if (Array.isArray(prop.items)) {
                field.dataType = 'list';
                field.items = prop.items.map((item) => schemaPropertyToField(item));
            } else {
                field.dataType = 'array';
                field.items = schemaPropertyToField(prop.items);
            }
        }

        return field;
    };

    // Map schema property to form data type
    const mapSchemaPropertyToDataType = (prop) => {
        const { type, format, dataType } = prop;

        if (dataType) {
            return dataType;
        }

        const dataTypeEntry = dataTypes.find((dt) => dt.type === type && dt.format === format);
        return dataTypeEntry ? dataTypeEntry.value : '';
    };

    // Reducer to manage form fields state
    const fieldsReducer = (state, action) => {
        switch (action.type) {
            case 'ADD_FIELD':
                const newField = {
                    id: getUniqueId(),
                    keyTitle: '',
                    dataType: '',
                    description: '',
                    attributes: {},
                    properties: [],
                    items: null,
                };
                return [...state, newField];

            case 'REMOVE_FIELD':
                return state.filter((field) => field.id !== action.fieldId);

            case 'UPDATE_FIELD':
                return state.map((field) => updateField(field, action));

            case 'SET_FIELDS':
                return action.fields;

            default:
                return state;
        }
    };

    // Helper to update a field based on action
    const updateField = (field, action) => {
        if (field.id === action.fieldId) {
            return { ...field, [action.key]: action.value };
        } else {
            let updatedField = { ...field };

            if (field.properties && field.properties.length > 0) {
                updatedField.properties = field.properties.map((prop) => updateField(prop, action));
            }

            if (field.items) {
                if (Array.isArray(field.items)) {
                    updatedField.items = field.items.map((item) => updateField(item, action));
                } else {
                    updatedField.items = updateField(field.items, action);
                }
            }

            return updatedField;
        }
    };

    const [fields, dispatch] = useReducer(fieldsReducer, []);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const { fieldErrors, schemaErrors } = validateFields(fields);

        if (Object.keys(fieldErrors).length > 0 || Object.keys(schemaErrors).length > 0) {
            setFieldErrors(fieldErrors);
            setSchemaErrors(schemaErrors);
            setShowValidationError(true);
            return;
        } else {
            setFieldErrors({});
            setSchemaErrors({});
            setShowValidationError(false);
        }

        setIsLoading(true);

        const schemaData = buildSchemaData();

        console.log('Generated Schema Data:', JSON.stringify(schemaData, null, 2));

        const dataToSend = {
            schema: schemaData,
            format: 'json',
            num_samples: numSamples,
        };

        console.log('Sending data:', dataToSend);

        try {
            const result = await axios.post('http://127.0.0.1:8000/api/generate-documents/', dataToSend, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Response from server:', result.data);
            setResponse(result.data);
        } catch (err) {
            console.error('Error generating the documents!', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Validate form fields recursively
    const validateFields = (fields) => {
        let fieldErrors = {};
        let schemaErrors = {};

        // Validate schema title and description
        if (!schemaTitle.trim()) {
            schemaErrors.schemaTitle = 'Schema Title is required.';
        }
        if (!schemaDescription.trim()) {
            schemaErrors.schemaDescription = 'Schema Description is required.';
        }

        // Validate each field
        fields.forEach((field) => {
            let errors = {};

            // Key Title validation
            if (!field.keyTitle) {
                errors.keyTitle = 'Key Title is required.';
            } else if (/\s/.test(field.keyTitle)) {
                errors.keyTitle = 'Key Title cannot contain spaces.';
            }

            // Data Type validation
            if (!field.dataType) {
                errors.dataType = 'Data Type is required.';
            }

            // AutoIncrement Start Value validation
            if (field.dataType === 'autoIncrement') {
                if (!field.description || field.description.trim() === '') {
                    errors.description = 'Start Value is required.';
                } else if (isNaN(field.description)) {
                    errors.description = 'Start Value must be a number.';
                }
            }

            // Recursive validation for nested fields
            if (field.dataType === 'object' && field.properties) {
                const { fieldErrors: childErrors } = validateFields(field.properties);
                if (Object.keys(childErrors).length > 0) {
                    errors.properties = childErrors;
                }
            }

            if ((field.dataType === 'array' || field.dataType === 'list') && field.items) {
                const items = Array.isArray(field.items) ? field.items : [field.items];
                const { fieldErrors: childErrors } = validateFields(items);
                if (Object.keys(childErrors).length > 0) {
                    errors.items = childErrors;
                }
            }

            if (Object.keys(errors).length > 0) {
                fieldErrors[field.id] = errors;
            }
        });

        return { fieldErrors, schemaErrors };
    };

    // Build schema properties recursively
    const buildProperties = (fields) => {
        const properties = {};
        fields.forEach((field) => {
            if (field.keyTitle && field.dataType) {
                properties[field.keyTitle] = processField(field);
            }
        });
        return properties;
    };

    // Process a single field into schema format
    const processField = (field) => {
        const dataTypeInfo = mapDataType(field.dataType);
        if (!dataTypeInfo) {
            console.warn(`Data type "${field.dataType}" not found.`);
            return {};
        }

        const schemaField = {
            type: dataTypeInfo.type,
            description: field.description || '',
            dataType: field.dataType,
        };

        if (field.dataType === 'autoIncrement') {
            schemaField.startValue = parseInt(field.description, 10);
        }

        if (dataTypeInfo.format) {
            schemaField.format = dataTypeInfo.format;
        }

        // Include additional attributes
        for (const attr in field.attributes) {
            const value = field.attributes[attr];
            if (value !== '') {
                if (['minLength', 'maxLength', 'minimum', 'maximum'].includes(attr)) {
                    schemaField[attr] = parseInt(value, 10);
                } else {
                    schemaField[attr] = value;
                }
            }
        }

        // Handle nested fields
        if (dataTypeInfo.type === 'object' && field.properties.length > 0) {
            schemaField.properties = buildProperties(field.properties);
        }

        if (field.dataType === 'array' && field.items) {
            schemaField.items = processField(field.items);
        }

        if (field.dataType === 'list' && field.items && field.items.length > 0) {
            schemaField.items = field.items.map(processField);
        }

        return schemaField;
    };

    // Map form data type to schema data type info
    const mapDataType = (value) => {
        return dataTypes.find((dataType) => dataType.value === value) || null;
    };

    // Build the complete schema data
    const buildSchemaData = () => {
        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            title: schemaTitle || 'Generated Schema',
            description: schemaDescription || 'This schema was generated by the user',
            properties: buildProperties(fields),
        };
    };

    // Handle download of generated documents
    const handleDownload = () => {
        if (response && response.documents) {
            const dataStr = JSON.stringify(response.documents, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${schemaTitle || 'generated_data'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    // Save schema to the database
    const handleSaveSchema = async () => {
        const { fieldErrors, schemaErrors } = validateFields(fields);

        if (Object.keys(fieldErrors).length > 0 || Object.keys(schemaErrors).length > 0) {
            setFieldErrors(fieldErrors);
            setSchemaErrors(schemaErrors);
            setShowValidationError(true);
            return;
        } else {
            setFieldErrors({});
            setSchemaErrors({});
            setShowValidationError(false);
        }

        const schemaData = buildSchemaData();

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Please log in to save your schema.');
            return;
        }

        try {
            const result = await axios.post(
                'http://127.0.0.1:8000/api/save-schema/',
                {
                    schema_name: schemaTitle,
                    json_data: schemaData,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            console.log(result.data.message);
            alert('Schema saved successfully!');
        } catch (err) {
            console.error(err.response);
            alert('Failed to save schema.');
        }
    };

    // Return component
    return (

        <Container>

            <div className="my-container">
                {showValidationError && (
                    <div className="validation-error-message">
                        The fields highlighted in red must not have spaces or be empty.
                    </div>
                )}

                <div className="import-button-container">
                    <button type="button" onClick={handleOpenSchemaModal}>
                        Import Saved Schema
                    </button>
                </div>

                {showSchemaModal && (
                    <SchemaList
                        savedSchemas={savedSchemas}
                        onClose={() => setShowSchemaModal(false)}
                        onSchemaSelect={handleSchemaSelect}
                        fetchSavedSchemas={fetchSavedSchemas}
                    />
                )}

                <div className="row justify-content-center title-desc">
                    <div className="col-4 d-flex justify-content-center align-items-center">
                        <label>Schema Title:</label>
                        <input
                            type="text"
                            placeholder="Title"
                            value={schemaTitle}
                            onChange={(e) => setSchemaTitle(e.target.value)}
                            className={schemaErrors.schemaTitle ? 'error' : ''}
                        />
                    </div>
                    <div className="col-8 d-flex justify-content-end align-items-center ndchild">
                        <label>Schema Description:</label>
                        <input
                            type="text"
                            placeholder="Schema Description (prompt AI)"
                            value={schemaDescription}
                            onChange={(e) => setSchemaDescription(e.target.value)}
                            className={schemaErrors.schemaDescription ? 'error' : ''}
                        />
                    </div>
                </div>

                <div className="container">
                    {fields.map((field, index) => (
                        <Field
                            key={field.id}
                            field={field}
                            index={index}
                            dataTypes={dataTypes}
                            dispatch={dispatch}
                            onRemove={() => dispatch({ type: 'REMOVE_FIELD', fieldId: field.id })}
                            parentField={null}
                            fields={fields}
                            getUniqueId={getUniqueId}
                            error={fieldErrors[field.id]}
                        />
                    ))}
                </div>
                <div className="btn-con">
                    <button
                        type="button"
                        className="add-prop"
                        onClick={() => dispatch({ type: 'ADD_FIELD' })}
                    >
                        + Add Property
                    </button>
                </div>
                <div className="input-div">
                    <label>Number of Documents:</label>
                    <input
                        type="number"
                        value={numSamples}
                        onChange={(e) => setNumSamples(parseInt(e.target.value) || 1)}
                        min="1"
                        step="1"
                    />
                    <button type="button" onClick={handleSubmit}>
                        Generate
                    </button>
                    <button type="button" onClick={handleSaveSchema}>
                        Save Schema
                    </button>
                </div>

                {isLoading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Generating data, please wait...</p>
                    </div>
                )}
                {!isLoading && response && (
                    <div className="response">
                        <div className="response-header">
                            <h3>Generated Documents:</h3>
                            <button type="button" onClick={handleDownload}>
                                Download JSON
                            </button>
                        </div>
                        <pre>{JSON.stringify(response.documents, null, 2)}</pre>
                    </div>
                )}
            </div>

        </Container>
    );
}

export default Generator;
