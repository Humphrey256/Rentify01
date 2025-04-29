import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import API_URL from '../api/config'; // Import API URL configuration
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch products from the API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/rentals/`);
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper function for image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return `${API_URL}/media/default-placeholder.png`;
    return `${API_URL}/media/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
  };

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
      const response = await axios.patch(
        `${API_URL}/api/rentals/${productId}/`,
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

      {/* Loading and error states */}
      {loading && <p className="text-center">Loading products...</p>}
      
      {error && !loading && (
        <div className="text-center text-red-500 mb-4">{error}</div>
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
                  e.target.src = `${API_URL}/media/default-placeholder.png`;
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
                  disabled={isUpdating}
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
                  disabled={!product.is_available}
                >
                  {product.is_available ? 'Rent Now' : 'Not Available'}
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
            <img
              src={getImageUrl(activeProduct.image)}
              alt={activeProduct.name || 'Product Image'}
              className="w-full h-auto object-contain mb-4 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${API_URL}/media/default-placeholder.png`;
              }}
            />
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>

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
        style={{ zIndex: 99999, marginTop: '4rem' }}
      />
    </div>
  );
};

export default Products;