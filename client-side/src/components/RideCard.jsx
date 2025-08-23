import React from 'react';
import { MapPin, Clock, DollarSign, User, MessageCircle, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RideCard = ({ ride }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === ride.owner.id;

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return format(date, 'MMM dd, yyyy - HH:mm');
  };

  const formatPrice = (price) => {
    return `₹${price}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
        <div className="flex justify-between items-start">
          <div className="text-white">
            <h3 className="font-semibold text-lg truncate">{ride.pickup}</h3>
            <div className="flex items-center text-blue-100 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>to</span>
            </div>
            <h4 className="font-semibold text-lg truncate">{ride.destination}</h4>
          </div>
          {isOwner && (
            <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">
              Your Ride
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Time */}
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm">{formatDateTime(ride.rideTime)}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-semibold text-lg text-green-600">
              {formatPrice(ride.price)}
            </span>
          </div>
          {ride.negotiable && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Negotiable
            </span>
          )}
        </div>

        {/* Gender Preference */}
        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2 text-purple-500" />
          <span className="text-sm">
            {ride.genderPreference === 'ANYONE' && 'Anyone'}
            {ride.genderPreference === 'FEMALES_ONLY' && 'Females Only'}
            {ride.genderPreference === 'MALES_ONLY' && 'Males Only'}
          </span>
        </div>

        {/* Description */}
        {ride.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {ride.description}
          </p>
        )}

        {/* Owner Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center">
            {ride.owner.photoUrl ? (
              <img
                src={ride.owner.photoUrl}
                alt={ride.owner.name}
                className="h-8 w-8 rounded-full mr-2"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{ride.owner.name}</p>
              <p className="text-xs text-gray-500">{ride.owner.email}</p>
            </div>
          </div>

          {/* Action Button */}
          {!isOwner && (
            <button 
              onClick={() => navigate('/chat', { state: { rideId: ride.id, rideOwner: ride.owner } })}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
          )}
        </div>

        {/* Posted Time */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          Posted {format(new Date(ride.createdAt), 'MMM dd, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default RideCard;
