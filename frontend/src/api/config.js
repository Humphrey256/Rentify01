import axios from 'axios';

// In development, we use relative URLs which get proxied through the React dev server
// In production, we continue using the full URL
const isProd = process.env.NODE_ENV === 'production';
const API_URL = isProd ? 'https://rentify01-1.onrender.com' : '';
const MEDIA_URL = isProd ? 'https://rentify01-1.onrender.com/media' : '/media';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: false, // Try without credentials for cross-origin
  headers: {
    'Content-Type': 'application/json',
    // Remove any headers that might trigger ad blockers
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log(`Making request to: ${config.url}`);
  
  // Add a random query parameter to bypass caching and ad blockers
  const separator = config.url.includes('?') ? '&' : '?';
  config.url = `${config.url}${separator}_=${Date.now()}`;
  
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
      error.userMessage = 'Unable to connect to the server. This might be caused by an ad blocker or network issue. Try disabling any ad blockers or using a different browser.';
    } else if (error.response) {
      error.userMessage = `Server error: ${error.response.status}`;
    } else if (error.request) {
      error.userMessage = 'No response received from server.';
    } else {
      error.userMessage = 'An error occurred while setting up the request.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get image URLs that work with the proxy
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // For local development, use the proxied URL
  if (!isProd) {
    return `/media/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
  }
  
  // For production, use the full URL
  return `${MEDIA_URL}/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
};

export { API_URL, MEDIA_URL, getImageUrl };
export default api;