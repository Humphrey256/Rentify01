import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const ManageProducts = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [searchTerm, setSearchTerm] = useState(''); // Added search term state
  const [filterCategory, setFilterCategory] = useState(''); // Added filter category state

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login'); // Redirect non-admin users to the login page
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/rentals/', {
          headers: {
            'Authorization': `Token ${user.token}`, // Include the authentication token
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        // You can also display an error message here if necessary
      } finally {
        setLoading(false); // Stop loading once products are fetched
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/rentals/${id}/`, {
        headers: {
          'Authorization': `Token ${user.token}`, // Include the authentication token
        },
      });
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Form validation
    if (!editingProduct.name || !editingProduct.price) {
      alert('Name and Price are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('category', editingProduct.category);
      formData.append('details', editingProduct.details);
      formData.append('price', editingProduct.price);
      formData.append('available', editingProduct.available);
      if (editingProduct.image) {
        formData.append('image', editingProduct.image);
      }

      await axios.put(`http://localhost:8000/api/rentals/${editingProduct.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${user.token}`, // Include the authentication token
        },
      });

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id ? editingProduct : product
        )
      );
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditingProduct((prevProduct) => ({ ...prevProduct, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditingProduct((prevProduct) => ({ ...prevProduct, image: file }));
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? product.category === filterCategory : true)
    );
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Render loading message or spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-20 md:ml-30"> {/* Added mt-16 to start below the navbar */}
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        />
      </div>
      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        >
          <option value="">All Categories</option>
          <option value="car">Car</option>
          <option value="machine">Machine</option>
        </select>
      </div>
      {editingProduct ? (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Edit Product</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={editingProduct.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Category</label>
            <select
              name="category"
              value={editingProduct.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            >
              <option value="car">Car</option>
              <option value="machine">Machine</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Details</label>
            <textarea
              name="details"
              value={editingProduct.details}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={editingProduct.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Available</label>
            <input
              type="checkbox"
              name="available"
              checked={editingProduct.available}
              onChange={handleCheckboxChange}
              className="mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Update Product
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow-lg rounded p-4">
              <img
                src={product.image || 'http://localhost:8000/media/default-placeholder.png'} // Use the correct image URL
                alt={product.name || 'Product Image'}
                className="w-full h-40 object-cover mb-4"
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p>{product.details}</p>
              <p className="font-bold text-lg mt-2">${product.price}/day</p>
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white p-2 mt-4 w-full rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white p-2 mt-4 w-full rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
