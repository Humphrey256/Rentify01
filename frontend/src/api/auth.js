import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Updated API URL

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, { email, password }); // Ensure trailing slash
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
