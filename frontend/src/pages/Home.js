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
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/api/rentals/');
        setProducts(response.data.slice(0, 12));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${API_BASE}/media/default-placeholder.png`;
    }
    // If image path is already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the API base URL
    return `${API_BASE}${imagePath}`;
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
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name || 'Product Image'}
                    className="w-full h-48 object-cover mb-4 rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_BASE}/media/default-placeholder.png`;
                    }}
                  />
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
            <img
              src={getImageUrl(activeProduct.image)}
              alt={activeProduct.name || 'Product Image'}
              className="w-full h-auto object-contain mb-4 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${API_BASE}/media/default-placeholder.png`;
              }}
            />
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