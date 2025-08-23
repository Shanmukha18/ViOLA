const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const apiService = {
  // Auth endpoints
  me: () => `${API_BASE_URL}/api/auth/me`,
  googleAuth: () => `${API_BASE_URL}/api/auth/google`,
  updateProfile: () => `${API_BASE_URL}/api/auth/profile`,
  
  // Rides endpoints
  rides: () => `${API_BASE_URL}/api/rides`,
  ride: (id) => `${API_BASE_URL}/api/rides/${id}`,
  myRides: () => `${API_BASE_URL}/api/rides/my-rides`,
  resolveRide: (id) => `${API_BASE_URL}/api/rides/${id}/resolve`,
  deleteRide: (id) => `${API_BASE_URL}/api/rides/${id}/permanent`,
  
  // Chat endpoints
  conversations: () => `${API_BASE_URL}/api/chat/conversations`,
  rideChat: (rideId) => `${API_BASE_URL}/api/chat/ride/${rideId}`,
  markRead: (rideId) => `${API_BASE_URL}/api/chat/mark-read/${rideId}`,
  
  // WebSocket endpoints (SockJS uses HTTP/HTTPS URLs)
  wsEndpoint: () => `${API_BASE_URL}/ws`,
};

export default apiService;
