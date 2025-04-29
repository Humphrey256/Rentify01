import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../api/config'; // Import enhanced API client
import Footer from '../components/Footer';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/rentals/');
        const displayedProducts = response.data.slice(0, 12);
        setProducts(displayedProducts);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.userMessage || 'Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function for image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    return `${API_URL}/media/rentals/${typeof imagePath === 'string' ? imagePath.split('/').pop() : imagePath}`;
  };

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
          
          {/* Show loading state with animation */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600 mb-2"></div>
              <p>Loading products...</p>
            </div>
          )}
          
          {/* Show error with retry button */}
          {error && !loading && (
            <div className="text-center text-red-500 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p>{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  api.get('/api/rentals/')
                    .then(response => {
                      setProducts(response.data.slice(0, 12));
                      setError(null);
                    })
                    .catch(err => {
                      setError(err.userMessage || 'Failed to load products');
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
