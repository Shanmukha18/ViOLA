import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Clock, User, MessageCircle, Users, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import RideCard from '../components/RideCard';
import { capitalizeLocation } from '../utils/locationUtils';

const Home = () => {
  const [filterPickup, setFilterPickup] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterGender, setFilterGender] = useState('ANYONE'); // Default to Anyone
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldFetchRides, setShouldFetchRides] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showInfo, showSuccess, showError, showWarning } = useNotification();

  // Temporary test function for notifications
  const testNotifications = () => {
    showSuccess('Operation completed successfully!');
    setTimeout(() => showInfo('Here is some helpful information.'), 1000);
    setTimeout(() => showError('Something went wrong. Please try again.'), 2000);
    setTimeout(() => showWarning('Please check your input and try again.'), 3000);
  };

  const { data: rides, isLoading, error } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8081/api/rides');
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      return response.json();
    },
    enabled: shouldFetchRides, // Only fetch when search is performed
  });
  const handleSearch = () => {
    // Validate that at least one search criteria is provided
    if (!filterPickup && !filterDestination && filterGender === 'ANYONE' && filterDate === new Date().toISOString().split('T')[0]) {
      showWarning('Please enter at least one search criteria (From, To, Gender, or Date)');
      return;
    }
    
    setIsSearching(true);
    setShouldFetchRides(true); // Trigger data fetch
  };

  // Effect to handle filtering when rides data becomes available
  useEffect(() => {
    if (rides && shouldFetchRides && isSearching) {
      const filtered = rides.filter(ride => {
        const matchesPickup = !filterPickup || ride.pickup.toLowerCase().includes(filterPickup.toLowerCase());
        const matchesDestination = !filterDestination || ride.destination.toLowerCase().includes(filterDestination.toLowerCase());
        
        // Gender filter - optional, defaults to ANYONE
        const matchesGender = filterGender === 'ANYONE' || ride.genderPreference === filterGender;
        
        // Date filter - optional, defaults to today
        const matchesDate = !filterDate || (() => {
          // Now using rideDate field directly as string
          return ride.rideDate === filterDate;
        })();
        
        const matches = matchesPickup && matchesDestination && matchesGender && matchesDate;
        
        return matches;
      });
      
      setSearchResults(filtered);
      setHasSearched(true);
      setIsSearching(false);
      
      // Show notification with search results
      if (filtered.length === 0) {
        showInfo('No rides found. Try adjusting your search criteria.');
      } else {
        showSuccess(`Found ${filtered.length} ride${filtered.length !== 1 ? 's' : ''}!`);
      }
    }
  }, [rides, shouldFetchRides, isSearching, showInfo, showSuccess]);
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Auto-capitalize search inputs
  const handlePickupChange = (e) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeLocation(value);
    setFilterPickup(capitalizedValue);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeLocation(value);
    setFilterDestination(capitalizedValue);
  };
  const clearSearch = () => {
    setFilterPickup('');
    setFilterDestination('');
    setFilterGender('ANYONE');
    setFilterDate(new Date().toISOString().split('T')[0]);
    setSearchResults([]);
    setHasSearched(false);
    setShouldFetchRides(false); // Stop fetching data
  };

  // Only show search results, never show all rides
  const displayRides = searchResults;
  // Only show loading when actually searching
  if (isSearching) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow VIT students for safe and affordable cab rides. 
            Share rides, split costs, and make new friends along the way.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Enter From */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter From"
                value={filterPickup}
                onChange={handlePickupChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Enter To */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter To"
                value={filterDestination}
                onChange={handleDestinationChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ANYONE">Anyone</option>
                <option value="FEMALES_ONLY">Females Only</option>
                <option value="MALES_ONLY">Males Only</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="Select Date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Search Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Searching...
            </button>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Searching for rides...</h3>
          <p className="text-gray-600">Please wait while we find matching rides for you.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow VIT students for safe and affordable cab rides. 
            Share rides, split costs, and make new friends along the way.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Enter From */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter From"
                value={filterPickup}
                onChange={handlePickupChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Enter To */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter To"
                value={filterDestination}
                onChange={handleDestinationChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ANYONE">Anyone</option>
                <option value="FEMALES_ONLY">Females Only</option>
                <option value="MALES_ONLY">Males Only</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="Select Date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Search Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Rides
            </button>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center py-8">
          <p className="text-red-600">Error loading rides: {error.message}</p>
          <button
            onClick={() => {
              setShouldFetchRides(false);
              setHasSearched(false);
              setSearchResults([]);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Ride
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with fellow VIT students for safe and affordable cab rides.
           Share rides, split costs, and make new friends along the way.
        </p>
        {/* Temporary test button */}
        <button
          onClick={testNotifications}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Test Notifications
        </button>
      </div>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Enter From */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Enter From"
              value={filterPickup}
              onChange={handlePickupChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Enter To */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Enter To"
              value={filterDestination}
              onChange={handleDestinationChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Gender Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="ANYONE">Anyone</option>
              <option value="FEMALES_ONLY">Females Only</option>
              <option value="MALES_ONLY">Males Only</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              placeholder="Select Date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onKeyPress={handleKeyPress}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
                {/* Search Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Search Rides
              </>
            )}
          </button>
        </div>
        {/* Search Status */}
        {hasSearched && (
          <div className="mt-2 text-center text-sm text-gray-600">
            Found {searchResults.length} ride{searchResults.length !== 1 ? 's' : ''} matching your criteria
          </div>
        )}
        {/* Clear Filters Button */}
        {(hasSearched || filterPickup || filterDestination || filterGender !== 'ANYONE' || filterDate !== new Date().toISOString().split('T')[0]) && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
      {/* Rides Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Available Rides ({displayRides.length})
          </h2>
          {isAuthenticated && (
            <a
              href="/create-ride"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Post a Ride
            </a>
          )}
        </div>
        {displayRides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasSearched ? 'No rides found' : 'Search for rides'}
            </h3>
            <p className="text-gray-600">
              {hasSearched
                ? 'Try adjusting your search criteria and search again'
                : 'Enter your pickup and destination locations to find available rides'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;