import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, List, Bell, Settings, LogOut, Box, PlusCircle, ChevronRight, Menu } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(true); // Initially collapsed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For small screens

  if (!user) {
    return null; // Return null if user is not available
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Hamburger Menu for Small Screens */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-900 text-white rounded-full shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed h-screen bg-gray-900 text-white flex flex-col shadow-xl ${
          isCollapsed ? 'w-16' : 'w-48'
        } transition-all duration-300 z-10 lg:mt-16 ${
          isMobileMenuOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-3 text-gray-300 hover:text-white transition self-end hidden lg:block"
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
          <Link to="/" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
            <Home size={22} className="text-teal-400" /> {!isCollapsed && <span>Home</span>}
          </Link>
          <Link to="/products" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
            <Box size={22} className="text-red-400" /> {!isCollapsed && <span>Products</span>}
          </Link>
          <Link to="/categories" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
            <List size={22} className="text-blue-400" /> {!isCollapsed && <span>Categories</span>}
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
            <Bell size={22} className="text-yellow-400" /> {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
            <Settings size={22} className="text-purple-400" /> {!isCollapsed && <span>Settings</span>}
          </Link>
          {user.role === 'admin' && (
            <Link to="/add-product" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
              <PlusCircle size={22} className="text-green-400" /> {!isCollapsed && <span>Add Product</span>}
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
