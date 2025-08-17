import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import '../../ProductCard.css';

const ProductCard = ({ product }) => {
  const { dispatch } = useCart();

  return (
    <div className="product-card">
      <img src={product.image_url} alt={product.name}  loading="lazy" />
      <h3>{product.name}</h3>
      <p> {product.description}</p>
      <p>${product.price}</p>
      <button onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
