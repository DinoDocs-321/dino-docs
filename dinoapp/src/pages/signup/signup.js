import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation after signup
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import { assets } from '../../assets/assets';  // Adjust the path as needed for your assets
import './signup.css';

const Signup = () => {
  // State to handle form inputs
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});  // State to handle validation errors
  const [message, setMessage] = useState('');  // State to handle general messages

  const navigate = useNavigate();  // Hook to navigate to different routes

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});  // Clear previous errors

    const { password, confirm_password, termsAccepted } = formData;

    // Client-side validation
    if (password !== confirm_password) {
      setErrors({ ...errors, confirm_password: "Passwords do not match!" });
      return;
    }

    if (!termsAccepted) {
      setErrors({ ...errors, termsAccepted: "You must accept the terms and privacy policies." });
      return;
    }

    try {
      // Make the API request to the Django backend
      const response = await axios.post('http://localhost:8000/api/register/', formData);

      if (response.status === 201) {
        setMessage("Registration successful! Redirecting to homepage...");

        setTimeout(() => navigate('/generate'), 2000);  // Redirect to homepage after 2 seconds
      }
    } catch (error) {
      console.error('There was an error registering the user!', error);
      setMessage("An error occurred. Please try again.");
      if (error.response && error.response.data) {
        setErrors(error.response.data);  // Set errors from server response
      }
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
            <Form onSubmit={handleSubmit} method="POST">
                <Row className="mb-3" style={{ gap: '1%' }}>
                <Col>
                    <Form.Group controlId="formFirstName">
                    <Form.Control
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="formLastName">
                      <Form.Control
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
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
                        name="phone_number"
                        placeholder="Phone Number"
                        value={formData.phone_number}
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
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
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
                  <p>Already have an account? <a href="/#">Login</a></p>
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
