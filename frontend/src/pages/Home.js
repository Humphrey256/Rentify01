import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl, requestWithRetry } from '../api/config';
import Footer from '../components/Footer';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinningUp, setSpinningUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setSpinningUp(false);
        
        // Use the requestWithRetry function with automatic retry for timeouts
        const response = await requestWithRetry('get', '/api/rentals/', null, {
          retries: 3,
          retryDelay: 3000,
          onRetry: () => {
            setSpinningUp(true);
          }
        });
        
        const displayedProducts = response.data.slice(0, 12);
        setProducts(displayedProducts);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.userMessage || 'Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
        setSpinningUp(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* Hero Section */}
      <section className="bg-yellow-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Rentify</h1>
          <p className="text-xl mb-8">Your one-stop solution for renting products</p>
          <Link to="/products" className="bg-white text-yellow-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Available Products</h2>
          
          {/* Show loading state with improved message for server spin-up */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-600 mb-4"></div>
              <p className="text-xl">
                {spinningUp ? 
                  'Our server is starting up after inactivity. This may take up to 30 seconds...' : 
                  'Loading products...'}
              </p>
            </div>
          )}
          
          {/* Show error with retry button and helpful message */}
          {error && !loading && (
            <div className="text-center text-red-500 mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
              <p className="text-lg mb-4">{error}</p>
              <p className="mb-4 text-gray-700">
                If this is your first time visiting in a while, the server may need a moment to start up.
              </p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setSpinningUp(false);
                  
                  requestWithRetry('get', '/api/rentals/', null, {
                    retries: 3,
                    retryDelay: 3000,
                    onRetry: () => {
                      setSpinningUp(true);
                    }
                  })
                  .then(response => {
                    setProducts(response.data.slice(0, 12));
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.userMessage || 'Failed to load products');
                  })
                  .finally(() => {
                    setLoading(false);
                    setSpinningUp(false);
                  });
                }}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Show message if no products */}
          {!loading && !error && products.length === 0 && (
            <p className="text-center text-lg">No products available</p>
          )}
          
          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105 cursor-pointer"
                onClick={() => setActiveProduct(product)}
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="font-bold text-lg mt-2">${product.price}/day</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Section */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative overflow-y-auto max-h-[calc(100vh-4rem)]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">{activeProduct.name}</h2>
            <img
              src={getImageUrl(activeProduct.image)}
              alt={activeProduct.name}
              className="w-full h-auto object-contain mb-4 rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-yellow-600 text-white p-3 mt-4 w-full rounded hover:bg-yellow-700"
            >
              Rent Now
            </button>
          </div>
        </div>
      )}

      {/* Footer Section */}
  
    </div>
  );
};

export default Home;
