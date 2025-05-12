import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const navigate = useNavigate();

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  // Detect if we're in production immediately on load
  const isProduction = useMemo(() =>
    window.location.hostname.includes('onrender.com') ||
    window.location.hostname.includes('herokuapp.com') ||
    !window.location.hostname.includes('localhost'),
    []);

  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await axiosInstance.get('/api/rentals/');
        const productsData = response.data.slice(0, 12);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Pre-generate placeholders for each product to avoid regeneration on each render
  const productPlaceholders = useMemo(() => {
    const placeholders = {};
    if (products.length > 0) {
      products.forEach(product => {
        placeholders[product.id] = generatePlaceholder(product.name);
      });
    }
    return placeholders;
  }, [products]);

  // Generate a colored SVG placeholder based on product name
  function generatePlaceholder(name) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 80%)`;
    const textColor = `hsl(${hue}, 70%, 30%)`;
    const firstLetter = name.charAt(0).toUpperCase() || '?';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${color}"/>
      <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  // Helper function to get image source
  const getImageSource = (product) => {
    // In production, always use placeholders (no HTTP requests for images)
    if (isProduction) {
      return productPlaceholders[product.id] || generatePlaceholder(product.name);
    }

    // In development, try to load actual images
    return product.image_url || product.image || generatePlaceholder(product.name);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16 relative z-0">
      {/* Hero Section */}
      <section className="bg-yellow-600 text-white py-20 relative z-10">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Rentify</h1>
          <p className="text-xl mb-8">Your one-stop solution for renting products</p>
          <Link to="/products" className="bg-white text-yellow-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Available Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <p className="text-center text-lg">No products available</p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300 transform hover:scale-105 relative cursor-pointer"
                  onClick={() => setActiveProduct(product)}
                >
                  <div className="h-48 mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageSource(product)}
                      alt={product.name || 'Product Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Only happens in development since production uses SVG placeholders directly
                        console.error(`❌ Image error for ${product.name}:`, e.target.src);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = productPlaceholders[product.id] || generatePlaceholder(product.name);
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-600 font-serif">{product.name}</h3>
                  <p className="font-bold text-lg mt-2">${product.price}/day</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal Section */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative overflow-y-auto"
            style={{ marginTop: '5rem', maxHeight: 'calc(100vh - 8rem)' }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{activeProduct.name}</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={productPlaceholders[activeProduct.id] || generatePlaceholder(activeProduct.name)}
                alt={activeProduct.name || 'Product Image'}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  // This should never happen now, but just in case
                  console.error(`❌ Modal image error for ${activeProduct.name}:`, e.target.src);
                  e.target.onerror = null;
                  e.target.src = generatePlaceholder(activeProduct.name);
                }}
              />
            </div>
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-yellow-600 text-white px-4 py-2 rounded mt-4 hover:bg-yellow-700 w-full"
            >
              Rent Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;