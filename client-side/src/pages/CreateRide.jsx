import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Clock, FileText, Save, ArrowLeft, Users } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { capitalizeLocation } from '../utils/locationUtils';

const CreateRide = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    rideDate: '',
    rideHour: '12',
    rideMinute: '00',
    ridePeriod: 'AM',
    price: '',
    negotiable: false,
    description: '',
    genderPreference: 'ANYONE'
  });

  const createRideMutation = useMutation({
    mutationFn: async (rideData) => {
      const token = localStorage.getItem('token');
             const response = await fetch('http://localhost:8081/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ride');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rides']);
      showSuccess('Ride created successfully!');
      navigate('/');
    },
    onError: (error) => {
      showError(`Error creating ride: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-capitalize pickup and destination fields
    let processedValue = value;
    if (name === 'pickup' || name === 'destination') {
      processedValue = capitalizeLocation(value);
    }
    
    // Handle price field - only allow numbers and prevent leading zeros
    if (name === 'price') {
      // Remove any non-numeric characters
      let numericValue = value.replace(/[^0-9]/g, '');
      
      // Remove leading zeros (but keep single '0' if that's all there is)
      if (numericValue.length > 1 && numericValue.startsWith('0')) {
        numericValue = numericValue.replace(/^0+/, '');
      }
      
      processedValue = numericValue;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.pickup || !formData.destination || !formData.rideDate || !formData.rideHour || !formData.rideMinute || !formData.price) {
      showError('Please fill in all required fields');
      return;
    }

    // Validate price - must be a positive number starting with non-zero digit
    // This regex ensures: ^[1-9] (starts with 1-9) \d* (followed by any number of digits)
    if (!/^[1-9]\d*$/.test(formData.price)) {
      showError('Price must be a positive number starting with a non-zero digit');
      return;
    }

    // Format time as "HH:MM AM/PM"
    const formattedTime = `${formData.rideHour.padStart(2, '0')}:${formData.rideMinute.padStart(2, '0')} ${formData.ridePeriod}`;
    
    const rideData = {
      pickup: formData.pickup,
      destination: formData.destination,
      rideDate: formData.rideDate,
      rideTime: formattedTime,
      price: formData.price,
      negotiable: formData.negotiable,
      description: formData.description,
      genderPreference: formData.genderPreference
    };

    createRideMutation.mutate(rideData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Post a New Ride</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-blue-500" />
              Pickup Location *
            </label>
            <input
              type="text"
              name="pickup"
              value={formData.pickup}
              onChange={handleInputChange}
              placeholder="e.g., VIT Main Gate, Chennai Central"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-blue-500" />
              Destination *
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="e.g., T Nagar, Marina Beach"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1 text-blue-500" />
                Ride Date *
              </label>
              <input
                type="date"
                name="rideDate"
                value={formData.rideDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1 text-blue-500" />
                Ride Time *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="rideHour"
                  value={formData.rideHour}
                  onChange={handleInputChange}
                  min="01"
                  max="12"
                  className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="flex items-center text-gray-500">:</span>
                <input
                  type="number"
                  name="rideMinute"
                  value={formData.rideMinute}
                  onChange={handleInputChange}
                  min="00"
                  max="59"
                  className="w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <select
                  name="ridePeriod"
                  value={formData.ridePeriod}
                  onChange={handleInputChange}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="inline h-4 w-4 mr-1 text-green-500">₹</span>
              Price *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1 text-blue-500" />
              Gender Preference *
            </label>
            <select
              name="genderPreference"
              value={formData.genderPreference}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="ANYONE">Anyone</option>
              <option value="FEMALES_ONLY">Females Only</option>
              <option value="MALES_ONLY">Males Only</option>
            </select>
          </div>

          {/* Negotiable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="negotiable"
              checked={formData.negotiable}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Price is negotiable
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1 text-blue-500" />
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any additional details about your ride..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRideMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {createRideMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Post Ride
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for a great ride post:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about pickup and drop locations</li>
          <li>• Set a reasonable price that others will find attractive</li>
          <li>• Add helpful details in the description</li>
          <li>• Consider marking price as negotiable for better responses</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateRide;
