import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const Settings = () => {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ name, email });
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
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
          Save
        </button>
      </form>
    </div>
  );
};

export default Settings;