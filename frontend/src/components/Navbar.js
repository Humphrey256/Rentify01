import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Car, Home, Box, LogIn, UserPlus, LayoutDashboard, LogOut, Bell, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isNotificationsPage = location.pathname === '/notifications';

  // Fetch unread notifications count
  const fetchUnreadNotifications = async () => {
    if (user && user.token) {
      console.log('Using token for notifications:', user.token); // Debug log
      try {
        const res = await axios.get('http://localhost:8000/api/notifications/unread/', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUnreadNotifications(res.data.count);
        console.log('Unread notifications fetched:', res.data.count);
      } catch (err) {
        if (err.response?.status === 401) {
          console.log('Token expired. Attempting to refresh...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            user.token = newToken; // Update user token
            fetchUnreadNotifications(); // Retry the request
          } else {
            console.error('Failed to refresh token. Logging out...');
            logout();
            navigate('/login');
          }
        } else {
          console.error('Error fetching unread notifications:', err.response?.data || err.message);
        }
      }
    }
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: localStorage.getItem('refreshToken'), // Use refresh token from localStorage
      });
      const newAccessToken = res.data.access;
      localStorage.setItem('accessToken', newAccessToken); // Update localStorage
      return newAccessToken;
    } catch (err) {
      console.error('Error refreshing token:', err.response?.data || err.message);
      return null;
    }
  };

  useEffect(() => {
    if (!user || !user.token) return;

    fetchUnreadNotifications();

    const intervalId = setInterval(fetchUnreadNotifications, 30000); // Fetch every 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken'); // Correct key
      const accessToken = localStorage.getItem('accessToken'); // Correct key

      if (!refreshToken || !accessToken) {
        console.error('No tokens found');
        logout(); // Clear user context
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/api/auth/logout/',
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Logout successful:', response.data);

      // Clear tokens and user context
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      logout(); // Call context logout
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error.response?.data || error.message);
      // Still clear tokens if logout request fails (optional but safer)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white text-gray-800 p-4 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with Icon */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <Car size={28} className="text-yellow-600" />
          <span className="tracking-wide text-yellow-600">Rentify</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <ul className={`md:flex gap-6 ${isOpen ? 'block' : 'hidden'} md:block text-lg`}>
          <li>
            <Link to="/" className="hover:text-yellow-600 flex items-center gap-2">
              <Home size={20} /> Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-yellow-600 flex items-center gap-2">
              <Box size={20} /> Products
            </Link>
          </li>
          {user && (
            <>
              {/* Notifications Link */}
              <li>
                <Link to="/notifications" className="hover:text-yellow-600 flex items-center gap-2 relative">
                  <div className="relative">
                    <Bell size={20} />
                    {unreadNotifications > 0 && !isNotificationsPage && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                  Notifications
                </Link>
              </li>

              {/* Settings Link */}
              <li>
                <Link to="/settings" className="hover:text-yellow-600 flex items-center gap-2">
                  <Settings size={20} /> Settings
                </Link>
              </li>
            </>
          )}
          {location.pathname !== '/login' && (
            user ? (
              <>
                {user.role === 'user' && (
                  <li>
                    <Link to="/dashboard" className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 flex items-center gap-2">
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-yellow-600 flex items-center gap-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-yellow-600 flex items-center gap-2">
                    <LogIn size={20} /> Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-yellow-600 flex items-center gap-2">
                    <UserPlus size={20} /> Register
                  </Link>
                </li>
              </>
            )
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
