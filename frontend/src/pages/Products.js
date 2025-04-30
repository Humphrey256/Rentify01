import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api, { getImageUrl, requestWithRetry, backendStatus } from '../api/config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fallbackProducts } from '../data/fallbackData';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinningUp, setSpinningUp] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Set up auto-refresh if using fallback data
  useEffect(() => {
    let refreshTimer;
    if (usingFallbackData) {
      // Try to fetch real data every 30 seconds while showing fallback data
      refreshTimer = setInterval(() => {
        console.log('Attempting to fetch real data after using fallback...');
        fetchProducts(true);
      }, 30000);
    }
    
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [usingFallbackData]);

  // Fetch products from the API with retry and fallback mechanism
  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setSpinningUp(false);
    }
    
    try {
      // Use the requestWithRetry function with fallback data
      const response = await requestWithRetry('get', '/api/rentals/', null, {
        retries: 2,
        retryDelay: 5000,
        useFallback: true,
        fallbackData: fallbackProducts,
        onRetry: () => {
          setSpinningUp(true);
        }
      });
      
      if (response.isFallback) {
        console.log('Using fallback product data');
        setUsingFallbackData(true);
        toast.info('Using sample data while the server starts up. Data will refresh automatically.', {
          toastId: 'fallback-notice',
          autoClose: 10000
        });
      } else {
        setUsingFallbackData(false);
      }
      
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (!silent) {
        setError(error.userMessage || 'Failed to load products. Please try again later.');
        toast.error(error.userMessage || 'Failed to load products');
      }
    } finally {
      if (!silent) {
        setLoading(false);
        setSpinningUp(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRentNow = (productId) => {
    if (usingFallbackData) {
      toast.info('This is sample data. Real booking will be available when the server finishes starting up.', {
        toastId: 'fallback-booking'
      });
      return;
    }
    
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${productId}`);
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    if (usingFallbackData) {
      toast.info('This is sample data. Admin functions will be available when the server finishes starting up.', {
        toastId: 'fallback-admin'
      });
      return;
    }
    
    if (!user || user.role !== 'admin') return;

    setIsUpdating(true);
    try {
      // Use requestWithRetry for patch requests as well
      const response = await requestWithRetry(
        'patch',
        `/api/rentals/${productId}/`,
        { is_available: !currentStatus },
        {
          headers: { Authorization: `Token ${user.token}` },
          retries: 2
        }
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
      toast.error(error.userMessage || 'Failed to update product availability');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter products based on user role
  const filteredProducts = products.filter((product) => {
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-2 md:ml-15 lg:ml-30 relative z-0">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Products</h1>

      {/* Fallback data notice banner */}
      {usingFallbackData && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Sample Data Mode</p>
              <p className="text-sm">
                The server is currently starting up. You're viewing sample data. 
                The app will automatically refresh with real data once the server is ready.
              </p>
              <button 
                onClick={() => fetchProducts()} 
                className="mt-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded"
              >
                Try Refresh Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and filter controls */}
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

      {/* Loading and spinning up states with better messaging */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-600 mb-4"></div>
          <p className="text-xl">
            {spinningUp ? 
              'Our server is starting up after inactivity. This may take up to 2 minutes...' : 
              'Loading products...'}
          </p>
          {spinningUp && (
            <p className="mt-2 text-gray-600">
              Free hosting plans take longer to spin up after periods of inactivity.
              Sample data will be displayed shortly if the server takes too long.
            </p>
          )}
        </div>
      )}
      
      {/* Error state with retry button */}
      {error && !loading && !usingFallbackData && (
        <div className="text-center text-red-500 mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg mb-4">{error}</p>
          <p className="mb-4 text-gray-700">
            If this is your first time visiting in a while, the server may need a moment to start up.
          </p>
          <button 
            onClick={() => fetchProducts()} 
            className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && filteredProducts.length === 0 ? (
        <p className="text-center text-lg">No available products</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300 transform hover:scale-105 relative"
            >
              <img
                src={getImageUrl(product.image)}
                alt={product.name || 'Product Image'}
                className="w-full h-48 object-cover mb-4 rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <h2 className="text-xl font-semibold mb-2 text-indigo-600 font-serif">{product.name}</h2>
              <p className="font-bold text-lg mt-2">${product.price}/day</p>

              <button
                className="cursor-pointer text-blue-600 hover:underline mt-2"
                onClick={() => setActiveProduct(product)}
              >
                View Details
              </button>

              {/* Admin controls */}
              {user?.role === 'admin' && (
                <button
                  className={`p-2 mt-2 w-full rounded ${product.is_available
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  onClick={() => toggleAvailability(product.id, product.is_available)}
                  disabled={isUpdating || usingFallbackData}
                >
                  {isUpdating ? 'Updating...' : product.is_available ? 'Mark as Unavailable' : 'Make Available'}
                </button>
              )}

              {/* User rent button */}
              {user?.role !== 'admin' && (
                <button
                  className={`p-2 mt-4 w-full rounded ${product.is_available
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  onClick={() => product.is_available && handleRentNow(product.id)}
                  disabled={!product.is_available || usingFallbackData}
                >
                  {usingFallbackData ? 'Server Starting Up...' : 
                    (product.is_available ? 'Rent Now' : 'Not Available')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
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
            {usingFallbackData && (
              <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                You're viewing sample data while the server starts up.
              </div>
            )}
            <img
              src={getImageUrl(activeProduct.image)}
              alt={activeProduct.name || 'Product Image'}
              className="w-full h-auto object-contain mb-4 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>

            {activeProduct.is_available ? (
              <button
                className={`bg-yellow-600 text-white px-4 py-2 rounded mt-4 hover:bg-yellow-700 w-full ${
                  usingFallbackData ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={() => handleRentNow(activeProduct.id)}
                disabled={usingFallbackData}
              >
                {usingFallbackData ? 'Server Starting Up...' : 'Rent Now'}
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
        style={{ zIndex: 99999, marginTop: '4rem' }}
      />
    </div>
  );
};

export default Products;