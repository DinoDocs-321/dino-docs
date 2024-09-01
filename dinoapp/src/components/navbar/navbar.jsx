import React, { useState } from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
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

export default Navbar;
