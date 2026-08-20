import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/PickleVarieties.css';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard/ProductCard';

const NonVegPickles = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({ category: 'non-veg-pickle' });
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load non-veg pickles. Please try again.');
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
            Non-Veg Pickles
          </motion.h2>
        </div>

        <div className="tomato-section">
          <div className="tomato-header">
            <h3>Non-Veg Pickles</h3>
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
              <p className="text-[var(--text-dark)] opacity-80 mb-6">We don't have any Non-Veg Pickles in stock right now. Check back soon!</p>
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

export default NonVegPickles;
