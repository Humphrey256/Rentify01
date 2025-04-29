import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Set up axios interceptor to automatically add token to all requests
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Clean up interceptor on component unmount
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    useEffect(() => {
        // Load user data and tokens from localStorage on app initialization
        const loadUserFromStorage = async () => {
            setIsLoading(true);
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (storedUser && accessToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    console.log('User loaded from localStorage:', parsedUser);
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    clearUserData();
                }
            } else {
                console.log('No user or tokens found in localStorage');
            }
            setIsLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const clearUserData = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
    };

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
        clearUserData();
        console.log('User logged out');
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout, handleOAuthLogin, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);