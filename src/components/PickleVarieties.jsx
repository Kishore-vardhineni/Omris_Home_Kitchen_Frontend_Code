import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/PickleVarieties.css';
import { varietyProducts } from '../data/products';

const PickleVarieties = () => {

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
            Our Pickle Varieties
          </motion.h2>
        </div>

        <div className="product-grid">
          {varietyProducts.map((product, index) => {
            const categoryRoute = product.category === 'veg' ? '/veg-pickles' : '/non-veg-pickles';
            return (
              <Link
                key={product.id}
                to={categoryRoute}
                className="product-card-link"
                aria-label={`View ${product.name} category`}
              >
                <motion.div
                  className="product-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="product-img-wrapper">
                    <img src={product.image} alt={product.name} />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Category links bar */}
        <motion.div
          className="category-links-bar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Veg Pickles',     to: '/veg-pickles'     },
            { label: 'Non veg Pickles', to: '/non-veg-pickles' },
            { label: 'Podis',           to: '/products'        },
            { label: 'Sweets',          to: '/products'        },
            { label: 'Snacks',          to: '/products'        },
          ].map((cat, i) => (
            <Link key={i} to={cat.to} className="category-link">
              {cat.label} <span className="cat-arrow">→</span>
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default PickleVarieties;
