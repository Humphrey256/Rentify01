import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axiosInstance from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Products = () => {
  // Your existing state variables and hooks
  const { user } = useUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/rentals/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

      // In production, return colored SVG placeholders instead of trying to load images
      // This is because Render.com free tier doesn't persist uploaded media files
      if (isProduction) {
        // Extract product name from path if possible
        const filename = urlPath.split('/').pop();
        let productName = "Product";

        // Try to extract a human-readable name from the filename
        if (filename) {
          productName = filename
            .replace(/\.[^/.]+$/, "") // Remove file extension
            .replace(/[_-]/g, " ")    // Replace underscores and dashes with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
        }

        return getColoredPlaceholder(productName);
      }

      // In development, try to use actual images
      if (urlPath.includes('/media/rentals/') &&
        (urlPath.startsWith('http://') || urlPath.startsWith('https://'))) {
        return urlPath;
      }

      // Extract the filename
      let filename = urlPath.split('/').pop();

      // Handle any encoding
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        // If decoding fails, continue with original
      }

      // Replace spaces with underscores
      filename = filename.replace(/\s+/g, '_');

      // Map problematic filenames
      const filenameMap = {
        "electric.jpg": "electric_driller.jpg",
        "vitz.jpg": "range_rover_spot.jpg",
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

  const handleRentNow = (productId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${productId}`);
    }
  };

  // Your filtering logic
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true) &&
      (user?.role !== 'admin' ? product.is_available : true)
    );
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 relative">
      <h1 className="text-2xl font-bold mb-6 text-center">Available Products</h1>

      {/* Your existing search and filter UI */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">All Categories</option>
          <option value="car">Car</option>
          <option value="machine">Machine</option>
        </select>
      </div>

      {/* Product grid with updated image handling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300 transform hover:scale-105">
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
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="font-bold text-md mt-2">${product.price}/day</p>
            <p
              className="text-blue-600 cursor-pointer hover:underline mt-2"
              onClick={() => setActiveProduct(product)}
            >
              View Details
            </p>
            <button
              onClick={() => handleRentNow(product.id)}
              disabled={!product.is_available}
              className={`w-full p-2 mt-4 rounded ${product.is_available
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
            >
              {product.is_available ? 'Rent Now' : 'Not Available'}
            </button>
          </div>
        ))}
      </div>

      {/* Product detail modal with updated image handling */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">{activeProduct.name}</h2>
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
            <p className="font-bold text-md mt-4">${activeProduct.price}/day</p>
            {activeProduct.is_available && (
              <button
                onClick={() => {
                  setActiveProduct(null);
                  handleRentNow(activeProduct.id);
                }}
                className="bg-yellow-600 text-white p-2 mt-4 w-full rounded hover:bg-yellow-700"
              >
                Rent Now
              </button>
            )}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Products;