import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Loader2, AlertCircle } from 'lucide-react';
import { getProductReviews } from '../services/reviewService';
import { getProducts } from '../services/productService';
import './TestimonialSection.css';

/* ── Avatar colour palette (cycled by index) ─────────────────── */
const AVATAR_COLORS = [
  '#e07b39', '#2d4a1e', '#7c3d12', '#1e40af',
  '#6b21a8', '#065f46', '#9f1239', '#92400e',
  '#0e7490', '#3730a3', '#166534', '#b45309',
];

/* ── Per-page config ─────────────────────────────────────────── */
const CARDS_PER_PAGE = 3;
const AUTO_INTERVAL = 4000;

/* ── Helper: initials from name ──────────────────────────────── */
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

/* ── Component ───────────────────────────────────────────────── */
const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  // ── Fetch reviews: get all products with reviews, then fetch their reviews ──
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get all active products
      const productsData = await getProducts({ limit: 50 });
      const products = (productsData?.products || []).filter(
        (p) => p.numReviews > 0 && p._id
      );

      if (products.length === 0) {
        setReviews([]);
        return;
      }

      // 2. Fetch reviews for each product that has reviews (in parallel)
      const reviewRequests = products.map((p) =>
        getProductReviews(p._id, { limit: 10, sort: 'newest' }).catch(() => null)
      );
      const results = await Promise.all(reviewRequests);

      // 3. Flatten and deduplicate reviews across products
      const allReviews = [];
      results.forEach((result) => {
        if (result?.success && Array.isArray(result.reviews)) {
          allReviews.push(...result.reviews);
        }
      });

      // 4. Sort by newest and cap at 12
      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(allReviews.slice(0, 12));
    } catch (err) {
      setError(err.message || 'Failed to load testimonials.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Responsive: 1 card on mobile ───────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Derived pagination ──────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(reviews.length / CARDS_PER_PAGE));

  /* Navigate forward */
  const next = useCallback(() => {
    setDirection(1);
    setPage((p) => (p + 1) % totalPages);
  }, [totalPages]);

  /* Navigate backward */
  const prev = useCallback(() => {
    setDirection(-1);
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  /* Auto-play */
  useEffect(() => {
    if (paused || reviews.length === 0) return;
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, next, reviews.length]);

  /* Reset page when reviews reload */
  useEffect(() => {
    setPage(0);
  }, [reviews]);

  /* Dot click */
  const goTo = (index) => {
    setDirection(index > page ? 1 : -1);
    setPage(index);
  };

  /* Current page cards */
  const pageCards = reviews.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  /* Framer Motion variants */
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: (dir) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.45, ease: 'easeInOut' },
    }),
  };

  return (
    <section
      className="testimonial-section"
      id="reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="section-header testimonial-header">
          <motion.h4
            className="subtitle-accent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Testimonials
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            className="testimonial-sub"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            Loved by thousands of pickle enthusiasts across India
          </motion.p>
        </div>

        {/* ── Loading State ───────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/70">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading reviews…</span>
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────── */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/70">
            <AlertCircle className="w-7 h-7" />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-1 text-xs underline opacity-70 hover:opacity-100 transition-opacity"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Carousel (only when reviews loaded) ────────────── */}
        {!isLoading && !error && reviews.length > 0 && (
          <>
            <div className="carousel-wrapper">
              {/* Prev Arrow */}
              <button
                className="carousel-arrow carousel-arrow-prev"
                onClick={() => { setDirection(-1); prev(); }}
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Track */}
              <div className="carousel-track-outer">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={page}
                    className={`testimonial-grid ${isMobile ? 'grid-mobile' : ''}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {pageCards.map((review, idx) => {
                      const globalIdx = page * CARDS_PER_PAGE + idx;
                      const avatarColor = AVATAR_COLORS[globalIdx % AVATAR_COLORS.length];
                      const initials = getInitials(review.name);
                      const ratingNum = Number(review.rating) || 5;

                      return (
                        <div className="testimonial-card" key={review._id}>
                          {/* Decorative quote */}
                          <div className="card-quote-icon">
                            <Quote size={28} />
                          </div>

                          {/* Stars */}
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < ratingNum ? '#e07b39' : 'transparent'}
                                color={i < ratingNum ? '#e07b39' : 'rgba(255,255,255,0.3)'}
                              />
                            ))}
                            <span className="rating-num">{ratingNum}.0</span>
                          </div>

                          {/* Review text */}
                          <p className="quote">"{review.comment}"</p>

                          {/* Author */}
                          <div className="author-row">
                            <div
                              className="author-avatar"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {initials}
                            </div>
                            <div className="author-info">
                              <h4 className="customer-name">{review.name}</h4>
                              <span className="customer-location">
                                {review.isVerifiedPurchase ? 'Verified Buyer' : review.title || 'Customer'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Arrow */}
              <button
                className="carousel-arrow carousel-arrow-next"
                onClick={() => { setDirection(1); next(); }}
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* ── Progress Bar ──────────────────────────────────── */}
            <div className="carousel-progress-wrap">
              <div
                className="carousel-progress-bar"
                style={{ width: `${((page + 1) / totalPages) * 100}%` }}
              />
            </div>

            {/* ── Dots ─────────────────────────────────────────── */}
            <div className="pagination-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`dot ${page === i ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            {/* ── Page counter ──────────────────────────────────── */}
            <p className="carousel-counter">
              {page + 1} / {totalPages}
            </p>
          </>
        )}

        {/* ── Empty State ─────────────────────────────────────── */}
        {!isLoading && !error && reviews.length === 0 && (
          <p className="text-center text-white/60 py-12 text-sm">
            No customer reviews yet. Be the first to share your experience!
          </p>
        )}

      </div>
    </section>
  );
};

export default TestimonialSection;
