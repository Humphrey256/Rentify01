import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, List, Bell, Settings, Box, PlusCircle, ChevronRight, Menu } from 'lucide-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const Sidebar = () => {
  const { user } = useUser();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        console.error('Error fetching unread notifications:', err.response?.data || err.message);
      }
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/notifications/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Notifications fetched:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Access token expired. Attempting to refresh...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchNotifications(); // Retry the request with the new token
        } else {
          console.error('Failed to refresh token. Logging out...');
          // Handle logout if token refresh fails
        }
      } else {
        console.error('Error fetching notifications:', error.response?.data || error.message);
      }
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken'); // Retrieve refresh token from localStorage
      if (!refreshToken) {
        console.error('No refresh token found');
        return null;
      }

      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('accessToken', newAccessToken); // Update access token in localStorage
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      return null;
    }
  };

  useEffect(() => {
    if (!user || !user.token) return;

    fetchUnreadNotifications();

    const intervalId = setInterval(fetchUnreadNotifications, 30000);

    const handleNotificationUpdate = () => {
      fetchUnreadNotifications();
    };

    window.addEventListener('notifications-updated', handleNotificationUpdate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('notifications-updated', handleNotificationUpdate);
    };
  }, [user]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) return null;

  return (
    <>
      {/* Hamburger Menu for Small Screens */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-900 text-white rounded-full shadow-lg"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed h-screen bg-gray-900 text-white flex flex-col shadow-xl ${isCollapsed ? 'w-16' : 'w-48'
          } transition-all duration-300 z-10 ${isMobileMenuOpen ? 'block' : 'hidden'
          } lg:block`}
        style={{
          top: '4rem', // Push the sidebar down below the navbar (adjust '4rem' to match your navbar height)
          height: 'calc(100vh - 4rem)', // Ensure the sidebar fits within the remaining viewport
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-3 text-gray-300 hover:text-white transition self-end hidden lg:block"
          aria-label="Toggle Collapse"
        >
          <ChevronRight size={24} className={`${isCollapsed ? '' : 'rotate-180'} transition-transform`} />
        </button>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-8 px-4">
            <User size={32} className="text-yellow-400" />
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/' ? 'bg-gray-800' : ''
              }`}
          >
            <Home size={22} className="text-teal-400" /> {!isCollapsed && <span>Home</span>}
          </Link>
          <Link
            to="/products"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/products' ? 'bg-gray-800' : ''
              }`}
          >
            <Box size={22} className="text-red-400" /> {!isCollapsed && <span>Products</span>}
          </Link>
          <Link
            to="/categories"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/categories' ? 'bg-gray-800' : ''
              }`}
          >
            <List size={22} className="text-blue-400" /> {!isCollapsed && <span>Categories</span>}
          </Link>
          <Link
            to="/notifications"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${isNotificationsPage ? 'bg-gray-800' : ''
              }`}
          >
            <div className="relative">
              <Bell size={22} className="text-yellow-400" />
              {unreadNotifications > 0 && !isNotificationsPage && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span>
                Notifications
                {unreadNotifications > 0 && !isNotificationsPage && ` (${unreadNotifications})`}
              </span>
            )}
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/settings' ? 'bg-gray-800' : ''
              }`}
          >
            <Settings size={22} className="text-purple-400" /> {!isCollapsed && <span>Settings</span>}
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/add-product"
              className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/add-product' ? 'bg-gray-800' : ''
                }`}
            >
              <PlusCircle size={22} className="text-green-400" /> {!isCollapsed && <span>Add Product</span>}
            </Link>
          )}
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition ${location.pathname === '/profile' ? 'bg-gray-800' : ''}`}
          >
            <User size={22} className="text-cyan-400" /> {!isCollapsed && <span>Profile</span>}
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
