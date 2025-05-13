import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Bell, Check, CheckCircle, Filter, Calendar, Clock } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import axiosInstance from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [isLoading, setIsLoading] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (event) => {
      setIsCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebar-toggled', handleSidebarChange);

    // Check initial state from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }

    return () => {
      window.removeEventListener('sidebar-toggled', handleSidebarChange);
    };
  }, []);

  // Function to fetch all notifications
  const fetchNotifications = () => {
    if (user && user.token) {
      setIsLoading(true);
      axiosInstance.get('/api/notifications/', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => {
          // Dispatch event to update sidebar after getting notifications
          const event = new CustomEvent('notifications-updated');
          window.dispatchEvent(event);
          setNotifications(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Set up refresh interval - every 2 minutes
    const intervalId = setInterval(fetchNotifications, 120000);
    return () => clearInterval(intervalId);
  }, [user]);

  const markAsRead = (id) => {
    axiosInstance.post('/api/notifications/',
      { id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    )
      .then(response => {
        // Update local state to show the checkmark without hiding the message
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === id ? { ...notification, is_read: true } : notification
          )
        );

        // Dispatch event to update the sidebar notification count
        const event = new CustomEvent('notifications-updated');
        window.dispatchEvent(event);
      })
      .catch(error => {
        console.error('Error marking notification as read:', error);
      });
  };

  const markAllAsRead = () => {
    if (!user?.token || unreadNotifications.length === 0) return;

    axiosInstance.post('/api/notifications/mark-all-read/',
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    )
      .then(() => {
        // Update all notifications to read
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, is_read: true }))
        );

        // Dispatch event to update the sidebar notification count
        const event = new CustomEvent('notifications-updated');
        window.dispatchEvent(event);
      })
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
      });
  };

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true; // 'all'
  });

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const unreadCount = unreadNotifications.length;

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.created_at);
      if (isToday(date)) {
        groups.today.push(notification);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const notificationGroups = groupNotificationsByDate();

  // Render notification item
  const renderNotification = (notification) => (
    <div
      key={notification.id}
      className={`notification-item p-4 border ${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-white shadow-sm' : 'bg-gray-50'} rounded hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 text-xl ${notification.is_read ? 'text-gray-400' : 'text-blue-500'}`}>
          <Bell size={18} />
        </div>
        <div className="flex-grow">
          <div
            className={`notification-content ${notification.is_read ? 'text-gray-600' : 'font-medium'} cursor-pointer`}
            onClick={() => !notification.is_read && markAsRead(notification.id)}
          >
            {notification.message}

            {/* Display additional data if available */}
            {notification.data && (
              <div className="mt-2 text-sm text-gray-500">
                {notification.data.booking_id && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Booking #{notification.data.booking_id}</span>
                  </div>
                )}
                {notification.data.start_date && notification.data.end_date && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    <span>From {notification.data.start_date} to {notification.data.end_date}</span>
                  </div>
                )}
                {notification.data.total_price && (
                  <p className="mt-1 font-semibold">Total: ${notification.data.total_price}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className={`text-xs ${notification.is_read ? 'text-gray-400' : 'text-gray-500'}`}>
              {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
            </span>
            {notification.is_read ? (
              <span className="read-indicator text-green-500 flex items-center gap-1">
                <CheckCircle size={16} /> Read
              </span>
            ) : (
              <button
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
                onClick={() => markAsRead(notification.id)}
              >
                <Check size={16} /> Mark as Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render notification groups
  const renderNotificationGroup = (title, notifications) => {
    if (notifications.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2">{title}</h3>
        <div className="space-y-3">
          {notifications.map(renderNotification)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 mt-16 ml-0 md:ml-16 lg:ml-30 relative z-0">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-center">Notifications</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 ? (
              <div className="mt-1 text-blue-600 font-medium text-sm">
                You have {unreadCount} unread notification{unreadCount !== 1 && 's'}
              </div>
            ) : (
              <div className="mt-1 text-gray-500 text-sm">All caught up!</div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="relative">
              <select
                className="appearance-none pl-8 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
                <option value="read">Read only</option>
              </select>
              <Filter size={16} className="absolute left-2 top-2.5 text-gray-500" />
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md flex items-center gap-1 transition-colors"
              >
                <Check size={16} /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            {renderNotificationGroup('Today', notificationGroups.today)}
            {renderNotificationGroup('Yesterday', notificationGroups.yesterday)}
            {renderNotificationGroup('This Week', notificationGroups.thisWeek)}
            {renderNotificationGroup('Earlier', notificationGroups.older)}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">No notifications to show</p>
            <p className="text-sm mt-1">
              {filter !== 'all'
                ? 'Try changing your filter to see more'
                : "You'll see notifications here when you get some"}
            </p>
          </div>
        )}
      </div>
      
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        style={{ zIndex: 99999, marginTop: '4rem' }}
      />
    </div>
  );
};

export default Notifications;