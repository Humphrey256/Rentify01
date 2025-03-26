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
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AddProduct from './pages/AddProduct';
import ManageProducts from './pages/ManageProducts';
import RentForm from './pages/RentForm';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import BookRental from './pages/BookRental';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import ReviewForm from './pages/ReviewForm';
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
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/review/:rentalId" element={<ReviewForm />} />
            </Routes>
          </AppLayout>
        </Router>
      </CartProvider>
    </UserProvider>
  );
};

export default App;