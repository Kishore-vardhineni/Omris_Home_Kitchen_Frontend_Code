import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import './Signup.css'; // Reuses design system styles
import logo from '../assets/images/Pickel_Home_Kitchen_Logo.png';
import bannerImg from '../assets/images/Mango_Pickel.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email address is required');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Something went wrong');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to connect to server. Please check your network.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">

        {/* ── Left Side: Brand Showcase Banner ── */}
        <motion.div
          className="signup-banner shadow-lg"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <Link to="/" className="banner-logo-link">
              <img src={logo} alt="Omris Home Kitchen" className="banner-logo" />
            </Link>

            <div className="banner-tagline">
              <h2>Forgot Your Password?</h2>
              <p>Don't worry, it happens to the best of us. Let's get you back to ordering your favorite pickles.</p>
            </div>

            <div className="banner-features">
              <div className="feature-item">
                <div className="icon-box"><ShieldCheck size={20} /></div>
                <div>
                  <h4>100% Secure Checkout</h4>
                  <p>Encrypted payment processing & safe account privacy.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="icon-box"><Heart size={20} /></div>
                <div>
                  <h4>Track Fresh Deliveries</h4>
                  <p>Real-time order tracking right to your doorstep.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Right Side: Forgot Password Form Card ── */}
        <motion.div
          className="signup-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-header">
            <h3>Forgot Password</h3>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="success-alert"
                style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={22} color="#ef4444" />
                <div>
                  <strong>Error</strong>
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
            {submitSuccess && (
              <motion.div
                className="success-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle2 size={22} />
                <div>
                  <strong>Email Sent!</strong>
                  <p>Check your email for the password reset link. It might take a few minutes to arrive.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!submitSuccess ? (
            <form onSubmit={handleSubmit} noValidate className="signup-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
                  <Mail className="field-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner-wrapper">
                    <span className="spinner"></span> Sending...
                  </span>
                ) : (
                  <>
                    Send Reset Link <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/login" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Return to Login
              </Link>
            </div>
          )}

          {!submitSuccess && (
            <div className="login-prompt">
              Remembered your password?{' '}
              <Link to="/login" className="login-link">
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
