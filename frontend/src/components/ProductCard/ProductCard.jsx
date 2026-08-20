import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  // Find the lowest price or default variant
  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const price = defaultVariant ? (defaultVariant.discountedPrice || defaultVariant.price) : (product.startingPrice || 0);
  const originalPrice = defaultVariant?.discountedPrice ? defaultVariant.price : null;
  const weightLabel = defaultVariant ? defaultVariant.label : '';
  
  // Calculate discount percentage if applicable
  const discountPercent = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to product details if there are multiple variants, else add directly
    if (product.variants && product.variants.length > 1) {
      navigate(`/products/${product.slug}`);
    } else if (defaultVariant) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product._id || product.id,
          name: product.name,
          price: price,
          originalPrice: originalPrice,
          quantity: 1,
          image: product.primaryImage?.url || product.image?.url || '',
          weight: defaultVariant.weightInGrams,
          packing: defaultVariant.label,
          sku: defaultVariant.sku
        }
      });
    } else {
      navigate(`/products/${product.slug}`);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card-ref-link">
      <motion.div
        className="product-card-ref"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: (index % 10) * 0.05 }}
        whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
      >
        {discountPercent > 0 && (
          <div className="product-card-badge">
            {discountPercent}% OFF
          </div>
        )}
        
        <div className="product-card-img-wrapper">
          <img src={product.primaryImage?.url || product.image?.url} alt={product.name} />
        </div>
        
        <div className="product-card-body">
          <h3 className="product-card-title">
            {product.name} {weightLabel && <span className="product-card-weight">{weightLabel}</span>}
          </h3>
          
          <div className="product-card-category">
            {product.category ? product.category.replace(/-/g, ' ').toUpperCase() : 'NOS'}
          </div>
        </div>
        
        <div className="product-card-footer">
          <div className="product-card-pricing">
            <span className="product-card-price">₹{price}</span>
            {originalPrice && (
              <span className="product-card-original-price">₹{originalPrice}</span>
            )}
          </div>
          
          <button 
            className="product-card-add-btn"
            onClick={handleAddClick}
          >
            + ADD
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
