import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null); // Added state for active product details
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/rentals/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleRentNow = (productId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${productId}`);
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-20 md:ml-30 relative z-0"> {/* Adjusted ml-20 to ml-64 for sidebar spacing */}
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
            <div key={product.id} className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
              <img
                src={product.image || 'http://localhost:8000/media/default-placeholder.png'} // Use the correct image URL
                alt={product.name || 'Product Image'}
                className="w-full h-48 object-cover mb-4 rounded-lg" // Set fixed height and maintain aspect ratio
              />
              <h2 className="text-xl font-semibold mb-2 text-indigo-600 font-serif">{product.name}</h2> {/* Updated font and color */}
              <p className="font-bold text-lg mt-2">${product.price}/day</p>
              <button
                className="cursor-pointer text-blue-600 hover:underline mt-2"
                onClick={() => setActiveProduct(product)} // Set active product
              >
                View Details
              </button>
              {user?.role !== 'admin' && (
                <button
                  className="bg-yellow-600 text-white p-2 mt-4 w-full rounded hover:bg-yellow-700"
                  onClick={() => handleRentNow(product.id)}
                >
                  Rent Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {activeProduct && ( // Display active product details in front of all components
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative overflow-y-auto max-h-[calc(100vh-4rem)]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)} // Close details
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">{activeProduct.name}</h2>
            <img
              src={activeProduct.image || 'http://localhost:8000/media/default-placeholder.png'}
              alt={activeProduct.name || 'Product Image'}
              className="w-full h-auto object-contain mb-4 rounded-lg" // Ensure full image is displayed
            />
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-lg mt-4">${activeProduct.price}/day</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;