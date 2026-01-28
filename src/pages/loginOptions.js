import React from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'; // Google auth package
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuth } from '../AuthContext';
import Login from './login';
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
function LoginOptions() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleAimsLogin = () => {

    navigate('/'); // Redirects to /login URL
  };
  const handleLoginSuccess = async (credentialResponse) => {
    

    // Decode the token
    const decodedToken = jwtDecode(credentialResponse.credential);
    const userEmail = decodedToken.email; // Extract email from the token
    // console.log('Toekn:', );
   
    try {
      // Call the backend API to check if the user can log in
      const response = await axios.post(`${ADMIN_URL}/check-user`, {
        email: userEmail,
      });
      const token = credentialResponse;
      const { canLogin, role } = response.data;
      login(token,role, userEmail);
      console.log('User:', userEmail, 'Role:', role, 'Can login:', canLogin);
      if (canLogin) {
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "student") {
          navigate("/student/enroll");
        } else if (role === "faculty") {
          navigate("/home");
        } else {
          navigate("/default-dashboard");
        } // Navigate to the homepage or any other route
      } else {
        logout();
        console.log('Access denied for user:', userEmail);
        alert('You are not authorized to access this application.');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="options">
      <h2>Login Options</h2>
      <div className="login-options-container">
        <div className="login-option">
          <h4>Login with your IIT Ropar Google ID</h4>
          <p>Before proceeding, please ensure that:</p>
          <ul>
            <li>JavaScript is not blocked by your browser.</li>
            <li>Popups are not blocked by your browser.</li>
            <li>You are not logged into multiple Google accounts.</li>
            <li>Please try clearing the browser cache if you get the "popup closed by user" error.</li>
            <li>We strongly suggest that you open this website in an independent window.</li>
          </ul>
          <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                console.log('Login failed');
                alert('Login failed. Please try again.');
              }}
              useOneTap
            />
        </div>

        {/* AIMS Credentials Login Option */}
        <div className="login-option">
          <h4>Login with AIMS credentials</h4>
          <p>Please note that:</p>
          <ul>
            <li>JavaScript is not blocked by your browser.</li>
            <li>AIMS credentials are independent from your LDAP/CRP.</li>
            <li>Reset your AIMS password (not the LDAP one) when using it for the first time.</li>
            <li>Your login ID is your entry number (e.g., 2020MEB1234).</li>
          </ul>
          <button className="aims-login" onClick={handleAimsLogin}>Login with AIMS</button>
        </div>
      </div>
    </div>
  );
}

export default LoginOptions;
