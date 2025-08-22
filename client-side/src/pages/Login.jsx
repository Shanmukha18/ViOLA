import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, Shield, Users, Clock } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to ViOLA
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            VIT's exclusive cab ride sharing platform
          </p>
        </div>

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

        {/* Features */}
        <div className="bg-white py-6 px-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Why ViOLA?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Safe & Verified</h4>
                <p className="text-xs text-gray-600">Only VIT students can join</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Community</h4>
                <p className="text-xs text-gray-600">Connect with fellow students</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Real-time</h4>
                <p className="text-xs text-gray-600">Instant ride updates & chat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
