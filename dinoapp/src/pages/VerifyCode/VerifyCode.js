import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './VerifyCode.css';
import { Alert, Form, Button, Container, Row, Col } from 'react-bootstrap';

const VerifyCode = () => {
const [code, setCode] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const navigate = useNavigate();

const handleLoginClick = () => {
    navigate('/signin');};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
    const response = await axios.post('http://127.0.0.1:8000/api/verify-code/', { code });
    setMessage('Code verified successfully.');
      // Navigate to reset password page or directly reset the password
      // navigate('/reset-password');
    } catch (err) {
    if (err.response && err.response.data) {
        setError(err.response.data.error);
    } else {
        setError('Something went wrong. Please try again.');
        }
    }
};


    return (
        <Container fluid className="verify-code-container">
  <Row className="h-100">
    <Col md={6} className="d-none d-md-flex align-items-center justify-content-center bg-light">
      <img src={assets.ForgotPWD} alt="Illustration" className="img-fluid" />
    </Col>
    <Col md={6} className="d-flex align-items-center justify-content-center">
      <div className="verify-form-container">
        <span onClick={handleLoginClick} className="back-link">
          ← Back to login
        </span>
        <h3 className="verify-title">Verify code</h3>
        <p>An authentication code has been sent to your email.</p>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formCode">
            <Form.Label>Enter Code</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 6-digit code"
              required
            />
          </Form.Group>
          <Button type="submit" className="btn-primary">
            Verify
          </Button>
        </Form>
        <div className="text-center mt-3">
          <p>Didn't receive a code? <span className="resend-link">Resend</span></p>
        </div>
      </div>
    </Col>
  </Row>
</Container>

);
};

export default VerifyCode;

