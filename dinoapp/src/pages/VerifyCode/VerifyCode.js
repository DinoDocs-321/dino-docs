import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './VerifyCode.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const VerifyCode = () => {
  const [code, setCode] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id, email } = location.state || {};

  const handleLoginClick = () => {
    navigate('/signin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/verify-code/', { code, user_id });

      // If verification is successful, navigate to the reset password page
      if (response.status === 200) {
        // Pass the email (or user ID) to the reset password page for context
        navigate('/reset-password', {
          state: {
            code: code,
            user_id: user_id,
            email: email
          }
        });  // pass user.id for later
      }
    } catch (err) {
      setError('Invalid or expired code. Please try again.');
      console.error('Verification error:', err);
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
              <Button type="submit" className="btn-primary">Verify</Button> {/* Ensure type="submit" is present */}
            </Form>
            {error && <p className="text-danger mt-3">{error}</p>}
            {message && <p className="text-success mt-3">{message}</p>}
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
