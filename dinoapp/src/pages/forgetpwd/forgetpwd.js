import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './forgetpwd.css';
import { Alert, Form, Button, Container, Row, Col } from 'react-bootstrap';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLoginClick= () =>{
    navigate('/signin');
  };

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
    <Container className="forgot-password-container">
      <Row className="justify-content-center align-items-center">
        {/* Left Column: Form and Text */}
        <Col md={6} className="left-column">
          <span
            style={{ fontWeight: 600 }}
            onClick={handleLoginClick}
            className="back-to-login"
          >
            {'< Back to login'}
          </span>
          <h2 style={{ fontWeight: 600 }}>Forgot your password?</h2>
          <p>Enter your email to recover your password</p>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@gmail.com"
                required
                className="form-control"
              />
            </Form.Group>
            <Button type="submit" className="submit-btn">
              Submit
            </Button>
            {/* Divider */}
            <div className="divider-container">
              <hr className="divider-line" />
              <span className="divider-text">Or login with</span>
              <hr className="divider-line" />
            </div>
            {/* Google Sign-in Button */}
            <Button variant="outline-dark" className="google-signup-button">
              <i className="fab fa-google google-icon"></i> Google
            </Button>
          </Form>
        </Col>

        {/* Right Column: Image */}
        <Col md={6} className="right-column">
          <img src={assets.ForgotPWD} alt="Illustration" className="illustration-img" />
        </Col>
      </Row>
    </Container>


  );
};

export default ForgotPassword;
