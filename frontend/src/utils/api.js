import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Ensure the correct base URL

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Set timeout to 60 seconds
});

export default axiosInstance;
