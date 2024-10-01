import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');
const location = useLocation();
  const navigate = useNavigate();

  const { email, code } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
    }

    // Log email and code to ensure they are not undefined
    console.log("Email: ", email);
    console.log("Code: ", code);

    try {
        const response = await axios.post('http://localhost:8000/api/reset-password/',
            {
                email: email,  // Email from state
                code: code,    // Code from state
                new_password: password  // New password from input
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        navigate('/signin');
    } catch (err) {
        setError('Failed to reset password. Please try again.');
        console.error('Error resetting password:', err.response ? err.response.data : err.message);
    }
};




  return (
    <Container className="my-5">
      <h3>Reset Password</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </Form.Group>
        <Form.Group controlId="formConfirmPassword" className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </Form.Group>
        {error && <p className="text-danger">{error}</p>}
        <Button type="submit" className="btn-primary">Reset Password</Button>
      </Form>
    </Container>
  );
};

export default ResetPassword;
