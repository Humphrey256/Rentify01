import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import StaticAssetHandler from './components/StaticAssetHandler';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Notifications from './components/Notifications';
import Settings from './pages/Settings';
import AddProduct from './pages/AddProduct';
import ManageProducts from './pages/ManageProducts';
import RentForm from './pages/RentForm';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import BookRental from './pages/BookRental';
import SuccessPage from './pages/SuccessPage'; // Updated import
import Cancel from './pages/Cancel';
import ReviewForm from './pages/ReviewForm';
import AuthSuccess from './pages/AuthSuccess'; // New import
import InstagramAuth from './pages/InstagramAuth'; // Import the new InstagramAuth page
import { UserProvider, useUser } from './context/UserContext';
import { CartProvider } from './context/CartContext';

// Add Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff1f0', color: '#d32f2f', margin: '20px', borderRadius: '4px' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', padding: '10px', backgroundColor: '#f8f8f8', borderRadius: '4px' }}>
            <summary>Show error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Detect production environment to handle static assets differently
const isProd = process.env.NODE_ENV === 'production';
const baseUrl = isProd ? (window.location.origin || 'https://rentify01-yfnu.onrender.com') : '';

// CSS backup styles for when the main stylesheet fails to load
const FallbackStylesheet = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body { 
        margin: 0;
        font-family: sans-serif;
        background-color: #f5f5f5;
        color: #333;
      }
      .navbar {
        background-color: #4a5568;
        color: white;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .button {
        background-color: #ecc94b;
        color: #333;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
      }
      /* More basic styles to provide minimal functionality */
      .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .flex-grow { flex-grow: 1; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .min-h-screen { min-height: 100vh; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="static-asset-error p-4 bg-yellow-100 text-yellow-800 rounded mb-4">
      <p className="font-medium">Notice: Using basic styles</p>
      <p className="text-sm">
        Some style resources could not be loaded. You're seeing a simplified version of the site.
        This typically happens when the server is starting up. Please refresh in a few moments.
      </p>
    </div>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user, isLoading } = useUser();
  const noSidebarPaths = ['/', '/login', '/register'];
  const [staticAssetsReady, setStaticAssetsReady] = useState(true);
  
  // Monitor static asset loading errors
  useEffect(() => {
    const handleError = (event) => {
      const { target } = event;
      if (target.tagName === 'LINK' || target.tagName === 'SCRIPT') {
        console.warn('Static asset failed to load:', target.href || target.src);
        setStaticAssetsReady(false);
      }
    };
    
    window.addEventListener('error', handleError, true);
    
    return () => {
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  // Handle bundle.js syntax error by forcing a reload
  useEffect(() => {
    if (!staticAssetsReady) {
      const reloadTimer = setTimeout(() => {
        // Only force reload if we're still in an error state after some delay
        if (!staticAssetsReady) {
          window.location.reload();
        }
      }, 30000); // 30 second delay before forcing reload
      
      return () => clearTimeout(reloadTimer);
    }
  }, [staticAssetsReady]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-grow justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Handle critical static assets with backup approach */}
      <StaticAssetHandler
        src={`${baseUrl}/dist/output.css`}
        type="css"
        maxRetries={5}
        retryDelay={3000}
        fallbackContent={<FallbackStylesheet />}
      />
      
      <StaticAssetHandler
        src={`${baseUrl}/static/js/bundle.js`}
        type="js"
        maxRetries={5}
        retryDelay={3000}
        fallbackContent={null} // JS has no visual fallback
      />
      
      <Navbar />
      <div className="flex flex-grow">
        {user && !noSidebarPaths.includes(location.pathname) && <Sidebar />}
        <div className="flex-grow container mx-auto p-4">
          {!staticAssetsReady && (
            <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
              <p className="font-medium">Some resources are still loading</p>
              <p className="text-sm">The application is still starting up. You may see minimal styling or functionality until all resources are loaded.</p>
            </div>
          )}
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  // Add debugging code to detect initialization
  useEffect(() => {
    console.log('App component mounted');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Base URL:', window.location.origin);
    
    // Check if output.css exists
    fetch('/dist/output.css')
      .then(response => {
        console.log('CSS file response:', response.status, response.statusText);
        if (!response.ok) throw new Error(`CSS file not found: ${response.status}`);
        return response.text();
      })
      .then(data => console.log('CSS file loaded successfully, length:', data.length))
      .catch(err => console.error('Error loading CSS file:', err));
  }, []);
  
  return (
    <ErrorBoundary>
      <UserProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/manage-products" element={<ManageProducts />} />
                  <Route path="/rent/:productId" element={<RentForm />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/book/:rentalId" element={<BookRental />} />
                  <Route path="/bookings/success" element={<SuccessPage />} /> {/* Updated route */}
                  <Route path="/cancel" element={<Cancel />} />
                  <Route path="/review/:rentalId" element={<ReviewForm />} />
                  <Route path="/auth-success" element={<AuthSuccess />} /> {/* New route */}
                  <Route path="/instagram-auth" element={<InstagramAuth />} /> {/* Instagram OAuth redirect handler */}
                </Routes>
              </AppLayout>
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;