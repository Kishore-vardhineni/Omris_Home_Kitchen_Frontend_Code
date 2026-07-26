import React, { useState, useEffect, useMemo } from 'react';
import ReviewsSummary from './ReviewsSummary';
import WriteReviewModal from './WriteReviewModal';
import ReviewList from './ReviewList';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { DEFAULT_PRODUCT_REVIEWS, GENERIC_REVIEWS } from '../data/pickleReviews';

/**
 * ProductReviewsSection Component
 * 
 * Manages separate review sections per pickle product.
 * - Accepts `productId` and `productName`
 * - Maintains independent review lists, rating breakdowns, and average scores per pickle
 * - Persists newly submitted reviews to localStorage per product ID
 */
const ProductReviewsSection = ({ productId = 'general', productName = 'Pickle' }) => {
  // Helper to load reviews for a specific pickle product
  const loadReviewsForProduct = (id) => {
    try {
      const saved = localStorage.getItem(`omris_reviews_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load reviews from localStorage', e);
    }
    return DEFAULT_PRODUCT_REVIEWS[id] || GENERIC_REVIEWS;
  };

  // State keyed by productId
  const [reviews, setReviews] = useState(() => loadReviewsForProduct(productId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync state whenever productId changes (navigating between different pickles)
  useEffect(() => {
    setReviews(loadReviewsForProduct(productId));
  }, [productId]);

  // Dynamic calculations derived from current pickle's review list
  const { averageRating, totalReviews, ratingBreakdown } = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: 0 })),
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / total).toFixed(2));

    const breakdownMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (breakdownMap[r.rating] !== undefined) {
        breakdownMap[r.rating] += 1;
      }
    });

    const breakdown = [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      count: breakdownMap[s],
    }));

    return {
      averageRating: avg,
      totalReviews: total,
      ratingBreakdown: breakdown,
    };
  }, [reviews]);

  // Handle new review submission for this specific pickle
  const handleAddReview = (newReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);

    // Save per-pickle reviews in localStorage
    try {
      localStorage.setItem(`omris_reviews_${productId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save review to localStorage', e);
    }

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <div className="w-full bg-white my-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold border border-neutral-700 whitespace-nowrap"
          >
            <CheckCircle className="w-5 h-5 text-teal-400" />
            <span>Review for "{productName}" submitted successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Reviews Summary Bar for this Pickle */}
      <ReviewsSummary
        averageRating={averageRating}
        totalReviews={totalReviews}
        ratingBreakdown={ratingBreakdown}
        onWriteReview={() => setIsModalOpen(true)}
      />

      {/* Review Cards List Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 font-sans">
          Customer Feedbacks for {productName} ({totalReviews})
        </h3>
        <ReviewList reviews={reviews} />
      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
      />
    </div>
  );
};

export default ProductReviewsSection;
