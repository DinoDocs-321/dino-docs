import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import './contact.css';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

const Contact = () => {
  const [inputs, setInputs] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('https://formspree.io/f/xpwzavzl', inputs);
      if (response.status === 200) {
        setStatusMessage('Message sent successfully!');
        setInputs({});
      } else {
        setStatusMessage('Failed to send the message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage('An error occurred while sending the message. Please try again later.');
    }

    // Clear the status message after a few seconds
    setTimeout(() => setStatusMessage(''), 5000);
  };

  return (
    <div className="contact-container">
      <div className="contact-info">
        <p className="justify-content-md-center"><b>Contact Information</b></p>
        <ul>
          <p>+61 0214339</p>
          <p>dinodocs@mail.co</p>
          <p>Northfields Ave, Wollongong NSW 2522</p>
          <img src={assets.dinologo} alt="Logo" className="logo" />
        </ul>
      </div>
      <div className="contact-form">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                placeholder="First Name"
                value={inputs.firstName || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastName"
                placeholder="Last Name"
                value={inputs.lastName || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={inputs.email || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridPhoneNum">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                name="phone"
                placeholder="0412345678"
                value={inputs.phone || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <fieldset>
            <Form.Group as={Row} className="mb-3">
              <Col sm={12}>
                <Form.Label as="legend" column>
                  Select Inquiry Type
                </Form.Label>
              </Col>
              <Col sm={12} className="radio-group">
                {['General Inquiry', 'Booking Inquiry', 'Business Inquiry', 'Other Inquiry'].map((type, index) => (
                  <Form.Check
                    type="radio"
                    label={type}
                    name="inquiryType"
                    value={type}
                    id={`formHorizontalRadios${index + 1}`}
                    checked={inputs.inquiryType === type}
                    onChange={handleChange}
                    key={type}
                  />
                ))}
              </Col>
            </Form.Group>
          </fieldset>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={7}
              name="message"
              placeholder="Enter your message"
              value={inputs.message || ''}
              onChange={handleChange}
            />
          </Form.Group>
          <Button type="submit" className='me-2 btn btn-link our-btn'>Submit</Button>
        </Form>

        {/* Status Message Display */}
        {statusMessage && <div className="status-message">{statusMessage}</div>}
      </div>
    </div>
  );
};

export default Contact;
