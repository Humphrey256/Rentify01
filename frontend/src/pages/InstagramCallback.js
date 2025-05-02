import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const InstagramCallback = () => {
    const [status, setStatus] = useState('Processing...');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the code from URL
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                const error = params.get('error');

                if (error) {
                    setStatus(`Error: ${error}`);
                    toast.error('Instagram authorization was denied');
                    setTimeout(() => navigate('/dashboard'), 2000);
                    return;
                }

                if (!code) {
                    setStatus('Error: No authorization code received');
                    toast.error('No authorization code received');
                    setTimeout(() => navigate('/dashboard'), 2000);
                    return;
                }

                // Exchange code for token
                setStatus('Connecting your Instagram account...');
                await axiosInstance.post('/api/auth/instagram-exchange/', { code });

                setStatus('Successfully connected!');
                toast.success('Instagram account connected successfully!');
                setTimeout(() => navigate('/instagram-feed'), 1000);
            } catch (error) {
                console.error('Instagram auth error:', error);
                setStatus('Error connecting to Instagram');
                toast.error(error.response?.data?.error || 'Failed to connect Instagram account');
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">Instagram Authentication</h1>

                <div className="mb-8">
                    <div className="animate-spin mx-auto h-12 w-12 border-4 border-t-pink-500 rounded-full"></div>
                </div>

                <p className="text-lg text-gray-700">{status}</p>
            </div>
            <ToastContainer />
        </div>
    );
};

export default InstagramCallback;