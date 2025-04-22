import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InstagramAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Send the code to your backend to exchange for an access token
            axios.post('http://localhost:8000/api/instagram/exchange/', { code })
                .then(res => {
                    // Save token or update user as needed
                    alert('Instagram connected!');
                    navigate('/settings');
                })
                .catch(() => {
                    alert('Instagram connection failed.');
                    navigate('/settings');
                });
        } else {
            navigate('/settings');
        }
    }, [navigate]);

    return <div>Connecting Instagram...</div>;
};

export default InstagramAuth;