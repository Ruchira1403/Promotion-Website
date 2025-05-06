import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SocialAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        login(userData, token);
        
        // Redirect based on user role
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error processing authentication:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, login, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3">Authenticating...</p>
    </div>
  );
};

export default SocialAuthCallback;