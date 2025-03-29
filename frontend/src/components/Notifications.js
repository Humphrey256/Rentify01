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
    <div className="mt-16">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} className="mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p>{notification.message}</p>
                {notification.data && (
                  <pre className="text-sm text-gray-600">{JSON.stringify(notification.data, null, 2)}</pre>
                )}
              </div>
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-blue-500 hover:underline"
              >
                Mark as Read
              </button>
            </div>
          </li>
        ))}
      </ul>
      {notifications.length === 0 && !error && <p>No new notifications.</p>}
    </div>
  );
};

export default Notifications;
