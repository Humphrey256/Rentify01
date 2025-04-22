import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const INSTAGRAM_CLIENT_ID = 'YOUR_INSTAGRAM_APP_ID'; // Replace with your Instagram App ID
const REDIRECT_URI = 'http://localhost:3000/instagram-auth'; // Replace with your redirect URI

const Settings = () => {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ name, email });
    alert('Settings saved successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // TODO: Implement backend call to change password
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleInstagramConnect = () => {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center mt-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Settings</h1>
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Change Password</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Change Password
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleInstagramConnect}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Connect Instagram
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;