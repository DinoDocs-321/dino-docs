// JsonSchemaDocs.jsx

import React, { useState } from 'react';
import './JSONSchemaDocs.css';

const JsonSchemaDocs = () => {
  return (
    <div className="myContainer">
      <h1>JSON Schema Creation Guide</h1>
      <TableOfContents />
      <Section id="introduction" title="1. Introduction">
        <p>
          Welcome to the JSON Schema Creation Guide. This guide will help you understand how to write and design schemas in JSON format using our system. Our system supports two types of schema creation:
        </p>
        <ul>
          <li><strong>AI-Generated Schemas:</strong> The AI assists in generating data based on your schema.</li>
          <li><strong>User-Specified Domain Schemas:</strong> You define the schema, specifying the domain for each field.</li>
        </ul>
      </Section>

      <Section id="ai-schemas" title="2. AI-Generated Schemas">
        <p>
          When creating an AI-generated schema, you need to include the following required fields for each property:
        </p>
        <ul>
          <li><code>"type"</code>: The data type of the field.</li>
          <li><code>"description"</code>: A description of the field to guide the AI in data generation.</li>
        </ul>
        <p>
          The AI uses the <code>"description"</code> to understand the context and generate appropriate data.
        </p>
        <h3>Example:</h3>
        <CodeBlock language="json">
{`{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "description": "The user's unique username."
    },
    "email": {
      "type": "string",
      "description": "The user's email address."
    }
  },
  "required": ["username", "email"]
}`}
        </CodeBlock>
      </Section>

      <Section id="domain-schemas" title="3. User-Specified Domain Schemas">
        <p>
          For user-specified domain schemas, you have more control over the data generation by specifying domains for each field. The required fields for each property are:
        </p>
        <ul>
          <li><code>"type"</code>: The data type of the field (must be one of the supported data types).</li>
          <li><code>"description"</code>: A description of the field.</li>
        </ul>
        <p>
          Additionally, for <strong>number</strong> fields, you must specify:
        </p>
        <ul>
          <li><code>"minimum"</code>: The minimum value.</li>
          <li><code>"maximum"</code>: The maximum value.</li>
        </ul>
        <h3>Example:</h3>
        <CodeBlock language="json">
{`{
  "type": "object",
  "properties": {
    "age": {
      "type": "integer",
      "description": "The user's age.",
      "minimum": 18,
      "maximum": 99
    },
    "salary": {
      "type": "number",
      "description": "The user's annual salary.",
      "minimum": 30000,
      "maximum": 200000
    }
  },
  "required": ["age", "salary"]
}`}
        </CodeBlock>
      </Section>

      <Section id="supported-data-types" title="4. Supported Data Types">
        <p>
          Our system supports the following data types for schema properties:
        </p>
        <DataTypesTable />
      </Section>

      <Section id="best-practices" title="5. Best Practices">
        <ul>
          <li>Always include <code>"type"</code> and <code>"description"</code> for each field.</li>
          <li>For number fields in domain schemas, ensure <code>"minimum"</code> and <code>"maximum"</code> are specified.</li>
          <li>Use the appropriate data type from the supported list to get the best results.</li>
          <li>Validate your schema using JSON Schema validation tools.</li>
        </ul>
      </Section>

      <Section id="example-schema" title="6. Example Schema">
        <p>Below is an example of a complete schema using user-specified domains:</p>
        <CodeBlock language="json">
{`{
  "type": "object",
  "title": "Employee",
  "description": "Schema for an employee record.",
  "properties": {
    "id": {
      "type": "autoIncrement",
      "description": "The unique identifier for an employee."
    },
    "name": {
      "type": "names",
      "description": "The employee's full name."
    },
    "email": {
      "type": "email",
      "description": "The employee's email address."
    },
    "phone": {
      "type": "phoneFax",
      "description": "The employee's contact number."
    },
    "salary": {
      "type": "numberRange",
      "description": "The employee's salary.",
      "minimum": 50000,
      "maximum": 150000
    },
    "department": {
      "type": "list",
      "description": "The department the employee works in.",
      "items": ["Engineering", "Human Resources", "Marketing", "Sales"]
    }
  },
  "required": ["id", "name", "email", "phone", "salary", "department"]
}`}
        </CodeBlock>
      </Section>

      <Section id="resources" title="7. Resources">
        <ul>
          <li><a href="https://json-schema.org/">Official JSON Schema Documentation</a></li>
          <li><a href="https://jsonschemalint.com/">JSON Schema Validator</a></li>
        </ul>
      </Section>

      <Section id="conclusion" title="8. Conclusion">
        <p>
          By following this guide, you should be able to create schemas that leverage our system's capabilities, whether through AI-generated data or user-specified domains. Remember to use the supported data types and include all required fields to ensure seamless data generation.
        </p>
        <p>Happy schema designing!</p>
      </Section>
    </div>
  );
};

