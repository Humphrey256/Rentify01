// API Configuration with ad blocker mitigation
const DEV_API_URL = 'http://localhost:8000';
const PROD_API_URL = 'https://rentify01-1.onrender.com'; // Your Render.com backend URL

// Determine which API URL to use based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? PROD_API_URL
  : DEV_API_URL;

// Create axios instance with custom configuration
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    // Add a non-standard header to reduce likelihood of being blocked by ad blockers
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

export { API_URL };
export default api;