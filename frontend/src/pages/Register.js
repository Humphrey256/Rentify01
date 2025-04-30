import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user', // Default role
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required.');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required.');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending registration data:', formData);
      await axiosInstance.post('/auth/register/', formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);

      if (error.response) {
        // Handle structured API errors
        if (error.response.data) {
          // Django REST Framework often returns errors in a specific format
          const apiErrors = error.response.data;

          if (apiErrors.username) {
            toast.error(`Username: ${apiErrors.username[0]}`);
          }
          if (apiErrors.email) {
            toast.error(`Email: ${apiErrors.email[0]}`);
          }
          if (apiErrors.password) {
            toast.error(`Password: ${apiErrors.password[0]}`);
          }
          if (apiErrors.non_field_errors) {
            toast.error(apiErrors.non_field_errors[0]);
          }
          if (apiErrors.detail) {
            toast.error(apiErrors.detail);
          }

          // If there are specific errors, don't show the generic one
          if (!apiErrors.username && !apiErrors.email && !apiErrors.password &&
            !apiErrors.non_field_errors && !apiErrors.detail) {
            setError('Registration failed. Please check your information and try again.');
          }
        } else {
          setError('Registration failed. Please try again.');
          toast.error('Registration failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        setError('Registration failed. Please try again.');
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google registration
  const handleGoogleRegister = () => {
    const API_BASE = axiosInstance.defaults.baseURL;
    window.location.href = `${API_BASE}/social-auth/login/google-oauth2/`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
      <div className="max-w-md w-full p-6 bg-white shadow-lg rounded">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <input
            type="email"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <select
            name="role"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white p-2 rounded transition-colors duration-300`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mb-4">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </div>

        <div className="relative flex items-center justify-center w-full mt-6 mb-3">
          <div className="absolute border-t border-gray-300 w-full"></div>
          <div className="relative bg-white px-4 text-sm text-gray-500">Or register with</div>
        </div>

        {/* Google Registration Button */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full bg-white border border-gray-300 p-2 rounded flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Register with Google
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default Register;
