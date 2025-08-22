import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Calendar, Shield, Edit, Save, X, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const { data: myRides, isLoading: ridesLoading } = useQuery({
    queryKey: ['my-rides'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/rides/my-rides', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      setIsEditing(false);
    },
    onError: (error) => {
      alert(`Error updating profile: ${error.message}`);
    },
  });

  const resolveRideMutation = useMutation({
    mutationFn: async (rideId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/rides/${rideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resolve ride');
      }

      // Don't try to parse JSON for empty response
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rides']);
      queryClient.invalidateQueries(['rides']); // Also refresh home page rides
    },
    onError: (error) => {
      alert(`Error resolving ride: ${error.message}`);
    },
  });

  const handleEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResolveRide = (rideId) => {
    if (window.confirm('Are you sure you want to mark this ride as resolved? This action cannot be undone.')) {
      resolveRideMutation.mutate(rideId);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture */}
          <div className="text-center">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-32 w-32 rounded-full mx-auto mb-4 border-4 border-blue-100"
              />
            ) : (
              <div className="h-32 w-32 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center border-4 border-blue-100">
                <User className="h-16 w-16 text-blue-600" />
              </div>
            )}
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                {user.isVerified ? 'Verified VIT Student' : 'Verification Pending'}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Rides */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Rides</h2>
        
        {ridesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : myRides?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't posted any rides yet.</p>
            <a
              href="/create-ride"
              className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Post your first ride →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Rides */}
            {myRides?.filter(ride => ride.isActive).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Active Rides</h3>
                <div className="space-y-4">
                  {myRides?.filter(ride => ride.isActive).map((ride) => (
                    <div key={ride.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {ride.pickup} → {ride.destination}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(ride.rideTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ₹{ride.price} {ride.negotiable && '(Negotiable)'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                          <button
                            onClick={() => handleResolveRide(ride.id)}
                            disabled={resolveRideMutation.isPending}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Resolve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Rides */}
            {myRides?.filter(ride => !ride.isActive).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Resolved Rides</h3>
                <div className="space-y-4">
                  {myRides?.filter(ride => !ride.isActive).map((ride) => (
                    <div key={ride.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700">
                            {ride.pickup} → {ride.destination}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(ride.rideTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Price: ₹{ride.price} {ride.negotiable && '(Negotiable)'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Resolved
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
