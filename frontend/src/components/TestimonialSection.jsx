import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './TestimonialSection.css';

/* ── 12 Customer Reviews → 4 pages × 3 cards ─────────────── */
const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Hyderabad',
    rating: 5,
    text: 'The Mango Pickle tastes exactly like how my grandmother used to make it. The perfect blend of spices and raw mango tanginess. Absolutely love it!',
    avatar: 'PS',
    color: '#e07b39',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    location: 'Bangalore',
    rating: 5,
    text: 'I am totally addicted to their Garlic Pickle. It has become a staple with my everyday meals. Excellent packaging and super fast delivery too!',
    avatar: 'RV',
    color: '#2d4a1e',
  },
  {
    id: 3,
    name: 'Anita Desai',
    location: 'Hyderabad',
    rating: 5,
    text: 'Pure ingredients and no artificial preservatives — that is what I love about Omris Pickles. The Mixed Veg pickle is simply delightful. Will reorder!',
    avatar: 'AD',
    color: '#7c3d12',
  },
  {
    id: 4,
    name: 'Suresh Reddy',
    location: 'Chennai',
    rating: 5,
    text: 'Ordered three jars of Gongura Pickle and they were gone within a week! The tanginess and spice level are absolutely perfect. Best pickles online!',
    avatar: 'SR',
    color: '#1e40af',
  },
  {
    id: 5,
    name: 'Kavitha Nair',
    location: 'Kochi',
    rating: 5,
    text: 'Such authentic homemade taste! You can tell every jar is made with so much love and care. My kids ask for the lemon pickle with every meal now.',
    avatar: 'KN',
    color: '#6b21a8',
  },
  {
    id: 6,
    name: 'Mohan Das',
    location: 'Delhi',
    rating: 5,
    text: 'I gifted a hamper of pickles to my colleagues and everyone was asking where I got them from. The quality is unmatched. Highly recommended!',
    avatar: 'MD',
    color: '#065f46',
  },
  {
    id: 7,
    name: 'Lakshmi Iyer',
    location: 'Pune',
    rating: 5,
    text: 'The Tomato Pickle is a revelation. It pairs beautifully with idli and dosa. I have been ordering every month and the quality is always consistent.',
    avatar: 'LI',
    color: '#9f1239',
  },
  {
    id: 8,
    name: 'Arjun Menon',
    location: 'Vizag',
    rating: 5,
    text: 'As someone from Andhra, I am very particular about my pickles. Omris Pickles nailed it. The spice level, oil, and salt balance is just right. 10/10!',
    avatar: 'AM',
    color: '#92400e',
  },
  {
    id: 9,
    name: 'Deepika Joshi',
    location: 'Jaipur',
    rating: 4,
    text: 'Wonderful homemade flavour. I tried the Amla Pickle for the first time and it is now my favourite. Packaging was secure and the jar arrived perfectly sealed.',
    avatar: 'DJ',
    color: '#0e7490',
  },
  {
    id: 10,
    name: 'Venkat Rao',
    location: 'Hyderabad',
    rating: 5,
    text: 'I have tried many pickle brands online but nothing beats this. You can taste the tradition and love in every bite. My go-to gift for family visits!',
    avatar: 'VR',
    color: '#3730a3',
  },
  {
    id: 11,
    name: 'Sneha Kulkarni',
    location: 'Nagpur',
    rating: 5,
    text: 'The Cauliflower Pickle is a hidden gem. Crunchy, spicy and perfectly salted. My husband finished the entire jar in two days! Placing another order now.',
    avatar: 'SK',
    color: '#166534',
  },
  {
    id: 12,
    name: 'Ramesh Pillai',
    location: 'Trivandrum',
    rating: 5,
    text: 'Omris Pickles remind me of my mother\'s cooking. The Lime Pickle has the exact sourness I grew up with. Authentic, fresh, and absolutely delicious!',
    avatar: 'RP',
    color: '#b45309',
  },
];

/* ── Page-based config: 3 cards per page = 4 pages ─────────── */
const CARDS_PER_PAGE = 3; // cards shown per slide
const TOTAL_PAGES = Math.ceil(reviews.length / CARDS_PER_PAGE); // = 4
const AUTO_INTERVAL = 4000;

/* ── Component ──────────────────────────────────────────────── */
const TestimonialSection = () => {
  const [page, setPage] = useState(0);          // 0–3
  const [direction, setDirection] = useState(1);           // 1=right, -1=left
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  /* Responsive: on mobile show 1 card at a time, still 4 pages */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Navigate forward */
  const next = useCallback(() => {
    setDirection(1);
    setPage((p) => (p + 1) % TOTAL_PAGES);
  }, []);

  /* Navigate backward */
  const prev = useCallback(() => {
    setDirection(-1);
    setPage((p) => (p - 1 + TOTAL_PAGES) % TOTAL_PAGES);
  }, []);

  /* Auto-play */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  /* Dot click */
  const goTo = (index) => {
    setDirection(index > page ? 1 : -1);
    setPage(index);
  };

  /* Slice the 3 reviews for the current page */
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

        {/* ── Carousel ───────────────────────────────────────── */}
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
                {pageCards.map((review) => (
                  <div className="testimonial-card" key={review.id}>
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
                          fill={i < review.rating ? '#e07b39' : 'transparent'}
                          color={i < review.rating ? '#e07b39' : 'rgba(255,255,255,0.3)'}
                        />
                      ))}
                      <span className="rating-num">{review.rating}.0</span>
                    </div>

                    {/* Review text */}
                    <p className="quote">"{review.text}"</p>

                    {/* Author */}
                    <div className="author-row">
                      <div
                        className="author-avatar"
                        style={{ backgroundColor: review.color }}
                      >
                        {review.avatar}
                      </div>
                      <div className="author-info">
                        <h4 className="customer-name">{review.name}</h4>
                        <span className="customer-location">{review.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
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

        {/* ── Progress Bar ────────────────────────────────────── */}
        <div className="carousel-progress-wrap">
          <div
            className="carousel-progress-bar"
            style={{ width: `${((page + 1) / TOTAL_PAGES) * 100}%` }}
          />
        </div>

        {/* ── 4 Dots Only ─────────────────────────────────────── */}
        <div className="pagination-dots">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              className={`dot ${page === i ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Page counter ────────────────────────────────────── */}
        <p className="carousel-counter">
          {page + 1} / {TOTAL_PAGES}
        </p>

      </div>
    </section>
  );
};

export default TestimonialSection;
