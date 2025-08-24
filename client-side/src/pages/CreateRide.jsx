import React, { useState } from 'react';
import apiService from '../services/apiService';
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
             const response = await fetch(apiService.rides(), {
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

    // Validate date - must be today or future date
    const selectedDate = new Date(formData.rideDate + 'T00:00:00'); // Create date in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    if (selectedDate < today) {
      showError('Ride date cannot be in the past. Please select today or a future date.');
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 text-[#E7F6F2] hover:text-white hover:bg-[#395B64] rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Post a New Ride</h1>
        </div>

        {/* Form */}
        <div className="gradient-card rounded-lg p-6 hover-lift">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1 text-[#395B64]" />
                Pickup Location *
              </label>
              <input
                type="text"
                name="pickup"
                value={formData.pickup}
                onChange={handleInputChange}
                placeholder="e.g., VIT Main Gate, Men's Hostel"
                className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                required
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1 text-[#395B64]" />
                Destination *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="e.g., Katpadi Railway Station, Chennai Airport"
                className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1 text-[#395B64] cursor-pointer" />
                  Ride Date *
                </label>
                <input
                  type="date"
                  name="rideDate"
                  value={formData.rideDate}
                  onChange={handleInputChange}
                  min={(() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
                  className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent cursor-pointer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1 text-[#395B64] cursor-pointer" />
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
                    className="input-focus w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
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
                    className="input-focus w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                    required
                  />
                  <select
                    name="ridePeriod"
                    value={formData.ridePeriod}
                    onChange={handleInputChange}
                    className="input-focus w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent cursor-pointer"
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
                <span className="inline h-4 w-4 mr-1 text-[#395B64]">₹</span>
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
                required
              />
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1 text-[#395B64]" />
                Gender Preference *
              </label>
              <select
                name="genderPreference"
                value={formData.genderPreference}
                onChange={handleInputChange}
                className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent cursor-pointer"
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
                className="h-4 w-4 text-[#395B64] focus:ring-[#395B64] border-gray-300 rounded cursor-pointer"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Price is negotiable
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-[#395B64]" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any additional details about your ride..."
                rows="4"
                className="input-focus w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#395B64] focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#395B64] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRideMutation.isPending}
                className="btn-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
              >
                {createRideMutation.isPending ? (
                  <>
                    <div className="loading-pulse rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        <div className="mt-6 gradient-card rounded-lg p-4 hover-lift">
          <h3 className="text-sm font-medium text-[#2C3333] mb-2">Tips for a great ride post:</h3>
          <ul className="text-sm text-[#395B64] space-y-1">
            <li>• Be specific about pickup and drop locations</li>
            <li>• Set the correct price of the ride</li>
            <li>• Add helpful details in the description</li>
            <li>• Include spaces between words correctly for locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
