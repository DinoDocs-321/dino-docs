import React from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

function DinoNavbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

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

  // Function to check if the current route is active
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" className=" dinonavbar navbar-dark">
      <Container>
        <Navbar.Brand href="/">
          <img src={assets.dinologo} alt="Logo" className="logo" height="16" style={{ marginTop: "-1px" }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto dinonavbar-menu">
            <Nav.Link href='/homepage' className={isActive('/homepage') ? 'active' : ''}>Home</Nav.Link>
            <Nav.Link href='/JSONEditor' className={isActive('/JSONEditor') ? 'active' : ''}>Generator</Nav.Link>
            <Nav.Link href='/Schema-Form' className={isActive('/Schema-Form') ? 'active' : ''}>Schema</Nav.Link>
            <Nav.Link href='/converter' className={isActive('/converter') ? 'active' : ''}>Converter</Nav.Link>
            <Nav.Link href='/contact' className={isActive('/contact') ? 'active' : ''}>Contact</Nav.Link>
            <Nav.Link href='/About' className={isActive('/About') ? 'active' : ''}>About</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <Button variant="link" className="me-2" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="link" className="me-2" onClick={() => navigate('/signin')}>Login</Button>
                <Button variant="primary" className="me-3" onClick={() => navigate('/signup')}>Sign up for free</Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DinoNavbar;
