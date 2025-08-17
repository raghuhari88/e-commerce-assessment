import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import '../../Header.css';

const Header = () => {
  const { cart } = useCart();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">E-Commerce</h1>
        <Link to="/" className="home-link">Shopping</Link>
      </div>
      <div className="header-right">
        <Link to="/checkout">Cart ({cart.length})</Link>
      </div>
    </header>
  );
};

export default Header;
