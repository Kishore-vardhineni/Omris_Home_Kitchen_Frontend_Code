import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/PickleVarieties.css';
import { getProducts } from '../services/productService';

const ProductCard = ({ product, index }) => {
  const displayPrice = product.startingPrice || (product.variants && product.variants[0] ? product.variants[0].price : 0);
  const displayWeight = product.variants && product.variants[0] ? product.variants[0].label : '';

  return (
    <Link
      to={`/products/${product.slug}`}
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
          <img src={product.image?.url} alt={product.name} />
        </div>
        <div className="tomato-info">
          <h4>{product.name} {displayWeight && <strong>({displayWeight})</strong>}</h4>
          <p className="tomato-price">₹{displayPrice}</p>
          <button className="btn btn-choose-option add-to-cart-btn">
            Choose an Option
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

const VegPickles = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({ category: 'veg-pickle' });
      // The API returns { success, count, total, products }
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load veg pickles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-dark-green)]"></div>
              <p className="text-[var(--text-dark)] font-medium">Fetching fresh pickles...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50 rounded-xl border border-red-100 max-w-lg mx-auto gap-4">
              <p className="text-red-600 font-semibold text-lg">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2 bg-[var(--primary-dark-green)] text-white font-semibold rounded-lg shadow hover:bg-opacity-90 transition-all duration-200"
              >
                Retry Fetch
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20 bg-[var(--bg-cream)] rounded-xl border border-dashed border-[var(--primary-dark-green)] border-opacity-20 max-w-lg mx-auto">
              <h3 className="text-xl font-semibold text-[var(--primary-dark-green)] mb-2">No products found</h3>
              <p className="text-[var(--text-dark)] opacity-80 mb-6">We don't have any Veg Pickles in stock right now. Check back soon!</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="tomato-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VegPickles;
