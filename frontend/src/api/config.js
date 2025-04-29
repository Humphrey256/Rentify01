import axios from 'axios';

// In development, we use relative URLs which get proxied through the React dev server
// In production, we continue using the full URL
const isProd = process.env.NODE_ENV === 'production';
const API_URL = isProd ? 'https://rentify01-yfnu.onrender.com' : '';
const MEDIA_URL = isProd ? 'https://rentify01-yfnu.onrender.com/media' : '/media'; // Updated to use the same domain

// Track backend status to prevent excessive retries
let backendStatus = {
  lastAttempt: null,
  attemptCount: 0,
  isSpinningUp: false
};

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout to allow for Render spin-up
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
  response => {
    // Reset backend status on successful response
    backendStatus = {
      lastAttempt: new Date(),
      attemptCount: 0,
      isSpinningUp: false
    };
    return response;
  },
  error => {
    // Log the error for debugging
    console.error('API Error:', error.message);
    
    // Track backend status
    backendStatus.lastAttempt = new Date();
    backendStatus.attemptCount += 1;
    
    // Create a more user-friendly error message
    if (error.message === 'Network Error') {
      error.userMessage = 'Unable to connect to the server. Please check your internet connection or disable ad blockers that might be interfering with the request.';
    } else if (error.response && error.response.status === 504) {
      backendStatus.isSpinningUp = true;
      
      // Special message for Render's 504 Gateway Timeout
      error.userMessage = 'The server is taking longer than expected to respond. This is normal for our free hosting plan after periods of inactivity. The app will automatically use sample data while the server starts up (this may take 1-2 minutes).';
      error.isRenderSpinUp = true;
    } else if (error.response && error.response.status === 500) {
      // Handle 500 Internal Server Error - common for static file issues
      error.userMessage = 'The server encountered an error when processing this request. This might be a temporary issue with static files. Refreshing the page may help.';
      error.isStaticFileError = error.config && (
        error.config.url.includes('/static/') || 
        error.config.url.includes('/dist/') ||
        error.config.url.includes('.css') ||
        error.config.url.includes('.js')
      );
    } else if (error.response && error.response.status === 520) {
      // Cloudflare 520 error handling
      error.userMessage = 'The web server is returning an unknown error (520). This is typically a temporary issue that will be resolved shortly.';
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
  
  // Handle fallback sample images
  if (imagePath.includes('sample-')) {
    return `/placeholder-image.jpg`;
  }
  
  // Use a single domain for all requests to avoid cross-origin issues
  return `${API_URL}/media/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
};

/**
 * Makes a request with automatic retry for timeout errors
 * Useful for Render's free tier which may need time to spin up
 */
const requestWithRetry = async (method, url, data = null, options = {}) => {
  const { 
    retries = 2, 
    retryDelay = 5000, 
    useFallback = false,
    fallbackData = null,
    onRetry = null 
  } = options;
  
  // If too many recent failures and fallback is available, use it immediately
  const recentFailures = backendStatus.attemptCount > 3 && 
    (new Date() - backendStatus.lastAttempt) < 60000;
    
  if (useFallback && fallbackData && recentFailures) {
    console.log('Using fallback data immediately due to recent failures');
    return { data: fallbackData, isFallback: true };
  }
  
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
    // Only retry on timeout, 504, 500, or 520 errors
    const shouldRetry = error.code === 'ECONNABORTED' || 
                      (error.response && 
                       (error.response.status === 504 || 
                        error.response.status === 500 ||
                        error.response.status === 520));
                        
    if (shouldRetry && retries > 0) {
      console.log(`Request failed, retrying... (${retries} retries left)`);
      
      // Call the onRetry callback if provided
      if (typeof onRetry === 'function') {
        onRetry(error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Retry with one less retry attempt
      return requestWithRetry(method, url, data, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5 // Increase delay for subsequent retries
      });
    }
    
    // If we're out of retries and have fallback data, use it
    if (useFallback && fallbackData) {
      console.log('Using fallback data after retries failed');
      return { data: fallbackData, isFallback: true };
    }
    
    throw error;
  }
};

export { API_URL, getImageUrl, requestWithRetry, backendStatus };
export default api;