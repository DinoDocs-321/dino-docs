import React, { useState } from 'react';
import axios from 'axios';

const SchemaForm = () => {
    const [schema, setSchema] = useState('');
    const [format, setFormat] = useState('json');
    const [numSamples, setNumSamples] = useState(10);
    const [response, setResponse] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const result = await axios.post('http://127.0.0.1:8000/api/generate/', {
            schema,
            format,
            num_samples: numSamples,
        });
            setResponse(result.data);
        } catch (error) {
            console.error('There was an error generating the documents!', error);
        }
    };

    return (
        <div>
            <h1>Generate Sample Documents</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>JSON Schema:</label>
                    <textarea
                        rows="10"
                        cols="50"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div>
                    <label>Output Format:</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="json">JSON</option>
                        <option value="bson">BSON</option>
                    </select>
                </div>
                <div>
                    <label>Number of Samples:</label>
                    <input
                        type="number"
                        value={numSamples}
                        onChange={(e) => setNumSamples(e.target.value)}
                        min="1"
                    />
                </div>
                <button type="submit">Generate</button>
            </form>
            {response && (
                <div>
                    <h2>Generated Documents:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default SchemaForm;
