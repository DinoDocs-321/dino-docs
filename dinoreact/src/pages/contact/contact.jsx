import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import './contact.css';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

const Contact = () => {
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(values => ({ ...values, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(JSON.stringify(inputs));
  };

  return (
    <div className="contact-container">
      <div className="contact-info">
        <p className="justify-content-md-center">Contact information</p>
        <ul>
          <p>+61123456789</p>
          <p>demo@gmail.com</p>
          <p>Northfields Ave, Wollongong NSW 2522</p>
          <img src={assets.dinologo} alt="Logo" className="logo" />
        </ul>
      </div>
      <div className="contact-form">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control placeholder="First Name" onChange={handleChange}/>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control placeholder="Last Name" onChange={handleChange}/>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email" onChange={handleChange}/>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridPhoneNum">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control placeholder="0412345678" onChange={handleChange}/>
            </Form.Group>
          </Row>

          <fieldset>
            <Form.Group as={Row} className="mb-3">
              <Col sm={12}>
                  <Form.Label as="legend" column>
                      Select Subject
                  </Form.Label>
              </Col>

              <Col sm={12} className="radio-group">
                  <Form.Check
                      type="radio"
                      label="General Inquiry"
                      name="formHorizontalRadios"
                      id="formHorizontalRadios1"
                      onChange={handleChange}
                  />
                  <Form.Check
                      type="radio"
                      label="Booking Inquiry"
                      name="formHorizontalRadios"
                      id="formHorizontalRadios2"
                      onChange={handleChange}
                  />
                  <Form.Check
                      type="radio"
                      label="Business Inquiry"
                      name="formHorizontalRadios"
                      id="formHorizontalRadios3"
                      onChange={handleChange}
                  />
                  <Form.Check
                      type="radio"
                      label="Other Inquiry"
                      name="formHorizontalRadios"
                      id="formHorizontalRadios4"
                      onChange={handleChange}
                  />
              </Col>
            </Form.Group>
          </fieldset>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Example textarea</Form.Label>
            <Form.Control as="textarea" rows={7} onChange={handleChange}/>
          </Form.Group>
          <input type="submit" />
        </Form>
      </div>
    </div>
  );
}

export default Contact;
