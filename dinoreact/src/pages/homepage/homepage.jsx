import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import './homepage.css';
import { assets } from '../../assets/assets';
import Button from 'react-bootstrap/Button';

const homepage = () => {

  //const [category] =useState("All"); 

  return (
    <div className='homepage'>
      <div className='homepageleft'>
        <p>Select an option</p>
        <Button variant='primary' size='lg'>
          <Link to="" className='GFSbtn'>Generate From Scratch</Link>
        </Button>
        <br />
        <Button variant='primary' size='lg' className='PSbtn'>
          <Link to="/converter" className='PSbtn'>Provide Schema</Link>
        </Button>
        <p>Login or Sign Up to save in cloud your generated data</p>
      </div>
      <div className='homepageright'>
        <img src={assets.homepageimg} alt="homepageimg" className='homepageimg' />
      </div>
    </div>
  )
}

export default homepage
