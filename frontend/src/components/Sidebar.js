import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Search, List, Bell, Settings, LogOut, Box, PlusCircle, ChevronRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(true); // Initially collapsed

  if (!user) {
    return null; // Return null if user is not available
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`fixed h-screen bg-gray-900 text-white flex flex-col shadow-xl mt-16 ${isCollapsed ? 'w-16' : 'w-47'} transition-all duration-300 z-10`}> {/* Set z-index to 10 */}
      {/* Toggle Button */}
      <button onClick={toggleSidebar} className="p-3 text-gray-300 hover:text-white transition self-end">
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
          <>
            <Link to="/add-product" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition">
              <PlusCircle size={22} className="text-green-400" /> {!isCollapsed && <span>Add Product</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto px-4 mb-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition">
          <LogOut size={22} className="text-white" /> {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
