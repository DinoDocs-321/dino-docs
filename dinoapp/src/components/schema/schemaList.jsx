// schemaList.jsx
import React, { useEffect } from 'react';
import './schemaList.css';
import axios from 'axios';

function SchemaList({ savedSchemas, onClose, onSchemaSelect, fetchSavedSchemas }) {
    useEffect(() => {
        fetchSavedSchemas();
    }, [fetchSavedSchemas]);

    const handleDelete = (schemaId, schemaName) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the schema "${schemaName}"?`);
        if (confirmDelete) {
            deleteSchema(schemaId);
        }
    };

    const deleteSchema = async (schemaId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Please log in to delete a schema.');
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:8000/api/saved-schemas/${schemaId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            alert('Schema deleted successfully.');
            fetchSavedSchemas(); // Refresh the list
        } catch (error) {
            console.error('Error deleting schema:', error);
            alert('Failed to delete schema.');
        }
    };

    return (
        <div className="schema-modal">
            <div className="schema-modal-content">
                <h3>Select a Saved Schema</h3>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                {savedSchemas.length === 0 ? (
                    <p>No saved schemas found.</p>
                ) : (
                    <ul className="schema-list">
                        {savedSchemas.map((schema) => (
                            <li key={schema._id}>
                                <span>{schema.schema_name}</span>
                                <div className="schema-actions">
                                    <button onClick={() => onSchemaSelect(schema._id)}>
                                        Import
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(schema._id, schema.schema_name)}
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
