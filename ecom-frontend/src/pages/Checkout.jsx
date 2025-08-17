import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { createCheckoutSession } from '../api/stripeApi';
import '../Checkout.css';

const Checkout = () => {
  const { cart, dispatch } = useCart();
  const [loading, setLoading] = useState(false); // <-- loading state

  const handleCheckout = async () => {
    setLoading(true); // show loader
    try {
      const session = await createCheckoutSession(cart);
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false); // hide loader on error
    }
  };

  const totalAmount = cart
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="checkout-items">
            {cart.map(item => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="checkout-item-image"
                />
                <div className="checkout-item-details">
                  <h4 className="item-name">{item.name}</h4>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            <h3>Total: ${totalAmount}</h3>
            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={loading} // disable button while loading
            >
              {loading ? 'Processing...' : 'Pay with Stripe'} {/* loader text */}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
