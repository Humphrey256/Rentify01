import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axiosInstance from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    details: '',
    category: 'car',
    image: null,
    is_available: true
  });

  const API_BASE = axiosInstance.defaults.baseURL;

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error("Only administrators can access this page");
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/rentals/');
      setProducts(response.data);
    } catch (error) {
      toast.error('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get proper image URL (copied from Home.js)
  const getImageUrlFromPath = (urlPath) => {
    if (!urlPath) return '';
    try {
      if (
        urlPath.includes('/media/rentals/') &&
        (urlPath.startsWith('http://') || urlPath.startsWith('https://'))
      ) {
        return urlPath;
      }
      let filename = urlPath.split('/').pop();
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {}
      filename = filename.replace(/\s+/g, '_');
      return `${API_BASE}/media/rentals/${filename}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
  };

  // Handle image loading errors with SVG fallback - Same as Home page
  const handleImageError = (e, productName) => {
    console.error(`❌ Image error for ${productName}:`, e.target.src);
    e.target.onerror = null; // Prevent infinite loop
    
    // Create colored SVG placeholder based on product name
    const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 80%)`;
    const textColor = `hsl(${hue}, 70%, 30%)`;
    const firstLetter = productName.charAt(0).toUpperCase() || '?';
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${color}"/>
      <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
      <text x="100" y="160" font-family="Arial" font-size="14" fill="${textColor}" text-anchor="middle">Image not found</text>
    </svg>`;
    
    e.target.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  // Rest of the component...

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-0 md:ml-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Management</h1>
      
      {/* Products list with consistent image handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <div className="h-48 bg-gray-100 mb-4 rounded flex justify-center items-center overflow-hidden">
              <img
                src={getImageUrlFromPath(product.image_url || product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, product.name)}
              />
            </div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600">${product.price}/day</p>
            
            {/* Product management controls */}
            <div className="mt-4 flex gap-2">
              <button 
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button 
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductManagement;
