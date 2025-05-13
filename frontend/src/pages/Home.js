import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("Fetching products...");
        const response = await axiosInstance.get('/api/rentals/');
        const productsData = response.data.slice(0, 12);
        console.log(`Successfully loaded ${productsData.length} products`);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Helper function to get proper image URL (copied from Products.js)
  const getImageUrlFromPath = (urlPath) => {
    if (!urlPath) return '';

    try {
      // If it's already a full URL with the correct path and working format, use it directly
      if (urlPath.includes('/media/rentals/') &&
        (urlPath.startsWith('http://') || urlPath.startsWith('https://'))) {
        return urlPath;
      }

      // Extract the filename from whatever path format we have
      let filename = urlPath.split('/').pop();

      // Handle any encoding
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        // If decoding fails, continue with original
      }

      // IMPORTANT: Replace spaces with underscores to match server filenames
      filename = filename.replace(/\s+/g, '_');

      // Build the correct URL with consistent path
      return `${API_BASE}/media/rentals/${filename}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
  };

  // Add this function to handle image errors (copied from Products.js)
  const handleImageError = (e, productName) => {
    console.log(`❌ Image error for ${productName}: ${e.target.src}`);
    // Set a fallback image
    e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
    e.target.onerror = null; // Prevent infinite loop
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
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white shadow-lg rounded-lg p-4 animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2 mx-auto"></div>
                  <div className="h-5 bg-gray-300 rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <p className="text-center text-lg col-span-full">No products available</p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300 transform hover:scale-105 relative cursor-pointer"
                    onClick={() => setActiveProduct(product)}
                  >
                    <div className="h-48 mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrlFromPath(product.image_url || product.image)}
                        alt={product.name || 'Product Image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`❌ Image error for ${product.name}:`, e.target.src);
                          e.target.onerror = null; // Prevent infinite loop
                          
                          // Use colored SVG placeholder
                          const hash = product.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const hue = hash % 360;
                          const color = `hsl(${hue}, 70%, 80%)`;
                          const textColor = `hsl(${hue}, 70%, 30%)`;
                          const firstLetter = product.name.charAt(0).toUpperCase() || '?';
                          
                          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                            <rect width="200" height="200" fill="${color}"/>
                            <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
                          </svg>`;
                          
                          e.target.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-indigo-600 font-serif">{product.name}</h3>
                    <p className="font-bold text-lg mt-2">${product.price}/day</p>
                  </div>
                ))
              )}
            </div>
          )}
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
                src={getImageUrlFromPath(activeProduct.image_url || activeProduct.image)}
                alt={activeProduct.name || 'Product Image'}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  console.error(`❌ Modal image error for ${activeProduct.name}:`, e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  
                  // Use colored SVG placeholder
                  const hash = activeProduct.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const hue = hash % 360;
                  const color = `hsl(${hue}, 70%, 80%)`;
                  const textColor = `hsl(${hue}, 70%, 30%)`;
                  const firstLetter = activeProduct.name.charAt(0).toUpperCase() || '?';
                  
                  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="${color}"/>
                    <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
                  </svg>`;
                  
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
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