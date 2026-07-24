import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Droplets, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroSection.css';

import slide1 from '../assets/images/Landingpage_Image1.png';
import slide2 from '../assets/images/Landingpage_Image.png';
import slide3 from '../assets/images/Mango_Pickel.png';
import slide4 from '../assets/images/tomato_pickle.png';
import slide5 from '../assets/images/Chicken_Boneless.png';

/* ── Slides ─────────────────────────────────────────────────── */
const slides = [

  {
    id: 3,
    image: slide3,
    tag: 'Premium Quality',
    titleItalic: 'Spicy Mango Pickle',
    titleBold: 'Pure & Natural',
    sub: 'Raw mangoes handpicked and blended with aromatic spices',
  },
  {
    id: 4,
    image: slide4,
    tag: 'Trending',
    titleItalic: 'Tangy Tomato Pickle',
    titleBold: 'Taste the Tradition',
    sub: 'Rich tomato base with signature spice blend — a pantry staple',
  },
  {
    id: 5,
    image: slide5,
    tag: 'New Arrival',
    titleItalic: 'Chicken Boneless Pickle',
    titleBold: 'Bold & Delicious',
    sub: 'Tender boneless chicken pieces marinated in traditional spices',
  },
];

const FEATURES = [
  { icon: <Leaf size={18} />, label: '100% Natural' },
  { icon: <Droplets size={18} />, label: 'No Preservatives' },
  { icon: <Heart size={18} />, label: 'Made with Love' },
];

const AUTO_DELAY = 4500;

/* ── Component ──────────────────────────────────────────────── */
const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTO_DELAY);
    return () => clearInterval(t);
  }, [paused, next]);

  /* BG slide: slides horizontally */
  const bgVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%' }),
    center: { x: 0, transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }),
  };

  /* Text: fades in/out — mode="wait" ensures NO overlap */
  const textVariants = {
    enter: { opacity: 0, y: 22 },
    center: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } },
  };

  const slide = slides[current];

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image track (full 100% width) ─────────── */}
      <div className="hero-bg-track">
        <AnimatePresence mode="sync" custom={direction} initial={false}>
          <motion.div
            key={`bg-${slide.id}`}
            className="hero-bg-slide"
            custom={direction}
            variants={bgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </AnimatePresence>

        {/* Cream gradient on left so text stays readable without dark overlay */}
        <div className="hero-overlay" />
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="container hero-inner flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 w-full py-20 sm:py-28 lg:py-20">
        <div className="hero-content flex-1 w-full max-w-full lg:max-w-xl z-10">

          {/* mode="wait" → exit finishes BEFORE enter starts → no double text */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`text-${slide.id}`}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="hero-text-block"
            >
              {/* Tag */}
              <span className="hero-tag">{slide.tag}</span>

              {/* Heading */}
              <h1 className="break-words mb-5">
                <span className="hero-title-italic block sm:inline mr-2">{slide.titleItalic}</span>
                <span className="hero-title-bold block sm:inline">{slide.titleBold}</span>
              </h1>

              {/* Subtitle */}
              <p className="subtitle">{slide.sub}</p>

              {/* Features — horizontal row */}
              <div className="features flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mb-10">
                {FEATURES.map((f) => (
                  <div className="feature-item" key={f.label}>
                    <span className="feature-icon">{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link to="/veg-pickles" className="btn btn-primary btn-lg">
                SHOP NOW &rarr;
              </Link>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ── Arrows ───────────────────────────────────────────── */}
      <button className="hero-arrow hero-arrow-prev" onClick={() => { setDirection(-1); prev(); }} aria-label="Previous">
        <ChevronLeft size={24} />
      </button>
      <button className="hero-arrow hero-arrow-next" onClick={() => { setDirection(1); next(); }} aria-label="Next">
        <ChevronRight size={24} />
      </button>

      {/* ── Dots ─────────────────────────────────────────────── */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Bottom progress bar ───────────────────────────────── */}
      <div className="hero-progress-wrap">
        <motion.div
          className="hero-progress-bar"
          key={`prog-${current}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: AUTO_DELAY / 1000, ease: 'linear' }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
