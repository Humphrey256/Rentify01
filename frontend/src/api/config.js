import axios from 'axios';

// In development, we use relative URLs which get proxied through the React dev server
// In production, we continue using the full URL
const isProd = process.env.NODE_ENV === 'production';
const API_URL = isProd ? 'https://rentify01-yfnu.onrender.com' : '';
const MEDIA_URL = isProd ? 'https://rentify01-1.onrender.com/media' : '/media';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds to allow for Render spin-up
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`Making request to: ${config.url}`);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log the error for debugging
    console.error('API Error:', error.message);
    
    // Create a more user-friendly error message
    if (error.message === 'Network Error') {
      error.userMessage = 'Unable to connect to the server. Please check your internet connection or disable ad blockers that might be interfering with the request.';
    } else if (error.response && error.response.status === 504) {
      error.userMessage = 'The server is taking too long to respond. This might be because the server is spinning up after inactivity. Please try again in a moment.';
    } else if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      error.userMessage = `Server error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      error.userMessage = 'No response received from server. The server might be down or unreachable.';
    } else {
      // Something happened in setting up the request that triggered an Error
      error.userMessage = 'An error occurred while setting up the request.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  return `${API_URL}/media/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
};

/**
 * Makes a request with automatic retry for timeout errors
 * Useful for Render's free tier which may need time to spin up
 */
const requestWithRetry = async (method, url, data = null, options = {}) => {
  const { retries = 2, retryDelay = 3000 } = options;
  
  try {
    if (method === 'get') {
      return await api.get(url, options);
    } else if (method === 'post') {
      return await api.post(url, data, options);
    } else if (method === 'put') {
      return await api.put(url, data, options);
    } else if (method === 'patch') {
      return await api.patch(url, data, options);
    } else if (method === 'delete') {
      return await api.delete(url, options);
    }
  } catch (error) {
    // Only retry on timeout or 504 errors
    if ((error.code === 'ECONNABORTED' || 
         (error.response && error.response.status === 504)) && 
         retries > 0) {
      console.log(`Request failed, retrying... (${retries} retries left)`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Retry with one less retry attempt
      return requestWithRetry(method, url, data, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5 // Increase delay for subsequent retries
      });
    }
    
    throw error;
  }
};

export { API_URL, getImageUrl, requestWithRetry };
export default api;