import axios from 'axios';

// Configure base API URL
// In development, use relative URLs to rely on the proxy
// In production, this could be set to the absolute URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rentify01-yfnu.onrender.com/api'
  : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Add authentication token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/token/refresh');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }
};

// Rentals APIs
export const rentalsAPI = {
  getAllRentals: async (filters = {}) => {
    try {
      const response = await api.get('/rentals', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get rentals failed:', error);
      throw error;
    }
  },
  
  getRentalById: async (id) => {
    try {
      const response = await api.get(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get rental ${id} failed:`, error);
      throw error;
    }
  },
  
  createRental: async (rentalData) => {
    try {
      const response = await api.post('/rentals', rentalData);
      return response.data;
    } catch (error) {
      console.error('Create rental failed:', error);
      throw error;
    }
  },
  
  updateRental: async (id, rentalData) => {
    try {
      const response = await api.put(`/rentals/${id}`, rentalData);
      return response.data;
    } catch (error) {
      console.error(`Update rental ${id} failed:`, error);
      throw error;
    }
  },
  
  deleteRental: async (id) => {
    try {
      const response = await api.delete(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete rental ${id} failed:`, error);
      throw error;
    }
  }
};

// Bookings APIs
export const bookingsAPI = {
  getAllBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Get bookings failed:', error);
      throw error;
    }
  },
  
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get booking ${id} failed:`, error);
      throw error;
    }
  },
  
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Create booking failed:', error);
      throw error;
    }
  }
};

// Reviews APIs
export const reviewsAPI = {
  getReviewsForRental: async (rentalId) => {
    try {
      const response = await api.get(`/reviews`, { params: { rental: rentalId }});
      return response.data;
    } catch (error) {
      console.error(`Get reviews for rental ${rentalId} failed:`, error);
      throw error;
    }
  },
  
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Create review failed:', error);
      throw error;
    }
  }
};

// Export a function to check API health
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

// Export the api instance for any other requests
export default api;
