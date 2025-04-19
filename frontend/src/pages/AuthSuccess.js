import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { handleOAuthLogin } = useUser();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        console.log('Query parameters:', Object.fromEntries(queryParams.entries()));

        const token = queryParams.get('token');
        const username = queryParams.get('username');
        const role = queryParams.get('role');

        if (token) {
            console.log('Token received:', token);
            handleOAuthLogin(token, username, role); // Update UserContext
            localStorage.setItem('accessToken', token); // Store access token
            localStorage.setItem('user', JSON.stringify({ token, username, role })); // Store user details
            console.log('User logged in:', { username, role, token });

            // Redirect based on role
            if (role === 'admin') {
                navigate('/manage-products');
            } else if (role === 'user') {
                navigate('/products');
            } else {
                console.error('Unknown role');
                navigate('/');
            }
        } else {
            // Fallback: Check localStorage for user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const { token, username, role } = JSON.parse(storedUser);
                console.log('User loaded from localStorage:', { username, role, token });
                handleOAuthLogin(token, username, role);
                if (role === 'admin') {
                    navigate('/manage-products');
                } else if (role === 'user') {
                    navigate('/products');
                } else {
                    navigate('/');
                }
            } else {
                console.error('No token found');
                navigate('/login');
            }
        }
    }, [navigate, handleOAuthLogin]);

    return (
        <div>
            <h1>Authentication Successful</h1>
            <p>Redirecting...</p>
        </div>
    );
};

export default AuthSuccess;