import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';

const RentForm = () => {
  const { productId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/rentals/${productId}/`, {
          headers: {
            'Authorization': user ? `Bearer ${user.token}` : '', // Include the authentication token if user is logged in
          },
        });
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to fetch product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user]);

  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);
    alert('Payment successful!');
    closePaymentModal(); // this will close the modal programmatically

    // Create booking
    try {
      await axios.post('http://localhost:8000/api/bookings/', {
        user: user.id,
        rental: productId,
        start_date: startDate,
        end_date: endDate,
        total_price: product.price, // Adjust this calculation as needed
        payment_status: 'Completed',
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      navigate('/products');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    }
  };

  const handlePaymentFailure = (response) => {
    console.error('Payment failed:', response);
    alert('Payment failed. Please try again.');
  };

  const config = {
    public_key: 'FLWPUBK_TEST-f3f4cf12710c5faef6a453ef0ca36d57-X',
    tx_ref: Date.now().toString(),
    amount: product ? product.price : 0,
    currency: 'USD',
    payment_options: 'card, mobilemoneyuganda, mobilemoneyghana, ussd, banktransfer, mpesa, ussd',
    customer: {
        email: user?.email || 'default@example.com',
        phonenumber: '07********', // Placeholder phone number
        name: user?.name || 'Guest User',
    },
    customizations: {
        title: 'Rent Product',
        description: `Payment for renting ${product?.name || 'a product'}`,
        logo: 'https://your-logo-url.com/logo.png',
    },
};

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Rent {product?.name}</h1>
          <img
            src={`http://localhost:8000/${product?.image}`} // Updated image URL
            alt={product?.name}
            className="w-full h-40 object-cover mb-4 rounded"
          />
          <p className="mb-4 text-gray-700">{product?.details}</p>
          <p className="font-bold text-lg mb-4">${product?.price}/day</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            placeholder="End Date"
          />
          <FlutterWaveButton
            {...config}
            text="Pay Now"
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
            callback={handlePaymentSuccess}
            onClose={handlePaymentFailure}
          />
        </div>
      )}
    </div>
  );
};

export default RentForm;
