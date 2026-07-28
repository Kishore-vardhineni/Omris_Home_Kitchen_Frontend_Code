import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="container about-inner grid grid-cols-1 lg:grid-cols-3 gap-12 text-center lg:text-left">
        <div className="about-image-col order-2 lg:order-1 flex justify-center">
          <motion.div
            className="about-jar"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="https://placehold.co/400x500/e07b39/ffffff?text=Traditional+Pickle" alt="Traditional Pickle" />
            <div className="shadow-large"></div>
          </motion.div>
        </div>

        <div className="about-content-col order-1 lg:order-2">
          <motion.h4
            className="subtitle-accent"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            The Taste of Tradition
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            At Omris Home Kitchen's Pickles, we believe in preserving the authentic flavors of our heritage.
            Every jar is carefully crafted using age-old recipes, handpicked sun-dried spices,
            and pure cold-pressed oils. We bring you not just a pickle, but a jar full of
            memories, love, and tradition.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/about" className="btn btn-outline">
              READ MORE
            </Link>
          </motion.div>
        </div>

        <div className="about-features-col order-3 mt-8 lg:mt-0">
          <motion.div className="feature-grid grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, staggerChildren: 0.2 }}
          >
            <motion.div className="feature-box" whileHover={{ y: -5 }}>
              <Heart className="f-icon" size={32} />
              <h4>Authentic Home-made</h4>
            </motion.div>
            <motion.div className="feature-box" whileHover={{ y: -5 }}>
              <Leaf className="f-icon" size={32} />
              <h4>Handpicked Ingredients</h4>
            </motion.div>
            <motion.div className="feature-box" whileHover={{ y: -5 }}>
              <ShieldCheck className="f-icon" size={32} />
              <h4>Hygienically Prepared</h4>
            </motion.div>
            <motion.div className="feature-box" whileHover={{ y: -5 }}>
              <Truck className="f-icon" size={32} />
              <h4>Delivered with Care</h4>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
