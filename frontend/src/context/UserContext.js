import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load user data and tokens from localStorage on app initialization
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (storedUser && accessToken && refreshToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            console.log('User loaded from localStorage:', parsedUser);
        } else {
            console.log('No user or tokens found in localStorage');
        }
    }, []);

    const handleOAuthLogin = (token, refresh, username, role) => {
        const userData = { token, username, role };
        setUser(userData);
        localStorage.setItem('accessToken', token); // Save access token
        localStorage.setItem('refreshToken', refresh); // Save refresh token
        localStorage.setItem('user', JSON.stringify(userData)); // Save user data
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('OAuth login successful:', userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        console.log('User logged out');
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout, handleOAuthLogin }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);