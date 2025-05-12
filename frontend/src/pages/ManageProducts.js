import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axiosInstance from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProducts = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  // Create a memoized fetchProducts function
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/rentals/', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        // Add cache-busting parameter
        params: { _t: Date.now() }
      });
      setProducts(response.data);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Initial fetch
    fetchProducts();

    // Set up polling for updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchProducts();
    }, 30000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, navigate, fetchProducts]);

  // Helper function to get proper image URL with better error handling
  const getImageUrlFromPath = (urlPath) => {
    // Generate unique colored placeholder based on product name
    const getColoredPlaceholder = (productName = '') => {
      const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hue = hash % 360;
      const color = `hsl(${hue}, 70%, 80%)`;
      const textColor = `hsl(${hue}, 70%, 30%)`;
      const firstLetter = productName.charAt(0).toUpperCase() || '?';

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="${color}"/>
        <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
      </svg>`;

      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    if (!urlPath) {
      return getColoredPlaceholder("Product");
    }

    try {
      // Check if we're in production (on Render.com)
      const isProduction = window.location.hostname.includes('onrender.com');

      // In production, return colored SVG placeholders instead of trying to load images
      // This is because Render.com free tier doesn't persist uploaded media files
      if (isProduction) {
        // Extract product name from path if possible
        const filename = urlPath.split('/').pop();
        let productName = "Product";

        // Try to extract a human-readable name from the filename
        if (filename) {
          productName = filename
            .replace(/\.[^/.]+$/, "") // Remove file extension
            .replace(/[_-]/g, " ")    // Replace underscores and dashes with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
        }

        return getColoredPlaceholder(productName);
      }

      // In development, try to use actual images
      // If it's already a full URL with the correct path and working format, use it directly
      if (urlPath.includes('/media/rentals/') &&
        (urlPath.startsWith('http://') || urlPath.startsWith('https://'))) {
        return urlPath;
      }

      // Extract the filename from whatever path format we have
      let filename = urlPath.split('/').pop();

      // Handle any encoding
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        // If decoding fails, continue with original
      }

      // IMPORTANT: Replace spaces with underscores to match server filenames
      filename = filename.replace(/\s+/g, '_');

      // Map specific problematic filenames to known good ones
      const filenameMap = {
        "electric.jpg": "electric_driller.jpg",
        "vitz.jpg": "range_rover_spot.jpg", // Fallback to another image since vitz isn't available
      };

      if (filenameMap[filename]) {
        filename = filenameMap[filename];
      }

      // Debug log to help troubleshoot path issues
      console.debug(`Processing image: ${urlPath} → ${filename}`);

      // Just return the primary variant
      return `${API_BASE}/media/rentals/${filename}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return getColoredPlaceholder("Product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/rentals/${id}/`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Form validation
    if (!editingProduct.name || !editingProduct.price) {
      toast.error('Name and Price are required.');
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

      await axiosInstance.put(`/api/rentals/${editingProduct.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      // Refresh all products to ensure we have latest data
      fetchProducts();
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product. Please try again.');
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 relative overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-center sm:text-left">Manage Products</h1>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/add-product')}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 w-auto"
        >
          Add Product
        </button>

        <button
          onClick={fetchProducts}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 w-auto"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Products'}
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>

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
        <form onSubmit={handleUpdate} className="bg-white p-4 rounded shadow-md w-full max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4">Edit Product</h2>
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
              <div className="h-48 mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={getImageUrlFromPath(product.image_url || product.image)}
                  alt={product.name || 'Product Image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`❌ Image error for ${product.name}:`, e.target.src);
                    e.target.onerror = null; // Prevent infinite loop

                    // Generate a colored placeholder specific to this product
                    const hash = product.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const hue = hash % 360;
                    const color = `hsl(${hue}, 70%, 80%)`;
                    const textColor = `hsl(${hue}, 70%, 30%)`;
                    const firstLetter = product.name.charAt(0).toUpperCase() || '?';

                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                      <rect width="200" height="200" fill="${color}"/>
                      <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
                    </svg>`;

                    e.target.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
                  }}
                />
              </div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="font-bold text-md mt-2">${product.price}/day</p>
              <p
                className="text-blue-600 cursor-pointer hover:underline mt-2"
                onClick={() => setActiveProduct(product)}
              >
                View Details
              </p>
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
      {activeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg relative overflow-y-auto max-h-[calc(100vh-4rem)]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setActiveProduct(null)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">{activeProduct.name}</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={getImageUrlFromPath(activeProduct.image_url || activeProduct.image)}
                alt={activeProduct.name || 'Product Image'}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  console.error(`❌ Modal image error for ${activeProduct.name}:`, e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = `${API_BASE}/media/default-placeholder.png`;
                }}
              />
            </div>
            <p className="text-gray-700">{activeProduct.details}</p>
            <p className="font-bold text-md mt-4">${activeProduct.price}/day</p>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageProducts;
