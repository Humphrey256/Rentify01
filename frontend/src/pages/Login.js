import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const validateForm = () => {
    if (!username.trim()) {
      toast.error('Username is required.');
      return false;
    }
    if (!password.trim()) {
      toast.error('Password is required.');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Sending login request with:', { username, password }); // Log the request payload
      const response = await axios.post('http://localhost:8000/api/auth/login/', { username, password });
      console.log('Login response:', response.data); // Log the response data

      const { id, username: userUsername, email, role, token, refresh } = response.data;
      const userData = { id, username: userUsername, email, role, token };

      setUser(userData); // Update user context
      localStorage.setItem('user', JSON.stringify(userData)); // Save user to localStorage
      localStorage.setItem('accessToken', token);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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
      console.error('Login failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    console.log('Initiating Google login'); // Log the action
    window.location.href = 'http://localhost:8000/social-auth/login/google-oauth2/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="relative mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
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

        <div className="text-center mb-4">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
        </div>

        <div className="relative flex items-center justify-center w-full mt-6 mb-3">
          <div className="absolute border-t border-gray-300 w-full"></div>
          <div className="relative bg-white px-4 text-sm text-gray-500">Or login with</div>
        </div>

        {/* Google Login Button */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 p-2 rounded flex items-center justify-center hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;