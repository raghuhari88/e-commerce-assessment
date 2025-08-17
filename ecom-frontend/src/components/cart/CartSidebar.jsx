import React from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import '../../CartSidebar.css'; // 👈 Import the CSS file

const CartSidebar = () => {
  const { cart } = useCart();
  return (
    <aside className="cart-sidebar">
      <h3 className="cart-sidebar-title">Cart</h3>
      {cart.length === 0 ? (
        <p className="cart-empty">Cart is empty</p>
      ) : (
        cart.map(item => <CartItem key={item.id} item={item} />)
      )}
    </aside>
  );
};

export default CartSidebar;
