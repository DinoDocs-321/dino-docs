import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the JWT tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect the user to the sign-in page
    navigate('/signin');
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '0' }}>
      <h2>Signing out...</h2>
    </div>
  );
};

export default SignOut;
