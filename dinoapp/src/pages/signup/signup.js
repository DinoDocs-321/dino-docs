import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import './signup.css'; // Import custom CSS for additional styling

// Import assets from the specified path
import { assets } from '../../assets/assets';

const Signup = () => {
const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
});

const [message, setMessage] = useState('');
const [errors, setErrors] = useState({});

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value,
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword, termsAccepted } = formData;

    // Reset errors
    setErrors({});

    // Validation checks
    if (password !== confirmPassword) {
    setErrors({ ...errors, confirmPassword: "Passwords do not match!" });
    return;
    }

    if (!termsAccepted) {
    setErrors({ ...errors, termsAccepted: "You must accept the terms and privacy policies." });
    return;
    }

    try {
      // Make the API call to register the user
    const response = await axios.post('http://localhost:8000/api/register/', formData);

    if (response.status === 201) {
        setMessage("Registration successful! Please login.");
    } else {
        setMessage("Registration failed. Please try again.");
    }
    } catch (error) {
    console.error("There was an error!", error);
    setMessage("An error occurred. Please try again.");
    }
};

return (
    <Container className="my-5">
    <Row className="justify-content-center align-items-center">
        <Col md={5} className="d-none d-md-block">
          {/* Left Column for Image */}
        <div className="signup-img-container">
            <img src={assets.Rectangle} alt="Sign Up" className="img-fluid" />
        </div>
        </Col>
        <Col md={7}>
        <div className="signup-form-container">
            <h3 className="signup-title text-left mb-4">Sign Up</h3>
            <div>
            {Object.keys(errors).length > 0 && (
                <Alert variant="danger" dismissible>
                <ul className="mb-0">
                    {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                    ))}
                </ul>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3" style={{ gap: '1%' }}>
                <Col>
                    <Form.Group controlId="formFirstName">
                    <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="formLastName">
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3" style={{ gap: '1%' }}>
                  <Col>
                    <Form.Group controlId="formEmail">
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formPhone">
                      <Form.Control
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

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

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="termsAccepted"
                    id="terms"
                    label={
                      <>
                        I agree to all the <a href="#">Terms and Privacy Policies</a>
                      </>
                    }
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="form-group mb-3">
                  <Button type="submit" className="col-md-12 btn btn-dark">Create account</Button>
                </div>

                {message && <p className="mt-3 text-center">{message}</p>}

                <div className="mt-3 text-center">
                  <p>Already have an account? <a href="/login">Login</a></p>
                </div>

                <div className="mt-3 text-center">
                  <p>Or Sign up with</p>
                  <Button variant="outline-dark"><i className="fab fa-google"></i> Google</Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
