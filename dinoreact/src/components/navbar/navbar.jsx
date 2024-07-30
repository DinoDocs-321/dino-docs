import React, { useState } from 'react';
import './navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menu, setMenu, setShowLogin] = useState("home");

  return (
    <div className='navbar'>
      
      <ul className="navbar-menu">
        <Link to='/'><img src={assets.dinologo} alt="Logo" className="logo" /> </Link>
        <Link to='/homepage' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <Link to='/Generator' onClick={() => setMenu("Generator")} className={menu === "Generator" ? "active" : ""}>Generator</Link>
        <Link to='/Schema' onClick={() => setMenu("Schema")} className={menu === "Schema" ? "active" : ""}>Schema</Link>
        <Link to='/contact' onClick={() => setMenu("Contact")} className={menu === "contact-us" ? "active" : ""}>Contact</Link>
        <Link to='/About' onClick={() => setMenu("About")} className={menu === "about-us" ? "active" : ""}>About</Link>
      </ul>

      <div className="navbar-right">
            <button onClick={()=>setShowLogin(true)}>Sign In</button>
      </div>

    </div>
  );
}

export default Navbar;
