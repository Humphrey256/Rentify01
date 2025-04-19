import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; // Importing social media icons

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <h3 className="text-xl font-bold">About Rentify</h3>
          <p className="text-gray-400">Rentify is your one-stop solution for renting a wide range of products. We offer high-quality products at affordable prices.</p>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <Link to="/" className="hover:text-yellow-600">Home</Link>
          <Link to="/products" className="hover:text-yellow-600">Products</Link>
          <Link to="/contact" className="hover:text-yellow-600">Contact</Link>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">
            <FaTwitter size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600">
            <FaInstagram size={24} />
          </a>
        </div>
        <div className="text-gray-400">
          <p>&copy; 2025 Rentify. All rights reserved.</p>
          <p>Contact us: info@rentify.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
