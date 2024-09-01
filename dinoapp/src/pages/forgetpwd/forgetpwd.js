import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Form, Button, Container } from 'react-bootstrap';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email });
      setMessage('Password reset email has been sent.');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Container className="m-2">
      <h3>Forgot Password</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-1">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default ForgotPassword;
