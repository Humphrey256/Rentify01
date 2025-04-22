import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
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

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useUser();
  const noSidebarPaths = ['/', '/login', '/register'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        {user && !noSidebarPaths.includes(location.pathname) && <Sidebar />}
        <div className="flex-grow container mx-auto p-4">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
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
  );
};

export default App;