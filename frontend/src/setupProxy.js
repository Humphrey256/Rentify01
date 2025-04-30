const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');

module.exports = function(app) {
  console.log('Setting up proxy middleware for local development...');

  // Force HTTP middleware for all requests to avoid HTTPS issues
  app.use((req, res, next) => {
    // Skip favicon requests
    if (req.url === '/favicon.ico') {
      return next();
    }
    
    // If a request comes in via HTTPS, redirect to HTTP
    if (req.headers['x-forwarded-proto'] === 'https') {
      // Get the full URL and create a redirect URL with HTTP
      const hostname = req.headers.host || 'localhost:3000';
      const redirectUrl = `http://${hostname}${req.originalUrl}`;
      console.log(`[HTTPS→HTTP] Redirecting ${req.originalUrl} to ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }
    next();
  });

  // Common proxy configuration
  const proxyConfig = {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
    ws: false, // Disable WebSocket
    xfwd: true,
    headers: {
      'Connection': 'keep-alive',
      'Host': 'localhost:8000',
      'X-Forwarded-Proto': 'http', // Force HTTP protocol
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err.code);
      
      res.writeHead(500, { 'Content-Type': 'text/html' });
      
      if (err.code === 'ECONNREFUSED') {
        res.end(`
          <html>
            <head><title>Backend Connection Error</title></head>
            <body style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #e53935;">Backend Server Not Running</h2>
              <p>Cannot connect to the backend server at http://localhost:8000</p>
              <p>Make sure your Django backend is running with:</p>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">cd backend && python manage.py runserver</pre>
              <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Try Again
              </button>
            </body>
          </html>
        `);
      } else {
        res.end(`Proxy Error: ${err.message}`);
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Ensure HTTP for all requests
      req.headers['x-forwarded-proto'] = 'http';
      console.log(`Proxying ${req.method} ${req.url} → http://localhost:8000${req.url}`);
    },
    pathRewrite: {
      '^/api': '/api', // No change needed
    }
  };

  // Proxy API
  app.use('/api', createProxyMiddleware({...proxyConfig}));
  
  // Proxy static files
  app.use('/static', createProxyMiddleware({...proxyConfig}));
  
  // Proxy media files
  app.use('/media', createProxyMiddleware({...proxyConfig}));
  
  // Proxy dist files
  app.use('/dist', createProxyMiddleware({
    ...proxyConfig,
    onProxyRes: (proxyRes, req, res) => {
      // Add cache headers for CSS
      if (req.url.endsWith('.css')) {
        proxyRes.headers['cache-control'] = 'max-age=3600';
      }
    }
  }));

  console.log('Proxy middleware setup complete - all requests will use HTTP protocol');
};