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
        // Display the first few products or filter as needed
        const displayedProducts = response.data.slice(0, 12);
        setProducts(displayedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <p className="text-center text-lg">No products available</p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105 cursor-pointer"
                  onClick={() => setActiveProduct(product)}
                >
                  <img
                    src={`${API_BASE}/media/rentals/${typeof product.image === 'string' ? product.image.split('/').pop() : product.image}`}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-lg"
                  />
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="font-bold text-lg mt-2">${product.price}/day</p>
                </div>
              ))
            )}
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
              src={`${API_BASE}/media/rentals/${typeof activeProduct.image === 'string' ? activeProduct.image.split('/').pop() : activeProduct.image}`}
              alt={activeProduct.name}
              className="w-full h-auto object-contain mb-4 rounded-lg"
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
    </div>
  );
};

export default Home;