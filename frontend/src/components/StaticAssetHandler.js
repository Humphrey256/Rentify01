import React, { useState, useEffect } from 'react';

// Cache to track which assets have been loaded
const loadedAssets = new Set();

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
  maxRetries = 5, 
  retryDelay = 3000,
  fallbackContent = null 
}) => {
  const [loaded, setLoaded] = useState(loadedAssets.has(src));
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);
  
  console.log(`[StaticAssetHandler] Initializing for ${src}, type=${type}, maxRetries=${maxRetries}, already loaded: ${loadedAssets.has(src)}`);

  useEffect(() => {
    let isMounted = true;
    let timer;
    
    // Skip if already loaded in a previous mount
    if (loadedAssets.has(src)) {
      console.log(`[StaticAssetHandler] Asset already loaded from cache: ${src}`);
      setLoaded(true);
      return;
    }
    
    console.log(`[StaticAssetHandler] Effect triggered: loaded=${loaded}, error=${error}, retries=${retries}`);

    const loadAsset = () => {
      if (loaded || error) {
        console.log(`[StaticAssetHandler] Skipping load attempt: loaded=${loaded}, error=${error}`);
        return;
      }

      console.log(`[StaticAssetHandler] Loading asset: ${src}`);
      
      // Check if this asset is already in the DOM
      const existingAssets = Array.from(document.querySelectorAll(type === 'css' ? 'link' : 'script'))
        .filter(el => {
          const assetSrc = type === 'css' ? el.href : el.src;
          // Remove timestamp parameter for comparison
          const normalizedSrc = assetSrc ? assetSrc.split('?')[0] : '';
          const normalizedTargetSrc = src.split('?')[0];
          const match = normalizedSrc.includes(normalizedTargetSrc);
          
          if (match) {
            console.log(`[StaticAssetHandler] Found existing asset in DOM: ${assetSrc}`);
            
            // If it already exists, mark it as loaded
            if (isMounted) {
              setLoaded(true);
              loadedAssets.add(src);
            }
            return true;
          }
          
          return false;
        });
      
      // Skip creating a new element if one already exists
      if (existingAssets.length > 0) {
        console.log(`[StaticAssetHandler] Using existing asset in DOM, skipping creation`);
        return;
      }

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
        console.error(`[StaticAssetHandler] Unsupported asset type: ${type}`);
        setError(true);
        return;
      }

      let url;
      try {
        url = new URL(src, window.location.origin);
      } catch (e) {
        // fallback for relative paths
        url = new URL(window.location.protocol + '//' + window.location.host + src);
      }
      
      // Always use HTTP for localhost:8000 for static assets
      if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port !== '8000') {
        url.protocol = 'http:';
        url.hostname = 'localhost';
        url.port = '8000';
        console.log(`[StaticAssetHandler] Forcing HTTP and port 8000 for static asset: ${url.toString()}`);
      }
      
      // Add check to prevent common proxy errors
      if (url.pathname.includes('/dist/') && window.location.hostname === 'localhost') {
        // Make sure we're on the right port (8000 is Django, 3000 is React dev server)
        const targetPort = window.location.port === '3000' ? '3000' : '8000';
        if (url.port !== targetPort) {
          url.port = targetPort;
          console.log(`[StaticAssetHandler] Fixed port for asset request: ${url.toString()}`);
        }
      }
      
      const timestamp = Date.now();
      url.searchParams.set('t', timestamp);
      console.log(`[StaticAssetHandler] Adding timestamp ${timestamp} to URL`);
      
      if (type === 'css') {
        element.href = url.toString();
      } else {
        element.src = url.toString();
      }

      // Give each asset a unique ID to help with debugging
      element.id = `asset-${type}-${timestamp}`;
      
      // Track when the request was initiated
      const requestStart = Date.now();

      element.onload = () => {
        if (isMounted) {
          const loadTime = Date.now() - requestStart;
          console.log(`[StaticAssetHandler] Successfully loaded ${src} in ${loadTime}ms`);
          setLoaded(true);
          setError(false);
          loadedAssets.add(src);
        }
      };

      element.onerror = (e) => {
        if (isMounted) {
          console.error(`[StaticAssetHandler] Failed to load ${src}`, e);
          
          if (retries < maxRetries) {
            console.log(`[StaticAssetHandler] Will retry ${src} in ${retryDelay}ms (attempt ${retries + 1}/${maxRetries})`);
            
            timer = setTimeout(() => {
              if (isMounted) {
                console.log(`[StaticAssetHandler] Retrying ${src} now (${retries + 1}/${maxRetries})`);
                setRetries(prev => {
                  console.log(`[StaticAssetHandler] Incrementing retries from ${prev} to ${prev + 1}`);
                  return prev + 1;
                });
                
                // Check if element is still in DOM before removing
                if (element && element.parentNode) {
                  console.log(`[StaticAssetHandler] Removing failed element from DOM`);
                  try {
                    document.head.removeChild(element);
                    console.log(`[StaticAssetHandler] Element removed successfully`);
                  } catch (err) {
                    console.error(`[StaticAssetHandler] Error removing element:`, err);
                  }
                } else {
                  console.log(`[StaticAssetHandler] Element not found in DOM, cannot remove`);
                }
                
                loadAsset();
              } else {
                console.log(`[StaticAssetHandler] Component unmounted, skipping retry`);
              }
            }, retryDelay);
          } else {
            console.error(`[StaticAssetHandler] Max retries (${maxRetries}) reached for ${src}`);
            setError(true);
          }
        }
      };

      console.log(`[StaticAssetHandler] Appending ${type} element to document.head:`, element.href || element.src);
      document.head.appendChild(element);
    };

    loadAsset();

    return () => {
      console.log(`[StaticAssetHandler] Cleanup: Unmounting component for ${src}`);
      isMounted = false;
      if (timer) {
        console.log(`[StaticAssetHandler] Clearing retry timer`);
        clearTimeout(timer);
      }
    };
  }, [src, type, maxRetries, retryDelay, loaded, error]);
  
  // Return fallback content if there was an error loading the asset
  if (error && fallbackContent) {
    console.log(`[StaticAssetHandler] Rendering fallback content due to loading error`);
    return <>{fallbackContent}</>;
  }
  
  // Don't render anything if no error or asset loaded successfully
  return null;
};

export default StaticAssetHandler;