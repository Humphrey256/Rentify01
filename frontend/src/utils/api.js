import axios from 'axios';

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';

// Get appropriate API URL - handle undefined values
const prodUrl = process.env.REACT_APP_PROD_API_URL;
const devUrl = process.env.REACT_APP_API_URL;

const API_BASE_URL = isProduction
    ? (prodUrl ? prodUrl.replace('/api', '') : 'https://rentify-1-d4gk.onrender.com')
    : (devUrl ? devUrl.replace('/api', '') : 'http://localhost:8000');

console.log('Using API base URL:', API_BASE_URL);

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Set timeout to 60 seconds
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
    (config) => {
        // Use 'accessToken' instead of 'token'
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Utility to get image URL with fallback
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  try {
    // If it's already a full URL (starts with http)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Extract filename from path
    const filename = imagePath.split('/').pop();
    
    // If we have a direct URL for this image in our map, use it
    if (IMAGE_MAP[filename]) {
      return IMAGE_MAP[filename];
    }
    
    // Check if we're in production
    const isProduction = !window.location.hostname.includes('localhost');
    
    if (isProduction) {
      // In production, prefer direct image URLs from our map
      // Return a reasonable fallback based on file extension
      return IMAGE_MAP['bugatti.jpg']; // Default fallback
    } else {
      // In development, use the API
      return `${API_URL}/media/rentals/${filename}`;
    }
  } catch (error) {
    console.error('Error getting image URL:', error);
    // Return a working imgur URL as final fallback
    return "https://i.imgur.com/vYQRmHM.jpeg";
  }
}

export default axiosInstance;
