import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token'); // Ensure token is retrieved
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/notifications/', {
          headers: { Authorization: `Token ${token}` }, // Ensure "Token" prefix is used
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to fetch notifications. Please try again later.');
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Ensure token is retrieved
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      await axios.post(
        'http://localhost:8000/api/notifications/',
        { id },
        { headers: { Authorization: `Token ${token}` } } // Ensure "Token" prefix is used
      );
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. Please try again later.');
    }
  };

  return (
    // Updated container classes to match Profile component's positioning
    <div className="container pt-16 pb-8 px-4 lg:ml-26 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Adding card styling to match profile */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {notifications.length === 0 && !error ? (
          <p className="text-gray-500">No new notifications.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    {notification.data && (
                      <pre className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    )}
                  </div>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Mark as Read
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
