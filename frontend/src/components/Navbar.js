import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Car, Home, Box, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react'; // Using lucide-react icons
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white text-gray-800 p-4 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with Icon */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <Car size={28} className="text-yellow-600" /> {/* Car Icon */}
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
