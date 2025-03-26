import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login'); // Redirect non-admin users to the login page
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/rentals/', {
          headers: {
            'Authorization': `Bearer ${user.token}`, // Include the authentication token
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow-lg rounded p-4">
            <img src={`http://localhost:8000/${product.image}`} alt={product.name} className="w-full h-40 object-cover mb-4" />
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-700">{product.details}</p>
            <p className="font-bold text-lg mt-2">${product.price}/day</p>
            <button
              className="bg-yellow-500 text-white p-2 mt-4 w-full rounded hover:bg-yellow-600"
              onClick={() => navigate(`/edit-product/${product.id}`)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 text-white p-2 mt-4 w-full rounded hover:bg-red-600"
              onClick={() => navigate(`/delete-product/${product.id}`)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
