import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Token ${user.token}`;
      console.log('Token set:', user.token); // Log the token when it is set
    } else {
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      console.log('Token removed'); // Log when the token is removed
    }
  }, [user]);

  const logout = async () => {
    try {
      if (user && user.refresh_token) {
        await axios.post('http://localhost:8000/api/auth/logout/', { refresh_token: user.refresh_token });
      }
      setUser(null);
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      console.log('Logged out and token removed'); // Log when the user logs out
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);