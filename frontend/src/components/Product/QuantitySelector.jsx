import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Professional Quantity Selector component with accessibility and hover states.
 */
const QuantitySelector = ({ quantity, onIncrement, onDecrement, min = 1, max = 99 }) => {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-medium text-neutral-800 tracking-wide">
        Quantity
      </label>
      <div className="flex items-center border border-neutral-300 rounded-full w-fit bg-white p-1 shadow-sm hover:border-neutral-400 transition-colors">
        <motion.button
          type="button"
          onClick={onDecrement}
          disabled={quantity <= min}
          whileHover={{ scale: quantity > min ? 1.1 : 1 }}
          whileTap={{ scale: quantity > min ? 0.9 : 1 }}
          aria-label="Decrease quantity"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
            quantity <= min
              ? 'text-neutral-300 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          <Minus size={16} strokeWidth={2.2} />
        </motion.button>

        <span 
          tabIndex={0}
          aria-label={`Current quantity ${quantity}`}
          className="w-12 text-center text-sm font-bold text-neutral-900 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-black rounded"
        >
          {quantity}
        </span>

        <motion.button
          type="button"
          onClick={onIncrement}
          disabled={quantity >= max}
          whileHover={{ scale: quantity < max ? 1.1 : 1 }}
          whileTap={{ scale: quantity < max ? 0.9 : 1 }}
          aria-label="Increase quantity"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
            quantity >= max
              ? 'text-neutral-300 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          <Plus size={16} strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  );
};

export default QuantitySelector;
