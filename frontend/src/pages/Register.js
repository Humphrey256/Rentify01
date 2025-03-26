import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; // Importing icons for show/hide password
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user', // Default role
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData); // Updated endpoint with trailing slash
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white shadow-lg rounded">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="email"
            className="w-full p-2 mb-4 border rounded"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              className="w-full p-2 border rounded"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 py-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <select
            name="role"
            className="w-full p-2 mb-4 border rounded"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Register
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
