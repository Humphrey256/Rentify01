import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load user data from localStorage on app initialization
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            console.log('User loaded from localStorage:', parsedUser);
        } else {
            console.log('No user found in localStorage');
        }
    }, []);

    const handleOAuthLogin = (token, username, role) => {
        const userData = { token, username, role };
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('OAuth login successful:', userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common['Authorization'];
        console.log('User logged out');
    };

    return (
        <UserContext.Provider value={{ user, handleOAuthLogin, logout }}>
            {children}
        </UserContext.Provider>
    );
};