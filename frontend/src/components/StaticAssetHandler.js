import React, { useState, useEffect } from 'react';

/**
 * Component that handles loading static assets with error handling and retry functionality
 * @param {Object} props
 * @param {string} props.src - URL of the static asset to load
 * @param {string} props.type - Type of asset ('css' or 'js')
 * @param {number} props.maxRetries - Maximum number of retry attempts
 * @param {number} props.retryDelay - Delay in ms between retries
 * @param {React.ReactNode} props.fallbackContent - Content to display if asset fails to load
 */
const StaticAssetHandler = ({ 
  src, 
  type = 'css', 
  maxRetries = 3, 
  retryDelay = 3000,
  fallbackContent = null 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let timer;
    
    const loadAsset = () => {
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
      } else {
        // Unsupported asset type
        console.error(`Unsupported asset type: ${type}`);
        setError(true);
        return;
      }
      
      // Add unique query parameter to bust cache
      const url = new URL(src, window.location.origin);
      url.searchParams.set('t', Date.now());
      if (type === 'css') {
        element.href = url.toString();
      } else {
        element.src = url.toString();
      }
      
      // Handle load and error events
      element.onload = () => {
        if (isMounted) {
          console.log(`Successfully loaded ${src}`);
          setLoaded(true);
          setError(false);
        }
      };
      
      element.onerror = () => {
        if (isMounted) {
          console.error(`Failed to load ${src}`);
          if (retries < maxRetries) {
            // Retry loading after delay
            timer = setTimeout(() => {
              if (isMounted) {
                console.log(`Retrying ${src} (${retries + 1}/${maxRetries})`);
                setRetries(prev => prev + 1);
                document.head.removeChild(element);
                loadAsset();
              }
            }, retryDelay);
          } else {
            console.error(`Max retries reached for ${src}`);
            setError(true);
          }
        }
      };
      
      document.head.appendChild(element);
    };
    
    loadAsset();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [src, type, maxRetries, retryDelay]);
  
  // Return fallback content if there was an error loading the asset
  if (error && fallbackContent) {
    return <>{fallbackContent}</>;
  }
  
  // Don't render anything if no error or asset loaded successfully
  return null;
};

export default StaticAssetHandler;