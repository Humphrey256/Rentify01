// API Configuration
const DEV_API_URL = 'http://localhost:8000';
const PROD_API_URL = 'https://rentify01-1.onrender.com'; // Your Render.com backend URL

// Determine which API URL to use based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? PROD_API_URL
  : DEV_API_URL;

export default API_URL;