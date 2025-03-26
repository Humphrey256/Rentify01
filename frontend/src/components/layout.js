import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure the CSS file is imported

const Layout = ({ children }) => {
  return (
    <div className="container">
      <nav className="navbar">
        <h1>Rentify</h1>
      </nav>
      <aside className="sidebar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;