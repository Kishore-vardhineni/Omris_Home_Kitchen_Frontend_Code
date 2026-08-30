import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const allVariants = product.variants || [];
  const hasVariants = allVariants.length > 0;

  // Check if ALL variants are out of stock
  const isAllOutOfStock = hasVariants
    ? allVariants.every((v) => !v.isAvailable || v.stock <= 0)
    : (product.stock <= 0 || product.isAvailable === false);

  // Find the first available variant or fallback to default
  const availableVariant = hasVariants
    ? allVariants.find((v) => v.isAvailable && v.stock > 0)
    : null;
  const defaultVariant = availableVariant || (hasVariants ? allVariants[0] : null);

  const isDefaultOutOfStock = defaultVariant
    ? (!defaultVariant.isAvailable || defaultVariant.stock <= 0)
    : isAllOutOfStock;

  const price = defaultVariant ? (defaultVariant.discountedPrice || defaultVariant.price) : (product.startingPrice || 0);
  const originalPrice = defaultVariant?.discountedPrice ? defaultVariant.price : null;
  const weightLabel = defaultVariant ? defaultVariant.label : '';
  const stockCount = defaultVariant ? defaultVariant.stock : (product.stock || 0);

  // Calculate discount percentage if applicable
  const discountPercent = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAllOutOfStock || isDefaultOutOfStock) {
      navigate(`/products/${product.slug}`);
      return;
    }
    
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
        className={`product-card-ref ${isAllOutOfStock ? 'is-out-of-stock' : ''}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: (index % 10) * 0.05 }}
        whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
      >
        {isAllOutOfStock ? (
          <div className="product-card-badge out-of-stock-badge">
            OUT OF STOCK
          </div>
        ) : discountPercent > 0 ? (
          <div className="product-card-badge">
            {discountPercent}% OFF
          </div>
        ) : null}
        
        <div className="product-card-img-wrapper">
          <img src={product.primaryImage?.url || product.image?.url} alt={product.name} />
          {isAllOutOfStock && (
            <div className="out-of-stock-overlay">OUT OF STOCK</div>
          )}
        </div>
        
        <div className="product-card-body">
          <h3 className="product-card-title">
            {product.name} {weightLabel && <span className="product-card-weight">{weightLabel}</span>}
          </h3>
          
          <div className="product-card-rating">
            <div className="product-card-stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="product-card-star-icon"
                  fill={i < Math.round(product.averageRating || 5) ? '#f59e0b' : 'none'}
                  stroke={i < Math.round(product.averageRating || 5) ? 'none' : '#f59e0b'}
                />
              ))}
            </div>
            <span className="product-card-rating-score">{product.averageRating || '4.9'}</span>
            <span className="product-card-rating-dot">•</span>
            <span className="product-card-rating-reviews">{product.numReviews || '148'} Verified Reviews</span>
          </div>

          <div className="product-card-category-row">
            <span className="product-card-category">
              {product.category ? product.category.replace(/-/g, ' ').toUpperCase() : 'NOS'}
            </span>
            {!isAllOutOfStock && stockCount > 0 && stockCount <= 5 && (
              <span className="product-card-stock-warning">
                Only {stockCount} left!
              </span>
            )}
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
            className={`product-card-add-btn ${isAllOutOfStock ? 'out-of-stock' : ''}`}
            onClick={handleAddClick}
            disabled={isAllOutOfStock}
          >
            {isAllOutOfStock ? 'OUT OF STOCK' : (hasVariants && isDefaultOutOfStock ? 'SELECT SIZE' : '+ ADD')}
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
