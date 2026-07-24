import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Mobile-Only Sticky Add to Cart Bar (< 640px)
 * Provides quick purchasing action on mobile viewports.
 */
const StickyMobileAddToCart = ({ productName, price, selectedWeight, onAddToCart }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-neutral-500 truncate">
            {productName} • {selectedWeight}
          </span>
          <span className="text-lg font-extrabold text-neutral-900 leading-tight">
            {price}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={onAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
        >
          <ShoppingBag size={18} />
          <span>Add to Cart</span>
        </motion.button>
      </div>
    </div>
  );
};

export default StickyMobileAddToCart;
