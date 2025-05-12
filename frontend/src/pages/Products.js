import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    try {
      console.log('Fetching products from:', `${API_BASE}/api/rentals/`);
      const response = await axiosInstance.get('/api/rentals/');
      console.log('Products fetched:', response.data.length);

      // More aggressive debugging
      console.log('Raw API response:', response);

      if (response.data.length > 0) {
        console.log('First product data:', response.data[0]);
        // Check crucial fields
        console.log('Product has name?', Boolean(response.data[0].name));
        console.log('Product is_available value:', response.data[0].is_available);
        console.log('Product image path:', response.data[0].image);
      }

      // Normalize product data to ensure all expected fields exist
      const normalizedProducts = response.data.map(product => ({
        id: product.id,
        name: product.name || 'Unnamed Product',
        details: product.details || 'No description available',
        price: product.price || 0,
        category: product.category || '',
        is_available: product.is_available === undefined ? true : product.is_available,
        image: product.image || null,
        image_url: product.image_url || null
      }));

      console.log('Normalized products:', normalizedProducts.length);
      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRentNow = (productId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${productId}`);
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    if (!user || user.role !== 'admin') return;

    setIsUpdating(true);
    try {
      const response = await axiosInstance.patch(
        `/api/rentals/${productId}/`,
        { is_available: !currentStatus },
        { headers: { Authorization: `Token ${user.token}` } }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, is_available: response.data.is_available }
            : product
        )
      );

      if (activeProduct && activeProduct.id === productId) {
        setActiveProduct((prev) => ({
          ...prev,
          is_available: response.data.is_available,
        }));
      }

      toast.success(
        `Product is now ${response.data.is_available ? 'available' : 'unavailable'}`
      );
    } catch (error) {
      console.error('Error updating product availability:', error);
      toast.error('Failed to update product availability');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to get proper image URL
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

  // Add this function to handle image errors
  const handleImageError = (e, productName) => {
    console.log(`❌ Image error for ${productName}: ${e.target.src}`);
    // Set a fallback image
    e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
    e.target.onerror = null; // Prevent infinite loop
  };

  // Filter products based on user role
  const filteredProducts = products.filter((product) => {
    // For debug purposes
    if (products.length > 0 && product.id === products[0].id) {
      console.log('Filtering product:', product);
    }

    // For regular users, exclude unavailable products
    if (user?.role !== 'admin') {
      return (
        product.is_available && // Exclude unavailable products
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory ? product.category === filterCategory : true)
      );
    }

    // For admins, show all products
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
    );
  });

  // Add debugging for filtered results
  useEffect(() => {
    console.log('Total products:', products.length);
    console.log('Filtered products:', filteredProducts.length);
  }, [products, filteredProducts]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-2 md:ml-15 lg:ml-30 relative z-0">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Products</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-full p-2 border border-gray-300 rounded-lg shadow-sm"
        />
      </div>
      <div className="flex justify-center mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full max-w-full p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">All Categories</option>
          <option value="car">Car</option>
          <option value="machine">Machine</option>
        </select>
      </div>
      {filteredProducts.length === 0 ? (
        <p className="text-center text-lg">No available products</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300 transform hover:scale-105 relative"
            >
              <div className="h-48 mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={getImageUrlFromPath(product.image_url || product.image)}
                  alt={product.name || 'Product Image'}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, product.name)}
                />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-indigo-600 font-serif">{product.name}</h2>
              <p className="font-bold text-lg mt-2">${product.price}/day</p>

              <button
                className="cursor-pointer text-blue-600 hover:underline mt-2"
                onClick={() => setActiveProduct(product)}
              >
                View Details
              </button>

              {user?.role === 'admin' && (
                <button
                  className={`p-2 mt-2 w-full rounded ${product.is_available
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  onClick={() => toggleAvailability(product.id, product.is_available)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : product.is_available ? 'Mark as Unavailable' : 'Make Available'}
                </button>
              )}

              {user?.role !== 'admin' && (
                <button
                  className={`p-2 mt-4 w-full rounded ${product.is_available
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  onClick={() => product.is_available && handleRentNow(product.id)}
                  disabled={!product.is_available}
                >
                  {product.is_available ? 'Rent Now' : 'Not Available'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {activeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative overflow-y-auto"
            style={{ marginTop: '5rem', maxHeight: 'calc(100vh - 8rem)' }} // Adjust for navbar height
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)}
            >
              &times;
            </button>

            {/* Product Details */}
            <h2 className="text-2xl font-bold mb-4">{activeProduct.name}</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={getImageUrlFromPath(activeProduct.image_url || activeProduct.image)}
                alt={activeProduct.name || 'Product Image'}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  console.error(`❌ Modal image error for ${activeProduct.name}:`, e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>

            {/* Rent Now Button */}
            {activeProduct.is_available ? (
              <button
                className="bg-yellow-600 text-white px-4 py-2 rounded mt-4 hover:bg-yellow-700 w-full"
                onClick={() => handleRentNow(activeProduct.id)}
              >
                Rent Now
              </button>
            ) : (
              <p className="text-red-600 text-center mt-4">This product is currently unavailable.</p>
            )}
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 99999, marginTop: '4rem' }} // Adjust to match navbar height
      />
    </div>
  );
};

export default Products;