const TableOfContents = () => {
  return (
    <div className="table-of-contents">
      <h2>Table of Contents</h2>
      <ol>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#ai-schemas">AI-Generated Schemas</a></li>
        <li><a href="#domain-schemas">User-Specified Domain Schemas</a></li>
        <li><a href="#supported-data-types">Supported Data Types</a></li>
        <li><a href="#best-practices">Best Practices</a></li>
        <li><a href="#example-schema">Example Schema</a></li>
        <li><a href="#resources">Resources</a></li>
        <li><a href="#conclusion">Conclusion</a></li>
      </ol>
    </div>
  );
};

const Section = ({ id, title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="section" id={id}>
      <h2 onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {title} {isOpen ? '▾' : '▸'}
      </h2>
      {isOpen && children}
    </div>
  );
};

const CodeBlock = ({ language, children }) => {
  return (
    <pre className={`code-block ${language}`}>
      <code>
        {children}
      </code>
    </pre>
  );
};

const DataTypesTable = () => {
  const dataTypes = [
    { value: "names", label: "Names", type: "string" },
    { value: "phoneFax", label: "Phone / Fax", type: "string" },
    { value: "email", label: "Email", type: "string" },
    { value: "date", label: "Date", type: "string", format: "date" },
    { value: "time", label: "Time", type: "string", format: "time" },
    { value: "company", label: "Company", type: "string" },
    { value: "streetAddress", label: "Street Address", type: "string" },
    { value: "city", label: "City", type: "string" },
    { value: "postalZip", label: "Postal / Zip", type: "string" },
    { value: "region", label: "Region", type: "string" },
    { value: "country", label: "Country", type: "string" },
    { value: "latitudeLongitude", label: "Latitude/Longitude", type: "array", items: { type: "number" } },
    { value: "fixedNumberOfWords", label: "Fixed Number of Words", type: "integer" },
    { value: "randomNumber", label: "Random Number", type: "integer" },
    { value: "alphanumeric", label: "Alphanumeric", type: "string" },
    { value: "boolean", label: "Boolean", type: "boolean" },
    { value: "autoIncrement", label: "Auto Increment", type: "integer" },
    { value: "numberRange", label: "Number Range", type: "number" },
    { value: "normalDistribution", label: "Normal Distribution", type: "number" },
    { value: "guid", label: "GUID", type: "string" },
    { value: "constant", label: "Constant", type: "string" },
    { value: "computed", label: "Computed", type: "string" },
    { value: "list", label: "List", type: "array", items: { type: "string" } },
    { value: "weightedList", label: "Weighted List", type: "array", items: { type: "string" } },
    { value: "colour", label: "Colour", type: "string" },
    { value: "url", label: "URL", type: "string", format: "url" },
    { value: "currency", label: "Currency", type: "string" },
    { value: "bankAccountNums", label: "Bank Account Numbers", type: "string" },
    { value: "cvv", label: "CVV", type: "integer" },
    { value: "pin", label: "PIN", type: "integer" },
    { value: "object", label: "Object", type: "object" },
    { value: "array", label: "Array", type: "array" }
  ];

  return (
    <table className="data-types-table">
      <thead>
        <tr>
          <th>Value</th>
          <th>Label</th>
          <th>Type</th>
          <th>Format / Items</th>
        </tr>
      </thead>
      <tbody>
        {dataTypes.map((dt, index) => (
          <tr key={index}>
            <td><code>{dt.value}</code></td>
            <td>{dt.label}</td>
            <td>{dt.type}</td>
            <td>
              {dt.format ? (
                <span>Format: {dt.format}</span>
              ) : dt.items ? (
                <span>Items Type: {dt.items.type}</span>
              ) : (
                '-'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default JsonSchemaDocs;
