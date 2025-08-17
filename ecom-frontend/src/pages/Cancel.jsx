import React from 'react';
import { Link } from 'react-router-dom';
import '../TransactionStatus.css';

const Cancel = () => {
  return (
    <div className="transaction-page">
      <h1 className="cancel">❌ Payment Cancelled</h1>
      <p>Your payment was not completed. You can try again later.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
};

export default Cancel;
