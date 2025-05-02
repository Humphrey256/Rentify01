import React from 'react';
import { useUser } from '../context/UserContext';

const Profile = () => {
    const { user } = useUser();

    const handleConnectInstagram = () => {
        const instagramClientId = process.env.REACT_APP_INSTAGRAM_CLIENT_ID || "YOUR_CLIENT_ID";
        const redirectUri = encodeURIComponent(`${window.location.origin}/instagram-callback`);
        const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;

        window.location.href = instagramAuthUrl;
    };

    return (
        // Updated class to include left margin that matches sidebar width on larger screens
        <div className="container pt-16 pb-8 px-4 lg:ml-26 transition-all duration-300">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Rest of your component remains the same */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">{user?.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium capitalize">{user?.role || 'User'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-3">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.06 1.805.249 2.228.415.562.217.96.477 1.38.896.419.42.679.819.896 1.381.164.422.356 1.057.413 2.227.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.059 1.17-.249 1.805-.413 2.227-.217.562-.477.96-.896 1.381-.419.419-.819.679-1.38.896-.423.164-1.058.356-2.228.413-1.266.058-1.645.07-4.85.07s-3.584-.012-4.849-.07c-1.17-.059-1.805-.249-2.227-.413-.562-.217-.96-.477-1.381-.896-.419-.419-.679-.819-.896-1.381-.164-.422-.356-1.057-.413-2.227-.058-1.265-.07-1.645-.07-4.849s.012-3.584.07-4.849c.059-1.17.249-1.805.413-2.227.217-.562.477-.96.896-1.381.419-.419.819-.679 1.381-.896.422-.164 1.057-.356 2.227-.413 1.265-.058 1.645-.07 4.849-.07z" />
                            </svg>
                            <div>
                                <p className="font-medium">Instagram</p>
                                <p className="text-sm text-gray-500">Connect your Instagram account</p>
                            </div>
                        </div>
                        <button
                            onClick={handleConnectInstagram}
                            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;