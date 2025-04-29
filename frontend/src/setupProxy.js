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
};