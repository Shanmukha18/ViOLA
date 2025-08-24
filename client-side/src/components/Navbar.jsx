import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUnread } from '../contexts/UnreadContext';
import { Home, Plus, MessageCircle, User, Car } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasUnreadMessages } = useUnread();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors duration-300">
                <Car className="h-8 w-8" />
                <span className="text-xl font-bold">ViOLA</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="btn-primary text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors duration-300">
              <Car className="h-8 w-8" />
              <span className="text-xl font-bold">ViOLA</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                isActive('/') 
                  ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#A5C9CA] after:to-[#E7F6F2] after:rounded-full' 
                  : 'text-white hover:font-semibold hover:scale-105'
              }`}
            >
              <Home className="h-4 w-4 mr-1 text-white transition-all duration-300" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/create-ride"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                isActive('/create-ride') 
                  ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#A5C9CA] after:to-[#E7F6F2] after:rounded-full' 
                  : 'text-white hover:font-semibold hover:scale-105'
              }`}
            >
              <Plus className="h-4 w-4 mr-1 text-white transition-all duration-300" />
              <span>Create Ride</span>
            </Link>
            
            <Link
              to="/chat"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                isActive('/chat') 
                  ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#A5C9CA] after:to-[#E7F6F2] after:rounded-full' 
                  : 'text-white hover:font-semibold hover:scale-105'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-1 text-white transition-all duration-300" />
              <span>Chat</span>
              {hasUnreadMessages && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full red-dot-pulse"></div>
              )}
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                isActive('/profile') 
                  ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#A5C9CA] after:to-[#E7F6F2] after:rounded-full' 
                  : 'text-white hover:font-semibold hover:scale-105'
              }`}
            >
              <User className="h-4 w-4 mr-1 text-white transition-all duration-300" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
