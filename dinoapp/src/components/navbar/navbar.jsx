import React, { useState } from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function DinoNavbar() {
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();

  // Function to handle sign out
  const handleSignOut = () => {
    // Clear the JWT tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect the user to the sign-in page
    navigate('/signin');
  };

  // Check if the user is authenticated
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <Navbar expand="lg" className=" dinonavbar">
      <Container >
        <Navbar.Brand href="/"><img src={assets.dinologo} alt="Logo" className="logo" /></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto dinonavbar-menu">

            <Nav.Link href='/homepage' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Nav.Link>
            <Nav.Link href='/JSONEditor' onClick={() => setMenu("Generator")} className={menu === "Generator" ? "active" : ""}>Generator</Nav.Link>
            <Nav.Link href='/Schema-Form' onClick={() => setMenu("Schema")} className={menu === "Schema" ? "active" : ""}>Schema</Nav.Link>
            <Nav.Link href='/converter' onClick={() => setMenu("Converter")} className={menu === "Converter" ? "active" : ""}>Converter</Nav.Link>
            <Nav.Link href='/contact' onClick={() => setMenu("Contact")} className={menu === "Contact" ? "active" : ""}>Contact</Nav.Link>
            <Nav.Link href='/About' onClick={() => setMenu("About")} className={menu === "About" ? "active" : ""}>About</Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DinoNavbar;
/*
const dinoNavbar = () => {
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();

  // Function to handle sign out
  const handleSignOut = () => {
    // Clear the JWT tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect the user to the sign-in page
    navigate('/signin');
  };

  // Check if the user is authenticated
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <div className='dinonavbar'>
      <ul className="dinonavbar-menu">
        <Link to='/'><img src={assets.dinologo} alt="Logo" className="logo" /></Link>
        <Link to='/homepage' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <Link to='/JSONEditor' onClick={() => setMenu("Generator")} className={menu === "Generator" ? "active" : ""}>Generator</Link>
        <Link to='/Schema-Form' onClick={() => setMenu("Schema")} className={menu === "Schema" ? "active" : ""}>Schema</Link>
        <Link to='/contact' onClick={() => setMenu("Contact")} className={menu === "Contact" ? "active" : ""}>Contact</Link>
        <Link to='/About' onClick={() => setMenu("About")} className={menu === "About" ? "active" : ""}>About</Link>
      </ul>

      <div className="dinonavbar-right">
        {isAuthenticated ? (
          <button onClick={handleSignOut}>Sign Out</button>
        ) : (
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        )}
      </div>
    </div>
  );
};
*/

