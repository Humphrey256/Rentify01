import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { BookOpen, History, CreditCard, User } from 'lucide-react'; // Importing icons

const Dashboard = ({ isSidebarCollapsed }) => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const response = await axios.get(`http://localhost:8000/api/auth/users/${user.id}/`, {
          headers: {
            'Authorization': `Token ${user.token}`,
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
        const response = await axios.get(`http://localhost:8000/api/bookings/active/`, {
          headers: {
            'Authorization': `Token ${user.token}`,
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
        const response = await axios.get(`http://localhost:8000/api/bookings/history/`, {
          headers: {
            'Authorization': `Token ${user.token}`,
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

  return (
    <div
      className={`flex-1 min-h-screen bg-gray-100 p-4 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-24'
        }`}
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
          <div className="bg-white p-6 rounded shadow-md mb-6 flex items-center">
            <User size={48} className="text-blue-500 mr-4" />
            <div>
              <h2 className="text-2xl font-semibold">Welcome, {userData?.username} 👋!</h2>
              <p className="mt-2 text-gray-600">Your email: {userData?.email}</p>
              <p className="mt-1 text-gray-600">Joined on: {new Date(userData?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow-md">
              <div className="flex items-center mb-4">
                <BookOpen size={32} className="text-green-500 mr-2" />
                <h3 className="text-xl font-semibold">Active Bookings</h3>
              </div>
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <h4 className="text-lg font-semibold">{booking.rental.name}</h4>
                      <p>Start Date: {new Date(booking.start_date).toLocaleDateString()}</p>
                      <p>End Date: {new Date(booking.end_date).toLocaleDateString()}</p>
                      <p className="font-bold text-lg mt-2">${booking.total_price}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No active bookings so far.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded shadow-md">
              <div className="flex items-center mb-4">
                <History size={32} className="text-yellow-500 mr-2" />
                <h3 className="text-xl font-semibold">Rental History</h3>
              </div>
              {rentalHistory.length > 0 ? (
                <div className="space-y-4">
                  {rentalHistory.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <h4 className="text-lg font-semibold">{booking.rental.name}</h4>
                      <p>Start Date: {new Date(booking.start_date).toLocaleDateString()}</p>
                      <p>End Date: {new Date(booking.end_date).toLocaleDateString()}</p>
                      <p className="font-bold text-lg mt-2">${booking.total_price}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No rental history available.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded shadow-md">
              <div className="flex items-center mb-4">
                <CreditCard size={32} className="text-purple-500 mr-2" />
                <h3 className="text-xl font-semibold">Recent Payments</h3>
              </div>
              {userData?.payments?.length > 0 ? (
                <div className="space-y-4">
                  {userData.payments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <p className="font-semibold">Transaction ID: {payment.transaction_id}</p>
                      <p>Amount: ${payment.amount}</p>
                      <p>Status: {payment.status}</p>
                      <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recent payments found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
