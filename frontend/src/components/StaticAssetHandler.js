import React, { useState, useEffect } from 'react';

/**
 * Component to handle static asset loading errors gracefully
 * This is particularly useful for Render hosting where static files may give 500 errors
 * when the server is spinning up
 */
const StaticAssetHandler = ({ 
  src, 
  fallbackContent,
  type = 'css',
  maxRetries = 3,
  retryDelay = 5000
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    const loadAsset = () => {
      setLoading(true);
      setError(false);
      
      let element;
      if (type === 'css') {
        element = document.createElement('link');
        element.rel = 'stylesheet';
        element.type = 'text/css';
        element.href = src;
      } else if (type === 'js') {
        element = document.createElement('script');
        element.type = 'text/javascript';
        element.src = src;
        element.async = true;
      }

      if (!element) return;

      // Set up success and error handlers
      element.onload = () => {
        console.log(`Successfully loaded ${type} asset: ${src}`);
        setLoading(false);
        setError(false);
      };

      element.onerror = () => {
        console.error(`Failed to load ${type} asset: ${src}`);
        setError(true);
        setLoading(false);
        
        // Remove failed element
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        
        // Retry loading if we haven't exceeded max retries
        if (retries < maxRetries) {
          console.log(`Retrying asset load... (${retries + 1}/${maxRetries})`);
          setTimeout(() => {
            setRetries(prev => prev + 1);
            loadAsset();
          }, retryDelay);
        }
      };

      // Add to document
      document.head.appendChild(element);
    };
    
    loadAsset();
    
    // Cleanup function to remove the element if component unmounts
    return () => {
      const element = type === 'css' 
        ? document.querySelector(`link[href="${src}"]`) 
        : document.querySelector(`script[src="${src}"]`);
      
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [src, type, retries, maxRetries, retryDelay]);

  // Render nothing if successfully loaded, or fallback content if failed after all retries
  return (error && retries >= maxRetries) ? fallbackContent : null;
};

export default StaticAssetHandler;