import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Add console logs for debugging
console.log('Starting app initialization...');

// Try-catch to identify any render errors
try {
  const container = document.getElementById('root');
  console.log('Root container found:', !!container);

  const root = createRoot(container);
  console.log('Root created successfully');

  // Remove StrictMode temporarily to see if that resolves the issue
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error during app initialization:', error);
}
