import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const booking = location.state?.booking;
    const rental = location.state?.rental;

    return (
        <div className="min-h-screen bg-gray-100 p-4 mt-16">
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-green-600 mb-4">Booking Successful!</h1>
                {rental && (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">{rental.name}</h2>
                        {rental.image && (
                            <img
                                src={rental.image}
                                alt={rental.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <p className="text-gray-600">{rental.description}</p>
                    </div>
                )}
                {booking && (
                    <div className="mb-4">
                        <p><strong>Start Date:</strong> {booking.start_date}</p>
                        <p><strong>End Date:</strong> {booking.end_date}</p>
                        <p><strong>Total Price:</strong> ${booking.total_price}</p>
                        <p><strong>Payment Status:</strong> {location.state?.paymentStatus || 'Pending'}</p>
                    </div>
                )}
                <button
                    onClick={() => navigate('/products')} // Redirect to products page
                    className="w-full p-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                >
                    Browse More Products
                </button>
            </div>
        </div>
    );
};

export default SuccessPage;