import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Implement checkout logic here
    alert('Proceeding to checkout...');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-lg">Your cart is empty</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cart.map((product) => (
            <div key={product._id} className="bg-white shadow-lg rounded p-4">
              <img src={`http://localhost:5001/${product.image}`} alt={product.name} className="w-full h-40 object-cover mb-4" />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-700">{product.details}</p>
              <p className="font-bold text-lg mt-2">${product.price}/day</p>
              <button
                className="bg-red-500 text-white p-2 mt-4 w-full rounded hover:bg-red-600"
                onClick={() => removeFromCart(product._id)}
              >
                Remove from Cart
              </button>
            </div>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <button
          className="bg-blue-500 text-white p-2 mt-4 w-full rounded hover:bg-blue-600"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default Cart;