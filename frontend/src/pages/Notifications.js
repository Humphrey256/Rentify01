import React from 'react';

const Notifications = () => {
  const notifications = [
    { id: 1, message: 'Your rental car is ready for pickup.' },
    { id: 2, message: 'Your payment has been processed successfully.' },
    { id: 3, message: 'New electronic devices are available for rent.' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-4">
        {notifications.map((notification) => (
          <li key={notification.id} className="bg-white p-4 rounded shadow">
            {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;