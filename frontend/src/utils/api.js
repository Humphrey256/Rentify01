import axios from 'axios';

// Determine API base URL based on environment
const hostname = window.location.hostname;
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const API_URL = isDevelopment 
  ? process.env.REACT_APP_API_URL 
  : process.env.REACT_APP_API_URL_PROD || 'https://rentify-1-d4gk.onrender.com';

console.log(`Using API base URL: ${API_URL}`);

// Direct image URLs for fallback
const IMAGE_MAP = {
  "bugatti.jpg": "https://i.imgur.com/vYQRmHM.jpeg",
  "lawn_moer.jpg": "https://i.imgur.com/4aJKYpT.jpeg",
  "lambogini.jpg": "https://i.imgur.com/qLHb6fP.jpeg",
  "dodge_challenger.jpg": "https://i.imgur.com/hpKtGlf.jpeg", 
  "electric_driller.jpg": "https://i.imgur.com/0NZ6D9e.jpeg",
  "kia_seltos.jpg": "https://i.imgur.com/I34HXbR.jpeg",
  "harrier.jpg": "https://i.imgur.com/Ax8HdB0.jpeg",
  "mini_power_generator.jpg": "https://i.imgur.com/QJzLMY6.jpeg",
  "vitz.jpg": "https://i.imgur.com/Jh0a8v1.jpeg",
  "range_rover_spot.jpg": "https://i.imgur.com/ql0eDSh.jpeg"
};

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: false, // Set to true only if your backend supports credentials
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add authorization token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle network errors (likely CORS or server down)
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status === 503)) {
      console.error('Network error or server unavailable:', error.message);
      
      // For product listings, provide fallback data
      if (originalRequest.url === '/api/rentals/') {
        console.warn('Using fallback product data');
        return Promise.resolve({ 
          data: getFallbackProducts() 
        });
      }
    }
    
    // Handle 401 Unauthorized (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
        const { access } = response.data;
        
        localStorage.setItem('access_token', access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get fallback products when API is unavailable
function getFallbackProducts() {
  return [
    {
      id: 1,
      name: 'Bugatti',
      details: 'Luxury sports car with exceptional speed and performance.',
      price: 500,
      category: 'car',
      is_available: true,
      image: IMAGE_MAP['bugatti.jpg']
    },
    {
      id: 2,
      name: 'Lamborghini',
      details: 'High-performance Italian luxury sports car.',
      price: 450,
      category: 'car',
      is_available: true,
      image: IMAGE_MAP['lambogini.jpg']
    },
    {
      id: 3,
      name: 'Electric Drill',
      details: 'Heavy duty power tool for construction projects.',
      price: 35,
      category: 'machine',
      is_available: true,
      image: IMAGE_MAP['electric_driller.jpg']
    },
    {
      id: 4,
      name: 'Lawn Mower',
      details: 'Professional lawn mower for all your gardening needs.',
      price: 50,
      category: 'machine',
      is_available: true,
      image: IMAGE_MAP['lawn_moer.jpg']
    },
    {
      id: 5,
      name: 'Dodge Challenger',
      details: 'American muscle car with powerful performance.',
      price: 300,
      category: 'car',
      is_available: true,
      image: IMAGE_MAP['dodge_challenger.jpg']
    }
  ];
}

// Utility to get image URL with fallback
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  try {
    // Extract filename from path
    const filename = imagePath.split('/').pop();
    
    // If we have a direct URL for this image in our map, use it
    if (IMAGE_MAP[filename]) {
      return IMAGE_MAP[filename];
    }
    
    // Otherwise, try to use the API URL
    return `${API_URL}/media/rentals/${filename}`;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return '';
  }
}

export default axiosInstance;
