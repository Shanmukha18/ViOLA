import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);
    }
  }, []);

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // You'll need to set this
      callback: handleCredentialResponse,
      auto_select: false,
    });

    // Render the Google Sign-In button
    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 400,
        text: 'signin_with',
      });
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Decode the JWT token to get user info
      const userInfo = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Check if email is from VIT domain
      if (!userInfo.email.endsWith('@vit.ac.in') && !userInfo.email.endsWith('@vitstudent.ac.in')) {
        alert('Only VIT students with @vit.ac.in or @vitstudent.ac.in email addresses can register');
        return;
      }

      const googleUser = {
        email: userInfo.email,
        displayName: userInfo.name,
        photoURL: userInfo.picture,
        googleId: userInfo.sub,
      };
      
      await loginWithGoogle(googleUser);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div>
              {/* Google Sign-In Button will be rendered here */}
              <div ref={googleButtonRef} className="w-full flex justify-center"></div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Only VIT students with @vit.ac.in or @vitstudent.ac.in email addresses can register
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
