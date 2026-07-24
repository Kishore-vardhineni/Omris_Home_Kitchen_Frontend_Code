import React from 'react';
import { motion } from 'framer-motion';

const Checkout = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container"
      style={{ padding: '4rem 1rem', minHeight: '60vh' }}
    >
      <h1 style={{ color: 'var(--primary-dark-green)', marginBottom: '2rem' }}>Checkout</h1>
      <p>This is a placeholder for the Checkout form.</p>
    </motion.div>
  );
};

export default Checkout;
