import React from 'react';
import { Link } from 'react-router-dom';
import './homepage.css';
import { assets } from '../../assets/assets';
import Container from 'react-bootstrap/Container';

const Homepage = () => {
  return (
    <Container className="justify-content-md-center">
      <div className='homepage'>
        <div className='homepageleft'>
          <p>Select an option</p>
          <Link to="/converter">
            <button className='GFSbtn'>
              Generate From Scratch
            </button>
          </Link>
          <br />
          <Link to="/converter">
            <button className='PSbtn'>
              Provide Schema
            </button>
          </Link>
          <p className="justify-content-center">Login or Sign Up to save in cloud your generated data</p>
        </div>
        <div className='homepageright'>
          <img src={assets.homepageimg} alt="homepageimg" className='homepageimg' />
        </div>
      </div>
    </Container>
  );
};

export default Homepage;
