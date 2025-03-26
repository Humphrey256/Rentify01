import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer'; // Import the Footer component

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/rentals/');
        // Display the first few products or filter as needed
        const displayedProducts = response.data.slice(0, 12); // Display the first 4 products
        setProducts(displayedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <p className="text-center text-lg">No products available</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105">
                  <img
                    src={`http://localhost:8000/media/rentals/${typeof product.image === 'string' ? product.image.split('/').pop() : product.image}`}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-lg"
                  />
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-700">{product.details}</p>
                  <p className="font-bold text-lg mt-2">${product.price}/day</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer Section */}
  
    </div>
  );
};

export default Home;
