import React, { useState, useEffect, useRef } from 'react';
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
      const response = await fetch('http://localhost:8081/api/rides', {
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
        
        // Gender filter is optional (defaults to ANYONE)
        const matchesGender = filterGender === 'ANYONE' || 
          ride.genderPreference === filterGender;
        
        // Date filter is optional - only apply if a date is selected
        const matchesDate = !filterDate || ride.rideDate === filterDate;

        // Only show rides that match pickup AND destination (required)
        // AND gender preference (optional)
        // AND date if specified (optional)
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Find Your Perfect{' '}
            <span className="gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-[#395B64] to-[#2C3333]">
              Ride Share
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with fellow students for safe and convenient ride sharing. 
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

          {/* Search Button */}
          <div className="text-center">
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
          </div>
        </div>

        {/* Rides Section */}
        <div className="space-y-6">
          {!hasSearched ? (
            <div className="text-center py-12">
              <div className="gradient-card rounded-2xl p-12 max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Start Your Search
                </h3>
                <p className="text-gray-500">
                  Enter your pickup and destination locations above to find available rides.
                </p>
              </div>
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride, index) => (
                <div key={ride.id} className="card-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                  <RideCard ride={ride} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="gradient-card rounded-2xl p-12 max-w-md mx-auto">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Rides Found
                </h3>
                <p className="text-gray-500 mb-4">
                  No rides match your search criteria. Try adjusting your filters or create a new ride.
                </p>
                <button
                  onClick={() => {
                    setFilterPickup('');
                    setFilterDestination('');
                    setFilterGender('ANYONE');
                    setFilterDate('');
                    setHasSearched(false);
                  }}
                  className="btn-primary text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;