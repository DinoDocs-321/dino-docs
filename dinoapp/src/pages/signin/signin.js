// src/pages/signin/signin.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import { assets } from '../../assets/assets'; // Adjust the path as needed
import './signin.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/signin/', formData);
      const { access, refresh } = response.data;
      // Store tokens in localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      navigate('/homepage'); // Redirect to homepage after successful login
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data.error);
      } else {
        setErrors('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center align-items-center">
        <Col md={5} className="d-none d-md-block">
          {/* Left Column for Image */}
          <div className="signin-img-container">
            <img src={assets.Rectangle} alt="Sign In" className="img-fluid" />
          </div>
        </Col>
        <Col md={7}>
          <div className="signin-form-container">
            <h3 className="signin-title text-left mb-4">Sign In</h3>
            {errors && (
              <Alert variant="danger" dismissible onClose={() => setErrors('')}>
                {errors}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  name="rememberMe"
                />
                <a href="/forgot-password" className="text-decoration-none">
                  Forgot Password?
                </a>
              </div>

              <Button type="submit" className="col-md-12 btn btn-dark">
                Sign In
              </Button>

              <div className="mt-3 text-center">
                <p>
                  Don't have an account?{' '}
                  <a href="/signup" className="text-decoration-none">
                    Sign Up
                  </a>
                </p>
              </div>

              <div className="mt-3 text-center">
                <p>Or sign in with</p>
                <Button variant="outline-dark">
                  <i className="fab fa-google"></i> Google
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
