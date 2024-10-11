import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const GettingStarted = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Getting Started</h1>
      <p className="text-center mb-5">
        Welcome to the documentation for our web application! This guide will walk you through the basics of using our tools, from creating JSON schemas to generating sample documents with AI.
      </p>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <Card.Text>
                Our application provides a complete workflow for creating, editing, and utilizing JSON schemas. You can upload your schemas, generate sample data, and convert between JSON and BSON formats with ease.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Prerequisites</Card.Title>
              <Card.Text>
                To get started, you'll need the following:
                <ul>
                  <li>A modern web browser (Chrome, Firefox, Edge, etc.).</li>
                  <li>Access to the internet for interacting with our API.</li>
                  <li>A basic understanding of JSON data structures (recommended).</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Using the JSON Schema Editor</Card.Title>
              <Card.Text>
                The JSON Schema Editor allows you to define the structure of your JSON documents:
                <ol>
                  <li>Go to the <strong>JSON Schema Editor</strong> from the main menu.</li>
                  <li>Add fields using the <strong>+</strong> button and define their types and properties.</li>
                  <li>Save your schema to the database once you're satisfied with its structure.</li>
                </ol>
                You can load, modify, or delete saved schemas later.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Uploading and Validating a Schema</Card.Title>
              <Card.Text>
                If you already have a JSON schema, you can upload it directly:
                <ol>
                  <li>Go to the <strong>Upload Schema</strong> page.</li>
                  <li>Select your JSON file and click <strong>Upload</strong>.</li>
                  <li>Click the <strong>Validate</strong> button to ensure the schema is correctly formatted.</li>
                  <li>If valid, you can proceed to edit it using the <strong>Edit JSON Schema</strong> button.</li>
                </ol>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Generating Sample Documents</Card.Title>
              <Card.Text>
                Generate sample data using the AI engine:
                <ol>
                  <li>Navigate to the <strong>AI Generator</strong> page.</li>
                  <li>Load a saved schema or create a new one directly.</li>
                  <li>Click <strong>Generate</strong> to produce sample JSON documents based on your schema.</li>
                  <li>Download the generated samples or use them in your application.</li>
                </ol>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Converting JSON to BSON</Card.Title>
              <Card.Text>
                The converter tool allows you to switch between JSON and BSON:
                <ol>
                  <li>Go to the <strong>Converter</strong> page from the main menu.</li>
                  <li>Upload a JSON or BSON file.</li>
                  <li>Click <strong>Convert</strong> to see the output in the desired format.</li>
                  <li>Download the converted file for your use.</li>
                </ol>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Frequently Asked Questions (FAQ)</Card.Title>
              <Card.Text>
                <strong>Q: How do I save a schema?</strong><br />
                A: Use the <strong>Save</strong> button in the JSON Schema Editor to store your schema in the database.<br /><br />
                <strong>Q: Can I modify a saved schema?</strong><br />
                A: Yes, simply load your schema in the JSON Schema Editor, make changes, and save it again.<br /><br />
                <strong>Q: What if my uploaded schema is invalid?</strong><br />
                A: Use the validation tool on the <strong>Upload Schema</strong> page to see where the errors are and correct them before proceeding.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GettingStarted;
