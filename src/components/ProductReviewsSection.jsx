import React, { useState, useMemo } from 'react';
import ReviewsSummary from './ReviewsSummary';
import WriteReviewModal from './WriteReviewModal';
import ReviewList from './ReviewList';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    rating: 5,
    title: 'Authentic Homemade Taste!',
    text: 'The Mango Pickle tastes exactly like how my grandmother used to make it. The perfect blend of spices and raw mango tanginess. Absolutely love it!',
    date: 'Jul 24, 2026',
    verified: true,
  },
  {
    id: 2,
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    rating: 5,
    title: 'Addictive Flavor & Great Quality',
    text: 'I am totally addicted to their Garlic Pickle. It has become a staple with my everyday meals. Excellent packaging and super fast delivery too!',
    date: 'Jul 20, 2026',
    verified: true,
  },
  {
    id: 3,
    name: 'Anita Desai',
    email: 'anita@example.com',
    rating: 5,
    title: 'Pure & Preservative Free',
    text: 'Pure ingredients and no artificial preservatives — that is what I love about Omris Pickles. The Mixed Veg pickle is simply delightful.',
    date: 'Jul 15, 2026',
    verified: true,
  },
  {
    id: 4,
    name: 'Suresh Reddy',
    email: 'suresh@example.com',
    rating: 4,
    title: 'Spicy & Tangy Goodness',
    text: 'Ordered three jars of Gongura Pickle and they were gone within a week! The tanginess and spice level are absolutely perfect.',
    date: 'Jul 10, 2026',
    verified: true,
  },
  {
    id: 5,
    name: 'Kavitha Nair',
    email: 'kavitha@example.com',
    rating: 3,
    title: 'Decent flavor, slightly spicy for me',
    text: 'The pickle is very authentic, though a bit too spicy for my personal preference. Packaging was top notch.',
    date: 'Jul 02, 2026',
    verified: true,
  },
];

/**
 * ProductReviewsSection Component
 * 
 * Master section container managing review state.
 * Connects ReviewsSummary, WriteReviewModal, and ReviewList so that
 * submitting a review dynamically recalculates rating averages, star counts,
 * and updates the review list in real time.
 */
const ProductReviewsSection = () => {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Dynamic calculations derived from client state
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

  // Handle new review submission
  const handleAddReview = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold border border-neutral-700 whitespace-nowrap"
          >
            <CheckCircle className="w-5 h-5 text-teal-400" />
            <span>Thank you! Your review has been submitted successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Reviews Summary Bar */}
      <ReviewsSummary
        averageRating={averageRating}
        totalReviews={totalReviews}
        ratingBreakdown={ratingBreakdown}
        onWriteReview={() => setIsModalOpen(true)}
      />

      {/* Review Cards List Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 font-sans">
          Customer Feedbacks ({totalReviews})
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
