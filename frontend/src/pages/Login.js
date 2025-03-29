import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; // Importing icons for show/hide password
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending login request with:', { username, password }); // Log the request data
      const response = await axios.post('http://localhost:8000/api/auth/login/', { username, password }); // Ensure trailing slash
      console.log('Login response:', response.data); // Log the response data
      const { id, username: userUsername, email, role, token } = response.data; // Updated to use token
      const userData = { id, username: userUsername, email, role, token };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token); // Save the token in localStorage
      axios.defaults.headers.common['Authorization'] = `Token ${token}`; // Updated to use Token
      console.log('Token received and set:', token); // Log the token when it is received and set

      toast.success('Login successful!');

      // Redirect based on role
      if (role === 'admin') {
        navigate('/manage-products');
      } else if (role === 'user') {
        navigate('/products');
      } else {
        navigate('/'); // Default redirection if role is not recognized
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Failed to log in. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Username</label> {/* Change label to Username */}
          <input
            type="text" // Changed input type to text for username
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="relative mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type={showPassword ? "text" : "password"} // Toggle input type for password visibility
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
          <button
            type="button"
            className="absolute inset-y-8 right-0 px-3 py-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
