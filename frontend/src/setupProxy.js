const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the Django backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      },
      headers: {
        Connection: 'keep-alive',
        Host: 'localhost:8000'
      },
      // Log proxy activity for debugging
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${proxyReq.path}`);
      },
      // Add configuration to handle Invalid Host header issue
      hostRewrite: 'localhost:8000',
      autoRewrite: true
    })
  );

  // Proxy media requests as well
  app.use(
    '/media',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive',
        Host: 'localhost:8000'
      },
      hostRewrite: 'localhost:8000',
      autoRewrite: true
    })
  );

  // Add proxy for /dist path to handle CSS and other static files
  app.use(
    '/dist',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive',
        Host: 'localhost:8000'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying /dist request to: ${proxyReq.path}`);
      },
      timeout: 10000, // Increase timeout to 10 seconds
      hostRewrite: 'localhost:8000',
      autoRewrite: true
    })
  );
};