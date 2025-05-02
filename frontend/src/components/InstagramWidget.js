import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/api';

const InstagramWidget = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const checkInstagramConnection = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/instagram-status/');
                setConnected(response.data.connected);

                if (response.data.connected) {
                    fetchInstagramPosts();
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error checking Instagram status:', error);
                setLoading(false);
            }
        };

        const fetchInstagramPosts = async () => {
            try {
                const response = await axiosInstance.get('/api/auth/instagram-feed/');
                setPosts(response.data.data?.slice(0, 3) || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Instagram posts:', error);
                setLoading(false);
            }
        };

        checkInstagramConnection();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-3">Instagram Feed</h3>
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-3">Instagram Feed</h3>
                <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">Connect your Instagram account to display posts</p>
                    <Link
                        to="/profile"
                        className="inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                    >
                        Connect Instagram
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Instagram Feed</h3>
                <Link to="/instagram-feed" className="text-blue-500 text-sm hover:underline">
                    View All →
                </Link>
            </div>

            {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No posts found</p>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {posts.map(post => (
                        <div key={post.id} className="aspect-square overflow-hidden rounded">
                            {post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM' ? (
                                <img
                                    src={post.media_url}
                                    alt="Instagram post"
                                    className="w-full h-full object-cover"
                                    onClick={() => window.open(post.permalink, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                />
                            ) : (
                                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstagramWidget;