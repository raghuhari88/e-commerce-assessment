import React from 'react';
import { useCart } from '../../context/CartContext';
import '../../CartItem.css'; 

const c = ({ item }) => {
  
  const { dispatch } = useCart();
  const totalPrice = (item.price * item.quantity).toFixed(2);

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} className="cart-item-image" />

      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p>Price: ${item.price.toFixed(2)}</p>
        <p>Quantity: {item.quantity}</p>
        <p>Total: ${totalPrice}</p>
      </div>

      <button
        className="remove-btn"
        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
