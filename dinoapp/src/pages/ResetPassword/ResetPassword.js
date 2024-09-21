import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();  // Access state passed from previous route
  const navigate = useNavigate();

  const email = location.state?.email;  // Get the email from the state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      // Make the API request to reset the password
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password/', {
        email: email,  // Send the email with the new password
        new_password: password,
      });

      // If successful, navigate to the sign-in page
      if (response.status === 200) {
        navigate('/signin');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error('Error resetting password:', err);
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
