import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Calendar, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAndFetchPosts = async () => {
            try {
                // First check if connected
                const statusResponse = await axiosInstance.get('/api/auth/instagram-status/');
                setConnected(statusResponse.data.connected);

                if (!statusResponse.data.connected) {
                    setLoading(false);
                    return;
                }

                // If connected, fetch posts
                const response = await axiosInstance.get('/api/auth/instagram-feed/');
                setPosts(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                toast.error(error.response?.data?.error || 'Failed to load Instagram data');
                setLoading(false);
            }
        };

        checkAndFetchPosts();
    }, []);

    // Format date nicely
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Truncate caption text
    const truncateText = (text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Handle Instagram connection
    const handleConnectInstagram = () => {
        const instagramClientId = process.env.REACT_APP_INSTAGRAM_CLIENT_ID || "YOUR_CLIENT_ID";
        const redirectUri = encodeURIComponent(`${window.location.origin}/instagram-callback`);
        const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;

        window.location.href = instagramAuthUrl;
    };

    return (
        <div className="container pt-16 pb-8 px-4 lg:ml-48 transition-all duration-300">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-3 p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-bold">Instagram Feed</h1>
            </div>

            {loading ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            ) : !connected ? (
                <div className="max-w-lg mx-auto text-center py-10 bg-white rounded-lg shadow-sm p-6">
                    <svg className="w-12 h-12 mx-auto mb-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.06 1.805.249 2.228.415.562.217.96.477 1.38.896.419.42.679.819.896 1.381.164.422.356 1.057.413 2.227.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.059 1.17-.249 1.805-.413 2.227-.217.562-.477.96-.896 1.381-.419.419-.819.679-1.38.896-.423.164-1.058.356-2.228.413-1.266.058-1.645.07-4.85.07s-3.584-.012-4.849-.07c-1.17-.059-1.805-.249-2.227-.413-.562-.217-.96-.477-1.381-.896-.419-.419-.679-.819-.896-1.381-.164-.422-.356-1.057-.413-2.227-.058-1.265-.07-1.645-.07-4.849s.012-3.584.07-4.849c.059-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.381.419-.419.819-.679 1.381-.896.422-.164 1.057-.356 2.227-.413 1.265-.058 1.645-.07 4.849-.07z" />
                    </svg>
                    <h2 className="text-lg font-medium mb-3">Connect Instagram Account</h2>
                    <p className="text-gray-500 mb-5">Connect your Instagram account to display your posts here.</p>
                    <button
                        onClick={handleConnectInstagram}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded font-medium hover:opacity-90"
                    >
                        Connect Instagram
                    </button>
                </div>
            ) : posts.length === 0 ? (
                <div className="max-w-lg mx-auto text-center py-10 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium mb-2">No Posts Found</h2>
                    <p className="text-gray-500">Your Instagram account doesn't have any posts or we don't have permission to view them.</p>
                </div>
            ) : (
                // Smaller, more intuitive card layout
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative aspect-square">
                                {post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM' ? (
                                    <img
                                        src={post.media_url}
                                        alt={post.caption || 'Instagram post'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : post.media_type === 'VIDEO' ? (
                                    <div className="w-full h-full relative bg-black">
                                        <video
                                            src={post.media_url}
                                            className="w-full h-full object-contain"
                                            controls
                                            poster={post.thumbnail_url}
                                        />
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                                            VIDEO
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <p className="text-gray-400 text-sm">Unsupported media</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <p className="text-xs text-gray-500 mb-1.5 flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {formatDate(post.timestamp)}
                                </p>

                                {post.caption && (
                                    <p className="text-sm mb-2 line-clamp-2">
                                        {truncateText(post.caption)}
                                    </p>
                                )}

                                <div className="flex justify-between items-center">
                                    <a
                                        href={post.permalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs flex items-center text-blue-500 hover:underline"
                                    >
                                        <ExternalLink size={12} className="mr-1" /> View on Instagram
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default InstagramFeed;