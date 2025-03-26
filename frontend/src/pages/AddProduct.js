import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const AddProduct = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    details: '',
    price: '',
    available: true,
    image: null,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name || !formData.price) {
      alert('Name and Price are required.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('available', formData.available);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Log the form data being sent
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await axios.post('http://localhost:8000/api/rentals/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${user.token}`, // Include the authentication token
        },
      });

      navigate('/manage-products');
    } catch (error) {
      console.error('Failed to add product:', error);
      setError(error.response?.data?.detail || 'Failed to add product. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Product</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          >
            <option value="">Select Category</option>
            <option value="car">Car</option>
            <option value="machine">Machine</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Details</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
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
            checked={formData.available}
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
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
