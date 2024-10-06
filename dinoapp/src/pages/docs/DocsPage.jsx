import React from 'react';
import { Link } from 'react-router-dom';
import './DocsPage.css'; // Create this CSS file for styling

const MainDocsPage = () => {
  return (
    <div className="main-container">
      <h1>Documentation Guides</h1>
      <p>Welcome to the documentation center. Select a guide below to get started:</p>
      <ul className="docs-list">
        <li>
          <Link to="/jsonschema-docs">JSON Schema Creation Guide</Link>
        </li>
        <li>
          <Link to="/api-usage-docs">API Usage Guide</Link>
        </li>
        <li>
          <Link to="/getting-started-docs">Getting Started Guide</Link>
        </li>
        {/* Add more links to other guides as needed */}
      </ul>
    </div>
  );
};

export default MainDocsPage;
