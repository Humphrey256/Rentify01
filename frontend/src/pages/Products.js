import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Products = () => {
  const [products, setProducts] = useState([]);
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
    <div className="min-h-screen bg-gray-100 p-4 relative z-0"> {/* Set z-index to 0 */}
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
                src={`http://localhost:8000/media/rentals/${typeof product.image === 'string' ? product.image.split('/').pop() : product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover mb-4 rounded-lg"
              />
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-700">{product.details}</p>
              <p className="font-bold text-lg mt-2">${product.price}/day</p>
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
    </div>
  );
};

export default Products;