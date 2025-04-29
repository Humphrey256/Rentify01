const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the Django backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      },
      headers: {
        Connection: 'keep-alive'
      },
      // Log proxy activity for debugging
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${proxyReq.path}`);
      }
    })
  );

  // Proxy media requests as well
  app.use(
    '/media',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};