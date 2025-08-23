import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import RideCard from '../components/RideCard';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const Home = () => {
  const { user, token } = useAuth();
  const { showError, showInfo, showSuccess } = useNotification();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldFetchRides, setShouldFetchRides] = useState(false);
  const lastNotificationRef = useRef('');

  // Search filters
  const [filterPickup, setFilterPickup] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterGender, setFilterGender] = useState('ANYONE');
  const [filterDate, setFilterDate] = useState('');

  // Auto-capitalize function
  const capitalizeLocation = (text) => {
    return text.replace(/[a-zA-Z]/g, (char) => char.toUpperCase());
  };

  const handleSearch = async () => {
    if (!filterPickup.trim() || !filterDestination.trim()) {
      showError('Please enter both pickup and destination locations');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(apiService.rides(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRides(data);
        setShouldFetchRides(false);
      } else {
        showError('Failed to fetch rides');
      }
    } catch (error) {
      showError('Error fetching rides');
    } finally {
      setIsSearching(false);
    }
  };

  // Filter rides based on search criteria
  useEffect(() => {
    if (rides.length > 0 && hasSearched && !isSearching) {
      const filtered = rides.filter(ride => {
        // Require both pickup and destination to be provided
        const matchesPickup = filterPickup && 
          ride.pickup.toLowerCase().includes(filterPickup.toLowerCase());
        const matchesDestination = filterDestination && 
          ride.destination.toLowerCase().includes(filterDestination.toLowerCase());
        
        // Gender filter - apply if not "ANYONE"
        const matchesGender = filterGender === 'ANYONE' || 
          ride.genderPreference === filterGender;
        
        // Date filter - apply if a date is provided
        const matchesDate = !filterDate || ride.rideDate === filterDate;

        // Show rides that match:
        // 1. Pickup AND destination (required)
        // 2. Gender preference (if specified, not "ANYONE")
        // 3. Date (if specified)
        return matchesPickup && matchesDestination && matchesGender && matchesDate;
      });

      setFilteredRides(filtered);
      
      // Show notifications only after search is completed
      const notificationKey = `${filtered.length}-${filterPickup}-${filterDestination}`;
      
      if (lastNotificationRef.current !== notificationKey) {
        lastNotificationRef.current = notificationKey;
        
        if (filtered.length === 0) {
          showInfo('No rides found matching your criteria');
        } else if (filtered.length > 0) {
          showSuccess(`Found ${filtered.length} ride(s)`);
        }
      }
    }
  }, [rides, hasSearched, isSearching]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-[#A5C9CA] via-[#E7F6F2] to-[#A5C9CA] bg-clip-text text-transparent font-extrabold">
              Ride Share
            </span>
          </h1>
          <p className="text-lg text-[#E7F6F2] max-w-2xl mx-auto">
            Connect with fellow students for safe and cost effective ride sharing. 
            Search for rides or create your own journey.
          </p>
        </div>

        {/* Search Section */}
        <div className="gradient-card rounded-2xl p-8 mb-8 hover-lift">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* From Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="From"
                value={filterPickup}
                onChange={(e) => setFilterPickup(capitalizeLocation(e.target.value))}
                className="input-focus w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#395B64] bg-white"
              />
            </div>

            {/* To Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="To"
                value={filterDestination}
                onChange={(e) => setFilterDestination(capitalizeLocation(e.target.value))}
                className="input-focus w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#395B64] bg-white"
              />
            </div>

            {/* Gender Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="input-focus w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#395B64] bg-white appearance-none cursor-pointer"
              >
                <option value="ANYONE">Anyone</option>
                <option value="ONLY_FEMALES">Only Females</option>
                <option value="ONLY_MALES">Only Males</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                className="input-focus w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#395B64] bg-white cursor-pointer"
              />
            </div>
          </div>

          {/* Search Buttons */}
          <div className="text-center space-x-4">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-primary text-white px-8 py-3 rounded-lg font-medium text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <div className="loading-pulse w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search Rides
                </div>
              )}
            </button>
            
            {hasSearched && (
              <button
                onClick={() => {
                  setFilterPickup('');
                  setFilterDestination('');
                  setFilterGender('ANYONE');
                  setFilterDate('');
                  setHasSearched(false);
                  setFilteredRides([]);
                }}
                className="px-6 py-3 border border-[#395B64] text-[#395B64] rounded-lg font-medium text-lg hover:bg-[#395B64] hover:text-white transition-all duration-300 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Rides Section */}
        <div className="space-y-6">
          {hasSearched && filteredRides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride, index) => (
                <div key={ride.id} className="card-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                  <RideCard ride={ride} />
                </div>
              ))}
            </div>
          )}
          
          {hasSearched && filteredRides.length === 0 && (
            <div className="text-center py-12">
              <div className="gradient-card rounded-2xl p-12 max-w-md mx-auto">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Rides Found
                </h3>
                <p className="text-gray-500">
                  No rides match your search criteria. Try adjusting your filters or create a new ride.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;