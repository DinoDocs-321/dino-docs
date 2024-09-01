import React, { useState } from 'react';
import axios from 'axios';
import './signin.css';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post('http://localhost:8000/api/signin/', {
        email: email,
        password: password,
        });

        // Save the tokens in local storage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        console.log('Login successful:', response.data);
        // Redirect the user or handle the logged-in state

    } catch (error) {
        console.error('Login failed:', error);
        setError('Invalid email or password. Please try again.');
    }
    };
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <h3 className="card-title text-left text-lg">Login</h3>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="two">
                  <div className="form-group form-check mt-3">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                    <a href="#" className="float-right">Forgot Password?</a>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <div className="form-group text-center">
                  <span>Don't have an account? <a href="signup.html">Sign up</a></span>
                </div>
                <div className="form-group text-center mt-3">
                  <span>Or login with</span>
                  <br />
                  <button type="button" className="btn btn-outline-danger">
                    <i className="fab fa-google"></i> Google
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 d-none d-md-block">
          <img src="path/to/your/image.png" alt="Login Image" className="img-fluid" />
        </div>
      </div>
    </div>
  );
}

export default SignIn;
