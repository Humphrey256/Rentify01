import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../utils/api';

const BookRental = () => {
    const { rentalId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [rental, setRental] = useState(null);

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        totalPrice: '',
        dailyPrice: 0,
        paymentMethod: 'Physical',
        currency: 'USD',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    const { startDate, endDate, totalPrice, dailyPrice, paymentMethod, currency } = formData;

    useEffect(() => {
        const fetchRentalDetails = async () => {
            try {
                if (!rentalId || isNaN(rentalId)) {
                    throw new Error('Invalid rental ID. Please check the URL or try again.');
                }

                const response = await axios.get(`http://localhost:8000/api/rentals/${rentalId}/`, {
                    headers: { Authorization: `Token ${user.token}` },
                });

                setRental(response.data);

                // Check if rental is available
                if (!response.data.is_available) {
                    toast.error('This rental is currently not available for booking.');
                    setError('This rental is currently not available for booking.');
                    return;
                }

                setFormData((prev) => ({
                    ...prev,
                    dailyPrice: response.data.price,
                }));
                toast.info(`Daily rental price: $${response.data.price}`);
            } catch (error) {
                console.error('Error fetching rental details:', error);
                const errorMsg = error.response?.data?.error || 'Error fetching rental details. Please try again later.';
                toast.error(errorMsg);
                setError(errorMsg);
                setFormData((prev) => ({
                    ...prev,
                    dailyPrice: 0,
                }));
            }
        };

        if (user && rentalId) {
            fetchRentalDetails();
        }
    }, [rentalId, user]);

    useEffect(() => {
        if (startDate && endDate && dailyPrice) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                toast.error('End date cannot be before start date');
                setFormData((prev) => ({ ...prev, totalPrice: 0 }));
                return;
            }

            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const total = (days * dailyPrice).toFixed(2);
            setFormData((prev) => ({ ...prev, totalPrice: total }));
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        // Check if rental is still available
        if (rental && !rental.is_available) {
            toast.error('This rental is no longer available. Please select another rental.');
            setError('This rental is no longer available.');
            return;
        }

        if (!validateDates()) {
            return;
        }

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
            currency: currency,
        };

        try {
            // Check latest availability before proceeding
            const availabilityCheck = await axios.get(`http://localhost:8000/api/rentals/${rentalId}/`, {
                headers: { Authorization: `Token ${user.token}` },
            });

            if (!availabilityCheck.data.is_available) {
                toast.error('This rental was just booked by someone else. Please select another rental.');
                setError('This rental is no longer available.');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(`http://localhost:8000/api/bookings/`, bookingData, {
                headers: { Authorization: `Token ${user.token}` },
            });

            const { data } = response;
            setPaymentData(data); // Store payment data for FlutterWaveButton
            toast.success('Booking created. Proceed to payment if required.');

            // Redirect to success page for physical payment
            if (paymentMethod === 'Physical') {
                navigate('/bookings/success', {
                    state: {
                        booking: data,
                        rental: rental,
                        paymentStatus: 'Pending',
                    },
                });
                toast.success('Booking confirmed. Proceed to rental pickup.');
            }
        } catch (error) {
            console.error('Error processing booking:', error);

            if (error.response?.data?.error?.includes('not available')) {
                toast.error('This rental is not available for the selected dates.');
            } else {
                const errorMsg = error.response?.data?.error || 'Error processing booking.';
                toast.error(errorMsg);
                setError(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const flutterwaveConfig = paymentData && {
        public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY, // Ensure this key is set in your .env file
        tx_ref: `tx_${Date.now()}`, // Generate a unique transaction reference
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_options: 'card, mobilemoney, ussd', // Specify payment options
        customer: {
            email: paymentData.customer?.email || 'example@example.com',
            phonenumber: paymentData.customer?.phonenumber || '0000000000',
            name: paymentData.customer?.name || 'Customer Name',
        },
        customizations: {
            title: 'Rental Payment',
            description: `Payment for rental: ${rental?.name || 'Rental'}`,
            logo: 'https://example.com/logo.png', // Replace with your logo URL
        },
        callback: async (response) => {
            setIsPaymentLoading(true);
            console.log('Flutterwave response:', response);

            if (response.status === 'successful') {
                toast.success('Payment successful! Confirming booking...');
                try {
                    await axios.post(
                        `${API_BASE_URL}/bookings/confirm/`,
                        { tx_ref: response.tx_ref },
                        { headers: { Authorization: `Token ${user.token}` } }
                    );
                    navigate('/bookings/success', {
                        state: {
                            booking: paymentData,
                            rental: rental,
                            paymentStatus: 'Completed',
                        },
                    });
                } catch (error) {
                    console.error('Error confirming booking:', error);
                    toast.error('Error confirming booking. Please contact support.');
                }
            } else {
                toast.error('Payment failed. Please try again.');
            }
            setIsPaymentLoading(false);
            closePaymentModal(); // Close the payment modal
        },
        onclose: () => {
            toast.warning('Payment window closed. Please complete your payment.');
            setIsPaymentLoading(false);
        },
    };

    console.log('Flutterwave Public Key:', process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY);

    // If rental is unavailable, show unavailable message with option to go back
    if (rental && !rental.is_available) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 mt-16">
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="text-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold mt-2">Rental Unavailable</h2>
                        <p className="text-gray-600 mt-1">This rental is currently not available for booking.</p>
                    </div>
                    <button
                        onClick={() => navigate('/rentals')}
                        className="w-full p-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                        Browse Available Rentals
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 mt-16">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Book Rental</h1>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {rental && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">{rental.name}</h2>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Available</span>
                        </div>
                        {rental.image && (
                            <img
                                src={rental.image}
                                alt={rental.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <p className="text-gray-600 mb-2">{rental.description}</p>
                        <p className="font-bold text-lg">${rental.price}/day</p>
                    </div>
                )}

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

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Currency</label>
                        <select
                            name="currency"
                            value={currency}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="NGN">NGN</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Payment Method</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                className={`p-3 rounded-lg text-white font-semibold transition-all duration-300 ${paymentMethod === 'Physical'
                                    ? 'bg-blue-500 hover:bg-blue-600 shadow-lg'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'Physical' }))}
                            >
                                Physical Payment
                            </button>
                            <button
                                type="button"
                                className={`p-3 rounded-lg text-white font-semibold transition-all duration-300 ${paymentMethod === 'Online'
                                    ? 'bg-blue-500 hover:bg-blue-600 shadow-lg'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'Online' }))}
                            >
                                Online Payment
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full p-3 rounded text-white font-semibold ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {isLoading ? 'Processing...' : 'Book Now'}
                    </button>
                </form>

                {paymentData && paymentMethod === 'Online' && (
                    <div className="mt-4">
                        {process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY ? (
                            <FlutterWaveButton
                                {...flutterwaveConfig}
                                className="w-full p-3 rounded text-white font-semibold bg-green-500 hover:bg-green-600"
                                text="Pay Now"
                            />
                        ) : (
                            <p className="text-red-500">Payment configuration error. Please contact support.</p>
                        )}
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default BookRental;