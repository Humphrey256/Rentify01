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

export default axiosInstance;
