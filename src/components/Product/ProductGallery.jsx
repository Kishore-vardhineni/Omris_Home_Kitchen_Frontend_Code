import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Product Gallery Component
 * Features:
 * - Large featured product image with rounded-2xl corners & light gray background
 * - Image fits perfectly without distortion (object-contain / object-cover mix)
 * - Hover zoom effect
 * - Smooth fade transition on image change via Framer Motion
 * - 4 thumbnail images below (horizontal slider on mobile)
 * - Active thumbnail highlighted with black border
 */
const ProductGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* FEATURED MAIN IMAGE CONTAINER */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square bg-stone-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center group cursor-crosshair border border-stone-200/60">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={currentImage.src}
            alt={currentImage.alt || `${productName} View ${selectedIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none"
          />
        </AnimatePresence>

        {/* Subtle Brand Watermark / Badge Overlay */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 text-[11px] font-semibold text-neutral-800 tracking-wider uppercase shadow-xs">
          100% Homemade
        </div>
      </div>

      {/* 4 THUMBNAILS GALLERY (Horizontal slider on mobile) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible">
        {images.map((img, idx) => {
          const isActive = selectedIndex === idx;
          return (
            <motion.button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label={`View ${productName} image ${idx + 1}`}
              className={`
                relative flex-shrink-0 w-20 sm:w-auto aspect-square bg-stone-100 rounded-xl overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black
                ${
                  isActive
                    ? 'border-2 border-black ring-2 ring-black/10 shadow-md scale-[1.02]'
                    : 'border border-stone-200 opacity-70 hover:opacity-100 hover:border-neutral-400'
                }
              `}
            >
              <img
                src={img.src}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover select-none"
              />
              {isActive && (
                <span className="absolute inset-0 bg-black/5 pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGallery;
