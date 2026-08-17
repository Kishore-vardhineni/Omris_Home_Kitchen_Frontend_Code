import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReviewsSummary from './ReviewsSummary';
import WriteReviewModal from './WriteReviewModal';
import ReviewList from './ReviewList';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getProductReviews, createReview } from '../services/reviewService';

/**
 * ProductReviewsSection Component
 *
 * Fetches reviews from the backend API for a specific product.
 * - Accepts `productId` and `productName`
 * - Fetches reviews, average rating, and breakdown from /api/reviews/:productId
 * - Posts new reviews to /api/reviews/:productId via the WriteReviewModal
 * - Shows loading, error, and empty states gracefully
 */
const ProductReviewsSection = ({ productId, productName = 'Pickle' }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  // ── Derived: averageRating & ratingBreakdown array ─────────────────────────
  const { averageRating, breakdownArray } = useMemo(() => {
    const arr = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: ratingBreakdown[s] || 0 }));
    const totalCount = arr.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) return { averageRating: 0, breakdownArray: arr };

    const weightedSum = arr.reduce((sum, item) => sum + item.stars * item.count, 0);
    const avg = parseFloat((weightedSum / totalCount).toFixed(2));
    return { averageRating: avg, breakdownArray: arr };
  }, [ratingBreakdown]);

  // ── Fetch reviews from API ─────────────────────────────────────────────────
  const fetchReviews = useCallback(
    async (page = 1, sortBy = sort, append = false) => {
      if (!productId) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await getProductReviews(productId, { page, limit: 10, sort: sortBy });

        if (data && data.success) {
          // Map API response fields to frontend shape
          const mapped = (data.reviews || []).map((r) => ({
            id: r._id,
            name: r.name,
            rating: r.rating,
            title: r.title,
            text: r.comment,
            date: new Date(r.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            verified: r.isVerifiedPurchase,
            photos: r.photos || [],
          }));

          setReviews((prev) => (append ? [...prev, ...mapped] : mapped));
          setRatingBreakdown(data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          setTotal(data.total || 0);
          setCurrentPage(data.currentPage || page);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [productId, sort]
  );

  // Initial fetch & re-fetch when productId or sort changes
  useEffect(() => {
    setReviews([]);
    setCurrentPage(1);
    fetchReviews(1, sort, false);
  }, [productId, sort]);

  // ── Handle sort change ─────────────────────────────────────────────────────
  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  // ── Load More reviews ──────────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchReviews(currentPage + 1, sort, true);
    }
  };

  // ── Handle new review submission ───────────────────────────────────────────
  const handleAddReview = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        title: formData.title || '',
        comment: formData.text,
        photos: formData.photos || [],
      };

      const result = await createReview(productId, payload);

      if (result && result.success) {
        setIsModalOpen(false);
        showToast('success', `Review for "${productName}" submitted! It will appear after approval.`);
        // Refetch page 1 to show updated totals
        fetchReviews(1, sort, false);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 5000);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white my-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[10000] px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold border whitespace-nowrap ${
              toast.type === 'success'
                ? 'bg-black text-white border-neutral-700'
                : 'bg-red-600 text-white border-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Reviews Summary Bar */}
      <ReviewsSummary
        averageRating={averageRating}
        totalReviews={total}
        ratingBreakdown={breakdownArray}
        onWriteReview={() => setIsModalOpen(true)}
      />

      {/* Review Cards List Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Header row: title + sort dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-sans">
            Customer Feedbacks for {productName} ({total})
          </h3>

          {/* Sort selector */}
          {total > 0 && (
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm text-black border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white cursor-pointer"
              aria-label="Sort reviews"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading reviews…</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => fetchReviews(1, sort, false)}
              className="mt-1 text-xs underline text-gray-500 hover:text-black transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && !error && (
          <>
            <ReviewList reviews={reviews} />

            {/* Load More */}
            {currentPage < totalPages && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    `Load More Reviews (${total - reviews.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ProductReviewsSection;
