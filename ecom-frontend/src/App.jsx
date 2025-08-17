import React from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Checkout from './pages/Checkout';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Success from './pages/Success';
import Cancel from './pages/Cancel';


function App() {
  return (
    <>
       <CartProvider>
        <Header />
       <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </div>
      <Footer />
      </CartProvider>
    </>
  );
}

export default App;

