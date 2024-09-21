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
    <Container className="verify-code-container">
        <Row className="justify-content-center align-items-center">
        {/* Left Column: Image */}
        <Col md={6} className="left-column">
            <img src={assets.ForgotPWD} alt="Illustration" className="illustration-img" />
        </Col>

        {/* Right Column: Form and Text */}
        <Col md={6} className="right-column">
            <span
                style={{ fontWeight: 600 }}
                onClick={handleLoginClick}
                className="back-to-login"
                >
                {'< Back to login'}
            </span>
            <h2 style={{ fontWeight: 600 }}>Verify code</h2>
            <p>An authentication code has been sent to your email.</p>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCode">
                <Form.Label>Enter Code</Form.Label>
                    <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                required
                className="form-control"
                    />
            </Form.Group>
            <Button type="submit" className="submit-btn">
                Verify
            </Button>
            <p className="resend-link">
                Didn't receive a code? <a href="#">Resend</a>
            </p>
        </Form>
        </Col>
    </Row>
    </Container>
);
};

export default VerifyCode;
