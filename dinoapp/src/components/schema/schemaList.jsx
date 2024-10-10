import React, { useEffect } from 'react';
import axios from 'axios';
import './schemaList.css';

function SchemaList({ savedSchemas, onClose, onSchemaSelect, fetchSavedSchemas }) {
    
    //Retrieve the list of schemas
    useEffect(() => {
        fetchSavedSchemas();
    }, [fetchSavedSchemas]);

    //Confirmirmation of deletion
    const confirmAndDeleteSchema = (schemaId, schemaName) => {
        const userConfirmed = window.confirm(`Are you sure you want to delete the schema "${schemaName}"?`);
        if (userConfirmed) {
            deleteSchema(schemaId);
        }
    };

    //Function to delete a schema
    const deleteSchema = async (schemaId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Please log in to delete a schema.');
                return;
            }

            //delete request
            await axios.delete(`http://127.0.0.1:8000/api/saved-schemas/${schemaId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            alert('Schema deleted successfully.');

            //refresh the list of saved schemas
            fetchSavedSchemas();
        } catch (error) {
            console.error('Error deleting schema:', error);
            alert('Failed to delete schema.');
        }
    };

    return (
        <div className="schemaList-div">
            <div className="schemaList-content">
                <h3>Select a Saved Schema</h3>

                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                {savedSchemas.length === 0 ? (
                    <p>No saved schemas found.</p>
                ) : (
                    <ul className="schemaList">

                        {savedSchemas.map((schema) => (
                            <li key={schema._id}>
                                <span>{schema.schema_name}</span>
                                <div className="schema-actions">

                                    <button onClick={() => onSchemaSelect(schema._id)}>
                                        Import
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => confirmAndDeleteSchema(schema._id, schema.schema_name)}
                                    >
                                        Delete
                                    </button>

                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SchemaList;
