import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';
import axiosInstance from '../utils/api';

const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, rental, paymentStatus } = location.state || {};

    // Get the API base URL for images
    const API_BASE = axiosInstance.defaults.baseURL;

    // Helper function for image handling
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

    // Image error handler
    const handleImageError = (e, productName) => {
        console.log(`❌ Image error for ${productName}: ${e.target.src}`);
        e.target.onerror = null;
        const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        const color = `hsl(${hue}, 70%, 80%)`;
        const textColor = `hsl(${hue}, 70%, 30%)`;
        const firstLetter = productName.charAt(0).toUpperCase() || '?';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="${color}"/>
          <text x="100" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${firstLetter}</text>
        </svg>`;
        e.target.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    if (!booking || !rental) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 mt-16 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">No Booking Information</h1>
                    <p className="text-center text-gray-600 mb-6">Booking details are missing. Please check your booking status.</p>
                    <button 
                        onClick={() => navigate('/bookings')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 mt-16">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-green-500 p-6 text-white">
                        <div className="flex items-center justify-center gap-3">
                            <CheckCircle size={32} />
                            <h1 className="text-2xl font-bold">Booking Successful</h1>
                        </div>
                        <p className="text-center mt-2">
                            Your rental has been confirmed. {paymentStatus === 'Completed' ? 'Payment received!' : 'Payment pending.'}
                        </p>
                    </div>

                    {/* Rental Details */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Rental Image */}
                            <div className="w-full md:w-1/3 mb-4 md:mb-0">
                                <div className="bg-gray-100 rounded-lg overflow-hidden h-48">
                                    <img
                                        src={getImageUrlFromPath(rental.image_url || rental.image)}
                                        alt={rental.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => handleImageError(e, rental.name)}
                                    />
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-800">{rental.name}</h2>
                                <div className="mt-4 space-y-2 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
                                        <span>Booking dates: {booking.start_date} to {booking.end_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} />
                                        <span>Booking ID: {booking.id || 'N/A'}</span>
                                    </div>
                                    <p className="font-semibold text-lg mt-2">
                                        Total: ${booking.total_price} ({booking.currency || 'USD'})
                                    </p>
                                    <div className="mt-2 px-3 py-1 inline-flex items-center rounded-full bg-blue-100 text-blue-800">
                                        <span>Payment Status: {paymentStatus || 'Pending'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-semibold text-gray-700">What's Next?</h3>
                            <ul className="mt-2 space-y-2 text-gray-600">
                                <li>• A confirmation email has been sent to your registered email address.</li>
                                <li>• You can view your booking details in the "My Bookings" section.</li>
                                {paymentStatus === 'Pending' && (
                                    <li>• Please complete payment at pickup time.</li>
                                )}
                            </ul>
                        </div>

                        {/* Navigation buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onClick={() => navigate('/bookings')} 
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} /> View My Bookings
                            </button>
                            <button 
                                onClick={() => navigate('/')} 
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Success;
