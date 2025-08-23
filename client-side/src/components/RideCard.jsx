import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, User, MessageCircle, Calendar, Tag } from 'lucide-react';

const RideCard = ({ ride }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatPrice = (price) => {
    return price || '0';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getGenderPreferenceColor = (preference) => {
    switch (preference) {
      case 'ONLY_FEMALES':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'ONLY_MALES':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGenderPreferenceText = (preference) => {
    switch (preference) {
      case 'ONLY_FEMALES':
        return 'Females Only';
      case 'ONLY_MALES':
        return 'Males Only';
      default:
        return 'Anyone';
    }
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    navigate('/chat', { 
      state: { 
        rideId: ride.id, 
        rideOwner: ride.owner 
      } 
    });
  };

  // Check if current user is the ride creator
  const isOwner = user?.id === ride.owner.id;

  return (
    <div 
      className={`gradient-card rounded-2xl p-6 hover-lift border border-gray-100 ${
        isOwner ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={() => {
        // Only navigate to chat if user is not the ride creator
        if (!isOwner) {
          navigate('/chat', { 
            state: { 
              rideId: ride.id, 
              rideOwner: ride.owner 
            } 
          });
        }
      }}
    >
      {/* Header with owner info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{ride.owner.name}</h3>
            <p className="text-sm text-gray-500">Posted {formatDate(ride.createdAt)}</p>
            {/* Your Ride Tag */}
            {isOwner && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                Your Ride
              </span>
            )}
          </div>
        </div>
        
        {/* Gender Preference Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getGenderPreferenceColor(ride.genderPreference)}`}>
          {getGenderPreferenceText(ride.genderPreference)}
        </span>
      </div>

      {/* Route Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-gray-700 font-medium">{ride.pickup}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="text-gray-700 font-medium">{ride.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(ride.rideDate)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{ride.rideTime}</span>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className="text-lg font-bold text-gray-800">₹{formatPrice(ride.price)}</span>
          {ride.negotiable && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Negotiable</span>
          )}
        </div>
        
        {/* Only show chat button if user is not the ride creator */}
        {!isOwner && (
          <button
            onClick={handleChatClick}
            className="btn-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </button>
        )}
      </div>

      {/* Description (if available) */}
      {ride.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{ride.description}</p>
        </div>
      )}
    </div>
  );
};

export default RideCard;
