import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/PickleVarieties.css';
import { tomatoProducts, mangoProducts } from '../data/products';

const vegPickleProducts = [...tomatoProducts, ...mangoProducts];

const ProductCard = ({ product, index }) => (
  <Link
    to={`/products/${product.id}`}
    className="product-card-link"
    aria-label={`View details for ${product.name}`}
  >
    <motion.div
      className="tomato-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className="tomato-img-wrapper">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="tomato-info">
        <h4>{product.name}</h4>
        <p className="tomato-price">₹{product.price}</p>
        <button className="btn btn-choose-option add-to-cart-btn">
          Choose an Option
        </button>
      </div>
    </motion.div>
  </Link>
);

const VegPickles = () => {
  return (
    <section className="varieties-section">
      <div className="container">
        <div className="section-header">
          <motion.h4
            className="subtitle-accent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Specialties
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Veg Pickles
          </motion.h2>
        </div>

        <div className="tomato-section">
          <div className="tomato-header">
            <h3>Veg Pickles</h3>
            <div className="header-underline"></div>
          </div>
          <div className="tomato-grid">
            {vegPickleProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${product.weight}`}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VegPickles;
