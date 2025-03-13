import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosUtils';
import Cookies from 'js-cookie';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Make a POST request to the logout endpoint
        await axios.post('/api/auth/logout');

        // Clear cookies locally
        Cookies.remove('token');
        Cookies.remove('userType');

        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Handle error if needed
      }
    };

    // Automatically call handleLogout when the component mounts
    handleLogout();
  }, [navigate]);

  return (
    <></>
  );
};

export default Logout;
