import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles
} from 'lucide-react';
import './Signup.css'; // Reuses design system styles
import logo from '../assets/images/Omris_Home_Kitchen_logo1.png';
import bannerImg from '../assets/images/Mango_Pickel.png';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrors({ server: data.message || 'Invalid email or password' });
        setIsSubmitting(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ server: 'Unable to connect to server. Please check your network.' });
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
              <span className="badge-spice">
                <Sparkles size={14} className="inline mr-1" /> Welcome Back!
              </span>
              <h2>Welcome to Omri's Home Kitchen</h2>
              <p>Sign in to manage your orders, save favorite pickles, and get exclusive kitchen offers.</p>
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

            <div className="banner-hero-preview">
              <img src={bannerImg} alt="Delicious Pickle" className="floating-pickle-img" />
            </div>
          </div>
        </motion.div>

        {/* ── Right Side: Login Form Card ── */}
        <motion.div 
          className="signup-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-header">
            <h3>Sign In</h3>
            <p>Enter your credentials to access your kitchen account</p>
          </div>

          <AnimatePresence>
            {errors.server && (
              <motion.div 
                className="success-alert"
                style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={22} color="#ef4444" />
                <div>
                  <strong>Sign In Failed</strong>
                  <p>{errors.server}</p>
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
                  <strong>Welcome Back!</strong>
                  <p>Logging you in and redirecting to store...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            
            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
              </div>
              {errors.email && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email!'); }} className="link-highlight" style={{ fontSize: '0.8rem' }}>
                  Forgot Password?
                </a>
              </div>
              <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.password}
                </span>
              )}
            </div>

            {/* Remember me Checkbox */}
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
                <span className="checkmark"></span>
                <span className="terms-text">Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting || submitSuccess}
            >
              {isSubmitting ? (
                <span className="spinner-wrapper">
                  <span className="spinner"></span> Signing In...
                </span>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Social Login */}
            <button
              type="button"
              className="social-btn google-btn"
              onClick={() => alert('Google Sign-In initialized!')}
              disabled={isSubmitting || submitSuccess}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Link to Signup */}
            <div className="login-prompt">
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">
                Create Account
              </Link>
            </div>

          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
