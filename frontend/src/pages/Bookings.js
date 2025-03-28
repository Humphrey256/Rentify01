import React, { useState, useEffect } from 'react';
import axios from '../utils/api'; // Use the configured Axios instance
import { useUser } from '../context/UserContext';
import API_BASE_URL from '../utils/api';

const Bookings = () => {
    const { user } = useUser();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);

    useEffect(() => {
        if (!user) {
            setError('User not logged in. Please log in to view your bookings.');
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/bookings/`, {
                    headers: { Authorization: `Token ${user.token}` },
                });
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError('Failed to fetch bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const handleEditBooking = (booking) => {
        setEditingBooking({
            ...booking,
            start_date: new Date(booking.start_date).toISOString().split('T')[0],
            end_date: new Date(booking.end_date).toISOString().split('T')[0],
        });
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${API_BASE_URL}/bookings/${editingBooking.id}/`,
                {
                    start_date: editingBooking.start_date,
                    end_date: editingBooking.end_date,
                },
                { headers: { Authorization: `Token ${user.token}` } }
            );
            alert('Booking updated successfully.');
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === editingBooking.id ? { ...booking, ...response.data } : booking
                )
            );
            setEditingBooking(null);
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking.');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/bookings/cancel/`,
                { booking_id: bookingId },
                { headers: { Authorization: `Token ${user.token}` } }
            );
            alert(response.data.message);
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
        } catch (error) {
            console.error('Error canceling booking:', error);
            alert('Failed to cancel booking.');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center text-red-500">{error}</div>;
    }

    if (!bookings.length) {
        return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">No bookings found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex">
            {/* Active Bookings Section */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
                {bookings.length === 0 ? (
                    <p>No bookings found.</p>
                ) : (
                    <ul className="space-y-4">
                        {bookings.map((booking) => (
                            <li key={booking.id} className="p-4 bg-white shadow rounded">
                                <h2 className="text-lg font-semibold">{booking.rental?.name || 'Rental Name'}</h2>
                                <img
                                    src={booking.rental?.image || 'http://localhost:8000/media/default-placeholder.png'}
                                    alt={booking.rental?.name || 'Rental Image'}
                                    className="w-32 h-32 object-cover rounded mb-4"
                                />
                                <p>Start Date: {new Date(booking.start_date).toLocaleDateString()}</p>
                                <p>End Date: {new Date(booking.end_date).toLocaleDateString()}</p>
                                <p>Total Price: ${booking.total_price}</p>
                                <p>Payment Method: {booking.payment_method}</p>
                                <p>Status: {booking.payment_status}</p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleEditBooking(booking)}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit Booking Form Section */}
            {editingBooking && (
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md ml-4">
                    <h2 className="text-xl font-bold mb-4">Edit Booking</h2>
                    <form onSubmit={handleUpdateBooking}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={editingBooking?.start_date || ''}
                                onChange={(e) =>
                                    setEditingBooking((prev) => ({ ...prev, start_date: e.target.value }))
                                }
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={editingBooking?.end_date || ''}
                                onChange={(e) =>
                                    setEditingBooking((prev) => ({ ...prev, end_date: e.target.value }))
                                }
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                Update Booking
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingBooking(null)}
                                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Bookings;
