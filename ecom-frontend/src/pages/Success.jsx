import React from 'react';
import { Link } from 'react-router-dom';
import '../TransactionStatus.css';

const Success = () => {
  return (
    <div className="transaction-page">
      <h1 className="success">✅ Payment Successful!</h1>
      <p>Thank you for your purchase. Your transaction has been completed.</p>
      <Link to="/">Go Back Home</Link>
    </div>
  );
};

export default Success;
