import Container from "react-bootstrap/Container";
import './generator.css';
import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import Field from '../../components/field/field'; // Import Field component from components folder

// Unique ID generator to fix issues with object property's input boxes losing focus
import { getUniqueId } from '../../utils/uniqueID'; // Import getUniqueId function

function Generator() {
    // State variables for schema
    const [schemaTitle, setSchemaTitle] = useState('');
    const [schemaDescription, setSchemaDescription] = useState('');
    const [numSamples, setNumSamples] = useState(3); // Default number of samples is 3
    const [response, setResponse] = useState(null);

    // State variable for data types
    const [dataTypes, setDataTypes] = useState([]);

    // State variable for form validation errors
    const [fieldErrors, setFieldErrors] = useState({});
    const [schemaErrors, setSchemaErrors] = useState({});
    const [showValidationError, setShowValidationError] = useState(false);

    const [isLoading, setIsLoading] = useState(false);



    // Fetch data types from the API when the component mounts
    useEffect(() => {
        async function fetchDataTypes() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/data-types/');
                setDataTypes(response.data);
            } catch (error) {
                console.error('Error fetching data types:', error);
            }
        }
        fetchDataTypes();
    }, []);

    useEffect(() => {
        if (showValidationError) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showValidationError]);

    function fieldsReducer(state, action) {
        switch (action.type) {
            // To add a new, blank field
            case 'ADD_FIELD':
                var newField = {
                    id: getUniqueId(),
                    keyTitle: '',
                    dataType: '',
                    description: '', // Used for 'Start Value' in autoIncrement
                    attributes: {},
                    properties: [],
                    items: null,
                };
                return state.concat([newField]);

            // To remove a field
            case 'REMOVE_FIELD':
                return state.filter((field) => field.id !== action.fieldId);

            // To update a field
            case 'UPDATE_FIELD':
                return state.map((field) => {
                    return updateField(field, action);
                });

            // To update the fields' new order
            case 'REORDER_FIELDS':
                return action.newOrder;

            // Default case
            default:
                return state;
        }
    }

    // Function to update fields
    function updateField(field, action) {
        if (field.id === action.fieldId) {
            var newField = { ...field };
            newField[action.key] = action.value;
            return newField;
        } else {
            var updatedField = field;
    
            if (field.properties && field.properties.length > 0) {
                updatedField = {
                    ...field,
                    properties: field.properties.map((prop) => {
                        return updateField(prop, action);
                    }),
                };
            }

            if (field.items) {
                if (Array.isArray(field.items)) {
                    // For list data type
                    updatedField = {
                        ...updatedField,
                        items: field.items.map((item) => updateField(item, action)),
                    };
                } else {
                    // For array data type
                    updatedField = {
                        ...updatedField,
                        items: updateField(field.items, action),
                    };
                }
            }
    
            return updatedField;
        }
    }
    

    const [fields, dispatch] = useReducer(fieldsReducer, []);

    // Function to handle form submission
    async function handleSubmit(event) {
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
            schema: schemaData, // This should be the complete schema object
            format: 'json', // Hardcoded to 'json'
            num_samples: numSamples,
        };

        console.log('Sending data:', dataToSend);

        try {
            const result = await axios.post('http://127.0.0.1:8000/api/generate-documents/', dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response from server:', result.data);
            setResponse(result.data);
        } catch (error) {
            console.error('There was an error generating the documents!', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Function to validate fields recursively
    function validateFields(fields, parentPath = '') {
        let fieldErrors = {};

        // Validate schema title and description
        let schemaErrors = {};
        if (!schemaTitle.trim()) {
            schemaErrors.schemaTitle = 'Schema Title is required.';
        }
        if (!schemaDescription.trim()) {
            schemaErrors.schemaDescription = 'Schema Description is required.';
        }
    
    
        fields.forEach((field, index) => {
            const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id;
            let fieldError = {};
    
            // Validate keyTitle
            if (!field.keyTitle) {
                fieldError.keyTitle = 'Key Title is required.';
            } else if (/\s/.test(field.keyTitle)) {
                fieldError.keyTitle = 'Key Title cannot contain spaces.';
            }
            if (!field.dataType) {
                fieldError.dataType = 'Data Type is required.';
            }
            // Validate 'Start Value' for autoIncrement
            if (field.dataType === 'autoIncrement') {
                if (!field.description || field.description.trim() === '') {
                    fieldError.description = 'Start Value is required.';
                } else if (isNaN(field.description)) {
                    fieldError.description = 'Start Value must be a number.';
                }
            }
    
            // Validate nested fields
            if (field.dataType === 'object' && field.properties) {
                const { fieldErrors: childFieldErrors } = validateFields(field.properties, fieldPath);
                if (Object.keys(childFieldErrors).length > 0) {
                    fieldError.properties = childFieldErrors;
                }
            }
            if ((field.dataType === 'array' || field.dataType === 'list') && field.items) {
                const items = Array.isArray(field.items) ? field.items : [field.items];
                const { fieldErrors: childFieldErrors } = validateFields(items, fieldPath);
                if (Object.keys(childFieldErrors).length > 0) {
                    fieldError.items = childFieldErrors;
                }
            }
    
            if (Object.keys(fieldError).length > 0) {
                fieldErrors[field.id] = fieldError;
            }
        });
    
        return { fieldErrors, schemaErrors };
    }
    

    // Function to build properties recursively
    function buildProperties(fields) {
        var properties = {};
        fields.forEach((field) => {
            if (field.keyTitle && field.dataType) {
                properties[field.keyTitle] = processField(field);
            }
        });
        return properties;
    }
    
    function processField(field) {
        var dataTypeInfo = mapDataType(field.dataType);
        if (!dataTypeInfo) {
            console.warn('Data type "' + field.dataType + '" not found.');
            return {};
        }
    
        var schemaField = {
            type: dataTypeInfo.type,
            description: field.description || '',
            dataType: field.dataType, // Include dataType in the schema for autoIncrement handling
        };
    
        if (field.dataType === 'autoIncrement') {
            schemaField.startValue = parseInt(field.description, 10); // Set start value if autoIncrement
        }
    
        if (dataTypeInfo.format) {
            schemaField.format = dataTypeInfo.format;
        }
    
        // Include additional attributes
        var fieldAttributes = field.attributes || {};
        for (var attr in fieldAttributes) {
            var value = fieldAttributes[attr];
            if (value !== '') {
                if (['minLength', 'maxLength', 'minimum', 'maximum'].indexOf(attr) !== -1) {
                    schemaField[attr] = parseInt(value, 10);
                } else {
                    schemaField[attr] = value;
                }
            }
        }
    
        if (dataTypeInfo.type === 'object' && field.properties && field.properties.length > 0) {
            schemaField.properties = buildProperties(field.properties);
        }
    
        if (field.dataType === 'array' && field.items) {
            schemaField.items = processField(field.items);
        }
    
        if (field.dataType === 'list' && field.items && field.items.length > 0) {
            schemaField.items = field.items.map(processField);
        }
    
        return schemaField;
    }
    

    // Function to map data type value to its info
    function mapDataType(value) {
        var foundType = dataTypes.find((dataType) => dataType.value === value);
        return foundType || null;
    }

    function buildSchemaData() {
        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            title: schemaTitle || 'Generated Schema',
            description: schemaDescription || 'This schema was generated by the user',
            properties: buildProperties(fields),
        };
    }

    function handleDownload() {
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
    }
    

    //Save schema to database
    async function handleSaveSchema() {
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
    
        // Build the schema data
        const schemaData = buildSchemaData();
    
        // Include authentication token if required
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Please log in to save your schema.');
            return;
        }
    
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        };
    
        try {
            const result = await axios.post(
                'http://127.0.0.1:8000/api/save-schema/',
                {
                    schema_name: schemaTitle,
                    json_data: schemaData,
                },
                config
            );
    
            console.log(result.data.message);
            alert('Schema saved successfully!');
        } catch (error) {
            console.error(error.response);
            alert('Failed to save schema. ' + error.response);
        }
    }
    

    // Main component render
    return (
        
        <Container>
        
        <div className="my-container">
        {showValidationError && (
            <div className="validation-error-message">
                The fields highlighted in red must not have spaces or be empty.
            </div>
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
                            placeholder="Schema Description"
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
                        error={fieldErrors[field.id]} // Pass field-specific errors
                    />
                ))}
            </div>
            <div className="btn-con">
                <button type="button" className="add-prop" onClick={() => dispatch({ type: 'ADD_FIELD' })}>
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

            {response && (
                <div className="response">
                    {/* <h3>Response from Server:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre> */}
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Generating data, please wait...</p>
                </div>
            )}
            {/* Response and Download Button */}
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