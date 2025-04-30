import axios from 'axios';

// Use production API URL when in production, otherwise use local development URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL.replace('/api', '')  // Remove '/api' since it's included in individual requests
    : process.env.REACT_APP_API_URL.replace('/api', '');      // Remove '/api' since it's included in individual requests

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Set timeout to 60 seconds
});

export default axiosInstance;
