import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './App.css'; // Import Tailwind CSS

// Debug CSS loading issues
console.log('[DEBUG] index.js loaded at', new Date().toISOString());

// Monitor network requests for CSS files
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url && typeof url === 'string' && url.includes('output.css')) {
    console.log(`[DEBUG] Fetch request for CSS: ${url}`, {
      timestamp: new Date().toISOString(),
      alreadyLoaded: !!document.querySelector(`link[href*="output.css"]`)
    });
  }
  return originalFetch.apply(this, arguments);
};

// Track when CSS files are requested
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes) {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'LINK' && node.href && node.href.includes('output.css')) {
          console.log(`[DEBUG] CSS link added to DOM: ${node.href}`, {
            timestamp: new Date().toISOString(),
            elementId: node.id,
            alreadyExists: document.querySelectorAll(`link[href*="output.css"]`).length > 1
          });
        }
      });
    }
  });
});

// Start observing document head for changes
observer.observe(document.head, { childList: true, subtree: true });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
