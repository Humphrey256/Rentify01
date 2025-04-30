import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { BookOpen, History, CreditCard, User } from 'lucide-react';
import axiosInstance from '../utils/api';

const Dashboard = ({ isSidebarCollapsed }) => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isActiveBookingsOpen, setIsActiveBookingsOpen] = useState(true);
  const [isRentalHistoryOpen, setIsRentalHistoryOpen] = useState(false);
  const [isRecentPaymentsOpen, setIsRecentPaymentsOpen] = useState(false);

  // Get the API base URL for images
  const API_BASE = axiosInstance.defaults.baseURL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const response = await axiosInstance.get(`/api/auth/users/${user.id}/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        console.log('User data:', response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveBookings = async () => {
      try {
        console.log('Fetching active bookings...');
        const response = await axiosInstance.get(`/api/bookings/active/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        console.log('Active bookings:', response.data);
        setActiveBookings(response.data);
      } catch (error) {
        console.error('Error fetching active bookings:', error);
        setError('Failed to fetch active bookings. Please try again later.');
      }
    };

    const fetchRentalHistory = async () => {
      try {
        console.log('Fetching rental history...');
        const response = await axiosInstance.get(`/api/bookings/history/`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        console.log('Rental history:', response.data);
        setRentalHistory(response.data);
      } catch (error) {
        console.error('Error fetching rental history:', error);
        setError('Failed to fetch rental history. Please try again later.');
      }
    };

    if (user && user.id) {
      fetchUserData();
      fetchActiveBookings();
      fetchRentalHistory();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axiosInstance.post(
        `/api/bookings/cancel/`,
        { booking_id: bookingId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(response.data.message);
      setActiveBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert(error.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();

    if (!editingBooking.start_date || !editingBooking.end_date) {
      alert('Start date and end date are required.');
      return;
    }

    try {
      await axiosInstance.put(
        `/api/bookings/${editingBooking.id}/`,
        {
          start_date: editingBooking.start_date,
          end_date: editingBooking.end_date,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setActiveBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === editingBooking.id ? { ...booking, ...editingBooking } : booking
        )
      );
      setEditingBooking(null);
      alert('Booking updated successfully.');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking.');
    }
  };

  return (
    <div
      className={`flex-1 min-h-screen bg-gray-100 p-4 mt-16 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-24'
        }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Dashboard</h1>
      {loading ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded shadow-md animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
          <div className="bg-white p-6 rounded shadow-md animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div>
          <div className="bg-white p-6 rounded shadow-md mb-6 flex flex-col md:flex-row items-center">
            <User size={48} className="text-blue-500 mr-4" />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold">Welcome, {userData?.username} 👋!</h2>
              <p className="mt-2 text-gray-600">Your email: {userData?.email}</p>
              <p className="mt-1 text-gray-600">Joined on: {new Date(userData?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Active Bookings Section */}
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1">
              <div className="bg-white p-6 rounded shadow-md mb-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsActiveBookingsOpen(!isActiveBookingsOpen)}
                >
                  <div className="flex items-center">
                    <BookOpen size={32} className="text-green-500 mr-2" />
                    <h3 className="text-xl font-semibold">Active Bookings</h3>
                  </div>
                  <span className="text-gray-500">{isActiveBookingsOpen ? '▲' : '▼'}</span>
                </div>
                {isActiveBookingsOpen && (
                  <div className="space-y-4 mt-4">
                    {activeBookings.length > 0 ? (
                      activeBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-50 p-4 rounded shadow-sm flex flex-col md:flex-row items-center">
                          <div className="w-full md:w-1/3">
                            <img
                              src={booking.rental?.image || `${API_BASE}/media/default-placeholder.png`}
                              alt={booking.rental?.name || 'Rental Image'}
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                          <div className="w-full md:w-2/3 pl-0 md:pl-4 mt-4 md:mt-0">
                            <h4 className="text-lg font-semibold text-gray-800">{booking.rental?.name || 'Rental Name'}</h4>
                            <p className="text-sm text-blue-500">Start Date: {new Date(booking.start_date).toLocaleDateString()}</p>
                            <p className="text-sm text-blue-500">End Date: {new Date(booking.end_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mt-2">Total Price: <span className="font-bold">${booking.total_price}</span></p>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center">No active bookings so far.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Booking Form Section */}
            {editingBooking && (
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md ml-0 lg:ml-4 mt-4 lg:mt-0">
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

          {/* Rental History */}
          <div className="bg-white p-6 rounded shadow-md mb-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsRentalHistoryOpen(!isRentalHistoryOpen)}
            >
              <div className="flex items-center">
                <History size={32} className="text-yellow-500 mr-2" />
                <h3 className="text-xl font-semibold">Rental History</h3>
              </div>
              <span className="text-gray-500">{isRentalHistoryOpen ? '▲' : '▼'}</span>
            </div>
            {isRentalHistoryOpen && (
              <div className="space-y-4 mt-4">
                {rentalHistory.length > 0 ? (
                  rentalHistory.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800">{booking.rental.name}</h4>
                      <p className="text-sm text-blue-500">Start Date: {new Date(booking.start_date).toLocaleDateString()}</p>
                      <p className="text-sm text-blue-500">End Date: {new Date(booking.end_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 mt-2">Total Price: <span className="font-bold">${booking.total_price}</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No rental history available.</p>
                )}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white p-6 rounded shadow-md">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsRecentPaymentsOpen(!isRecentPaymentsOpen)}
            >
              <div className="flex items-center">
                <CreditCard size={32} className="text-purple-500 mr-2" />
                <h3 className="text-xl font-semibold">Recent Payments</h3>
              </div>
              <span className="text-gray-500">{isRecentPaymentsOpen ? '▲' : '▼'}</span>
            </div>
            {isRecentPaymentsOpen && (
              <div className="space-y-4 mt-4">
                {userData?.payments?.length > 0 ? (
                  userData.payments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <p className="text-sm text-gray-800">Transaction ID: <span className="font-semibold">{payment.transaction_id}</span></p>
                      <p className="text-sm text-gray-800">Amount: <span className="font-semibold">${payment.amount}</span></p>
                      <p className="text-sm text-gray-800">Status: <span className="font-semibold">{payment.status}</span></p>
                      <p className="text-sm text-gray-800">Date: <span className="font-semibold">{new Date(payment.createdAt).toLocaleDateString()}</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No recent payments found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
