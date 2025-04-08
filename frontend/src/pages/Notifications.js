import React from 'react';

const Notifications = () => {
  const notifications = [
    { id: 1, message: 'Your rental car is ready for pickup.' },
    { id: 2, message: 'Your payment has been processed successfully.' },
    { id: 3, message: 'New electronic devices are available for rent.' },
  ];

  return (
    <div className="ml-64 min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-25">Notifications</h1>
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="bg-gray-50 p-4 rounded shadow hover:shadow-md transition-all">
              {notification.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;