import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import './contact.css'; // Import the CSS file for styling

const Contact = () => {
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(JSON.stringify(inputs)); // Convert inputs to string for alert
  };

  return (
    <div className="contact-container">
      <div className="contact-info">
        <p>Contact information</p>
        <ul>
          <p>+61123456789</p>
          <p>demo@gmail.com</p>
          <p>Northfields Ave, Wollongong NSW 2522</p>
          <img src={assets.dinologo} alt="Logo" className="logo" />
        </ul>
      </div>
      <div className="contact-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              First Name:
            </label>
            <input 
              type="text" 
              name="firstName" 
              value={inputs.firstName || ""} 
              onChange={handleChange}
            />

            <label>
              Email:
            </label>
            <input 
              type="text" 
              name="email" 
              value={inputs.email || ""} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>
              Last Name:
            </label>
            <input 
              type="text" 
              name="lastName" 
              value={inputs.lastName || ""} 
              onChange={handleChange}
            />

            <label>
              Phone Number:
            </label>
            <input 
              type="text" 
              name="phoneNumber" 
              value={inputs.phoneNumber || ""} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group message-group">
            <label>
              Message:
            </label>
            <input 
              type="text" 
              name="message" 
              value={inputs.message || ""} 
              onChange={handleChange}
              className="message-input"
            />
          </div>
          <input type="submit" />
        </form>
      </div>
    </div>
  );
}

export default Contact;
