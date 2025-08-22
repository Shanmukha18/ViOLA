import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Clock, DollarSign, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RideCard from '../components/RideCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPickup, setFilterPickup] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const { isAuthenticated } = useAuth();

  const { data: rides, isLoading, error } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
             const response = await fetch('http://localhost:8081/api/rides');
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      return response.json();
    },
  });

  const filteredRides = rides?.filter(ride => {
    const matchesSearch = ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPickup = !filterPickup || ride.pickup.toLowerCase().includes(filterPickup.toLowerCase());
    const matchesDestination = !filterDestination || ride.destination.toLowerCase().includes(filterDestination.toLowerCase());
    
    return matchesSearch && matchesPickup && matchesDestination;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading rides: {error.message}</p>
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
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Pickup Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Filter by pickup location..."
              value={filterPickup}
              onChange={(e) => setFilterPickup(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Destination Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Filter by destination..."
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Rides Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Available Rides ({filteredRides.length})
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

        {filteredRides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-600">
              {searchTerm || filterPickup || filterDestination 
                ? 'Try adjusting your search criteria'
                : 'Be the first to post a ride!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
