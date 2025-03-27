import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3'; // Correct package
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../utils/api';

const BookRental = () => {
    const { rentalId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        totalPrice: '',
        dailyPrice: 0,
        paymentMethod: 'Physical'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState(null);

    const { startDate, endDate, totalPrice, dailyPrice, paymentMethod } = formData;

    useEffect(() => {
        const fetchRentalDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rentals/${rentalId}/`, {
                    headers: { 'Authorization': `Token ${user.token}` },
                });
                setFormData(prev => ({
                    ...prev,
                    dailyPrice: response.data.price,
                }));
                toast.info(`Daily rental price: $${response.data.price}`);
            } catch (error) {
                const errorMsg = error.response?.data?.error || 'Error fetching rental details';
                toast.error(errorMsg);
                setError(errorMsg);
            }
        };

        fetchRentalDetails();
    }, [rentalId, user.token]);

    useEffect(() => {
        if (startDate && endDate && dailyPrice) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                toast.error('End date cannot be before start date');
                setFormData(prev => ({ ...prev, totalPrice: 0 }));
                return;
            }

            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const total = (days * dailyPrice).toFixed(2);
            setFormData(prev => ({ ...prev, totalPrice: total }));
        }
    }, [startDate, endDate, dailyPrice]);

    const validateDates = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            toast.error('Start date cannot be in the past');
            return false;
        }
        if (end < start) {
            toast.error('End date cannot be before start date');
            return false;
        }
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!startDate || !endDate || !totalPrice) {
            toast.error('All fields are required.');
            setIsLoading(false);
            return;
        }

        const bookingData = {
            rental: parseInt(rentalId, 10),
            start_date: startDate,
            end_date: endDate,
            total_price: parseFloat(totalPrice),
            payment_method: paymentMethod,
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/bookings/`,
                bookingData,
                { headers: { 'Authorization': `Token ${user.token}` } }
            );

            const { data } = response;
            setPaymentData(data); // Store payment data for FlutterwaveButton
            toast.success('Booking created. Proceed to payment.');
        } catch (error) {
            console.error('Error processing booking:', error);
            toast.error(error.message || 'Error processing booking.');
        } finally {
            setIsLoading(false);
        }
    };

    const flutterwaveConfig = paymentData && {
        public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_options: paymentData.payment_options,
        customer: paymentData.customer,
        customizations: paymentData.customizations,
        callback: async (response) => {
            console.log('Flutterwave response:', response);
            if (response.status === 'successful') {
                toast.success('Payment successful! Confirming booking...');
                try {
                    await axios.post(
                        `${API_BASE_URL}/bookings/confirm/`,
                        { tx_ref: paymentData.tx_ref },
                        { headers: { 'Authorization': `Token ${user.token}` } }
                    );
                    navigate('/success');
                } catch (error) {
                    console.error('Error confirming booking:', error);
                    toast.error('Error confirming booking.');
                }
            } else {
                toast.error('Payment failed.');
                navigate('/cancel');
            }
            closePaymentModal(); // Close the Flutterwave modal
        },
        onclose: () => {
            toast.warning('Payment window closed.');
        },
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Book Rental</h1>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleBooking} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={handleInputChange}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Total Price ($)</label>
                        <input
                            type="number"
                            value={totalPrice}
                            readOnly
                            className="w-full p-2 border rounded bg-gray-50"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={paymentMethod}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Physical">Physical Payment</option>
                            <option value="Online">Online Payment</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full p-3 rounded text-white font-semibold
                            ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {isLoading ? 'Processing...' : 'Book Now'}
                    </button>
                </form>

                {paymentData && paymentMethod === 'Online' && (
                    <div className="mt-4">
                        <FlutterWaveButton
                            {...flutterwaveConfig}
                            className="w-full p-3 rounded text-white font-semibold bg-green-500 hover:bg-green-600"
                            text="Pay Now"
                        />
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default BookRental;