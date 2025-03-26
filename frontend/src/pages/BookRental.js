import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookRental = () => {
    const { rentalId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [dailyPrice, setDailyPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Physical'); // Added payment method state
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch rental details to get the daily price
        const fetchRentalDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/rentals/${rentalId}/`, {
                    headers: {
                        'Authorization': `Token ${user.token}`,
                    },
                });
                setDailyPrice(response.data.price);
            } catch (error) {
                console.error('Error fetching rental details:', error);
                setError('Error fetching rental details.');
            }
        };

        fetchRentalDetails();
    }, [rentalId, user.token]);

    useEffect(() => {
        // Calculate total price based on start and end dates
        if (startDate && endDate && dailyPrice) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = (end - start) / (1000 * 60 * 60 * 24) + 1; // Calculate the number of days
            setTotalPrice(days * dailyPrice);
        }
    }, [startDate, endDate, dailyPrice]);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate || !totalPrice) {
            setError('All fields are required.');
            return;
        }

        if (paymentMethod === 'Online') {
            // Handle online payment with Flutterwave
            try {
                const response = await axios.post(
                    'http://localhost:8000/api/bookings/',
                    {
                        rental: rentalId,
                        start_date: startDate,
                        end_date: endDate,
                        total_price: totalPrice,
                        payment_method: paymentMethod,
                    },
                    {
                        headers: {
                            'Authorization': `Token ${user.token}`,
                        },
                    }
                );

                const { data } = response;
                const { tx_ref, amount, currency, payment_options, redirect_url, customer, customizations } = data;

                window.FlutterwaveCheckout({
                    public_key: 'FLWPUBK_TEST-f3f4cf12710c5faef6a453ef0ca36d57-X', // Ensure the Flutterwave test public key is used
                    tx_ref,
                    amount,
                    currency,
                    payment_options,
                    redirect_url,
                    customer,
                    customizations,
                    callback: (response) => {
                        if (response.status === 'successful') {
                            toast.success('Booking successful!');
                            navigate('/success');
                        } else {
                            navigate('/cancel');
                        }
                    },
                    onclose: () => {
                        navigate('/cancel');
                    },
                });
            } catch (error) {
                console.error('Error processing payment:', error);
                setError('Error processing payment.');
            }
        } else {
            // Handle physical payment
            try {
                await axios.post(
                    'http://localhost:8000/api/bookings/',
                    {
                        rental: rentalId,
                        start_date: startDate,
                        end_date: endDate,
                        total_price: totalPrice,
                        payment_method: paymentMethod,
                    },
                    {
                        headers: {
                            'Authorization': `Token ${user.token}`,
                        },
                    }
                );
                toast.success('Booking successful!');
                navigate('/bookings');
            } catch (error) {
                console.error('Error creating booking:', error);
                setError('Error creating booking.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Book Rental</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleBooking} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Total Price</label>
                    <input
                        type="number"
                        value={totalPrice}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Payment Method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                    >
                        <option value="Physical">Physical</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Book Now
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default BookRental;
