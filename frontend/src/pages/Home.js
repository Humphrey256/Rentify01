import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const navigate = useNavigate();

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

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

  // Helper function to get proper image URL with better error handling
  const getImageUrlFromPath = (urlPath) => {
    // Generate unique colored placeholder based on product name
    const getColoredPlaceholder = (productName = '') => {
      const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hue = hash % 360;
      const color = `hsl(${hue}, 70%, 80%)`;
      const textColor = `hsl(${hue}, 70%, 30%)`;
      const firstLetter = productName.charAt(0).toUpperCase() || '?';

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="${color}"/>
        <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
      </svg>`;

      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    if (!urlPath) {
      return getColoredPlaceholder("Product");
    }

    try {
      // Check if we're in production (on Render.com)
      const isProduction = window.location.hostname.includes('onrender.com');

      // Try specific external image map first for production
      if (isProduction) {
        // Define direct URLs for known images (matching our backend config)
        const imageMap = {
          "bugatti.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/bugatti.jpg",
          "lawn_moer.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/lawn_moer.jpg",
          "lambogini.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/lambogini.jpg",
          "dodge_challenger.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/dodge_challenger.jpg", 
          "electric_driller.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/electric_driller.jpg",
          "kia_seltos.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/kia_seltos.jpg",
          "harrier.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/harrier.jpg",
          "mini_power_generator.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/mini_power_generator.jpg",
          "vitz.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/vitz.jpg",
          "range_rover_spot.jpg": "https://raw.githubusercontent.com/hanningtonem/rentify-images/main/range_rover_spot.jpg"
        };
        
        // Extract filename
        const filename = urlPath.split('/').pop();
        
        // If we have a direct URL for this image, use it
        if (filename && imageMap[filename]) {
          return imageMap[filename];
        }
        
        // Fall back to placeholder if no direct match
        const productName = filename
            .replace(/\.[^/.]+$/, "") // Remove file extension
            .replace(/[_-]/g, " ")    // Replace underscores and dashes with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
            
        return getColoredPlaceholder(productName);
      }

      // In development, try to use actual images
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

      // Map specific problematic filenames to known good ones
      const filenameMap = {
        "electric.jpg": "electric_driller.jpg",
        "vitz.jpg": "range_rover_spot.jpg", // Fallback to another image since vitz isn't available
      };

      if (filenameMap[filename]) {
        filename = filenameMap[filename];
      }

      return `${API_BASE}/media/rentals/${filename}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return getColoredPlaceholder("Product");
    }
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
                      src={getImageUrlFromPath(product.image_url || product.image)}
                      alt={product.name || 'Product Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`❌ Image error for ${product.name}:`, e.target.src);
                        e.target.onerror = null; // Prevent infinite loop

                        // Generate a colored placeholder specific to this product
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

                  // Generate a colored placeholder specific to this product
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