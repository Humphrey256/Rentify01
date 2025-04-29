import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api/config'; // Import API URL configuration
import Footer from '../components/Footer'; // Import the Footer component

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null); // Track active product for modal
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate(); // Add navigate for redirection

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/rentals/`);
        // Display the first few products or filter as needed
        const displayedProducts = response.data.slice(0, 12); // Display the first 4 products
        setProducts(displayedProducts);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
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
    <div className="min-h-screen bg-gray-100 pt-16"> {/* Added pt-16 to account for the fixed navbar */}
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
          
          {/* Show loading, error, or products */}
          {loading && <p className="text-center">Loading products...</p>}
          
          {error && !loading && (
            <div className="text-center text-red-500 mb-4">{error}</div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-lg">No products available</p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105 cursor-pointer"
                onClick={() => setActiveProduct(product)} // Set active product for modal
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded-lg" // Set fixed height and maintain aspect ratio
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
              onClick={() => setActiveProduct(null)} // Close modal
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
              onClick={() => navigate('/login')} // Redirect to login page
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
