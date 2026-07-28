import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
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
import './Signup.css';
import logo from '../assets/images/Omris_Home_Kitchen_logo1.png';
import bannerImg from '../assets/images/Mango_Pickel.png';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 2, label: 'Medium', color: '#f59e0b' };
    return { score: 3, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    // Clear error for this field dynamically
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API registration call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Auto navigate to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1200);
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
                <Sparkles size={14} className="inline mr-1" /> 100% Traditional & Pure
              </span>
              <h2>Authentic Homemade Indian Pickles</h2>
              <p>Crafted with love, traditional recipes, handpicked spices, and pure cold-pressed oils. Delivered fresh to your doorstep.</p>
            </div>

            <div className="banner-features">
              <div className="feature-item">
                <div className="icon-box"><ShieldCheck size={20} /></div>
                <div>
                  <h4>No Added Preservatives</h4>
                  <p>Zero artificial colors, chemicals, or synthetic flavors.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="icon-box"><Heart size={20} /></div>
                <div>
                  <h4>Grandma's Secret Recipes</h4>
                  <p>Sun-dried spices infused with authentic home care.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="icon-box"><CheckCircle2 size={20} /></div>
                <div>
                  <h4>Express Pan-India Delivery</h4>
                  <p>Hygienically leak-proof glass jar packaging.</p>
                </div>
              </div>
            </div>

            <div className="banner-hero-preview">
              <img src={bannerImg} alt="Delicious Pickle" className="floating-pickle-img" />
            </div>
          </div>
        </motion.div>

        {/* ── Right Side: Sign Up Form Card ── */}
        <motion.div 
          className="signup-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-header">
            <h3>Create Account</h3>
            <p>Join Omri's Home Kitchen family & enjoy exclusive pickle offers!</p>
          </div>

          <AnimatePresence>
            {submitSuccess && (
              <motion.div 
                className="success-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle2 size={22} />
                <div>
                  <strong>Account Created Successfully!</strong>
                  <p>Redirecting you to the login page...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className={`input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
                <User className="field-icon" size={18} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
              </div>
              {errors.fullName && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.fullName}
                </span>
              )}
            </div>

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

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className={`input-wrapper phone-wrapper ${errors.phone ? 'has-error' : ''}`}>
                <Phone className="field-icon" size={18} />
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
              </div>
              {errors.phone && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.phone}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-meter">
                  <div className="meter-track">
                    <div
                      className="meter-bar"
                      style={{
                        width: `${(passwordStrength.score / 3) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span className="meter-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label} Password
                  </span>
                </div>
              )}

              {errors.password && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={`input-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
                <span className="checkmark"></span>
                <span className="terms-text">
                  I agree to the <Link to="/privacy" className="link-highlight">Terms of Service</Link> and <Link to="/privacy" className="link-highlight">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.agreeTerms}
                </span>
              )}
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
                  <span className="spinner"></span> Creating Account...
                </span>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Social Sign Up */}
            <button
              type="button"
              className="social-btn google-btn"
              onClick={() => alert('Google Sign-In integration initialized!')}
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
              Sign up with Google
            </button>

            {/* Link to Login */}
            <div className="login-prompt">
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </div>

          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Signup;
