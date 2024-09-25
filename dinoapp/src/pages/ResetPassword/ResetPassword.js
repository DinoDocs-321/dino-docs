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

const { user_id, code } = location.state || {};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
    }

    try {
      // Ensure user_id and code are correctly passed
        console.log('Sending reset request with:', { user_id, code, new_password: password });
        const response = await axios.post('http://127.0.0.1:8000/api/reset-password/', {
        user_id: user_id,
        new_password: password,
        code: code
        });

        if (response.status === 200) {
        navigate('/signin');
        }
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
