import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import './Signup.css'; // Reuses design system styles
import logo from '../assets/images/Omris_Home_Kitchen_logo1.png';
import bannerImg from '../assets/images/Mango_Pickel.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate password strength & rule compliance
  const getPasswordValidation = (pass = '') => {
    const hasMinLen = pass.length >= 6;
    const hasCaps = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    const rules = [
      { id: 'minLen', label: 'Minimum 6 characters', valid: hasMinLen },
      { id: 'caps', label: 'One Caps Letter (A-Z)', valid: hasCaps },
      { id: 'lower', label: 'One Lower Case (a-z)', valid: hasLower },
      { id: 'number', label: 'One Special Number (0-9)', valid: hasNumber },
      { id: 'symbol', label: 'One Special Symbol (!@#$%^&*)', valid: hasSymbol },
    ];

    const passedCount = rules.filter(r => r.valid).length;
    let label = '';
    let color = '#e5e7eb';
    let percentage = 0;

    if (!pass) {
      label = '';
      color = '#e5e7eb';
      percentage = 0;
    } else if (passedCount <= 2) {
      label = 'Weak Password';
      color = '#ef4444';
      percentage = Math.max((passedCount / 5) * 100, 20);
    } else if (passedCount <= 4) {
      label = 'Medium Password';
      color = '#f59e0b';
      percentage = (passedCount / 5) * 100;
    } else {
      label = 'Strong Password';
      color = '#10b981';
      percentage = 100;
    }

    const isValid = passedCount === 5;
    return { rules, passedCount, label, color, percentage, isValid };
  };

  const passwordValidation = getPasswordValidation(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Password is required');
      return;
    } else if (!passwordValidation.isValid) {
      setError('Password must meet all complexity requirements below');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid or expired token');
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
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
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
              <span className="badge-spice">
                <Sparkles size={14} className="inline mr-1" /> Secure Your Account
              </span>
              <h2>Set a New Password</h2>
              <p>Create a strong password to keep your account safe and continue exploring our delicious home kitchen items.</p>
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

        {/* ── Right Side: Reset Password Form Card ── */}
        <motion.div
          className="signup-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-header">
            <h3>Reset Password</h3>
            <p>Enter your new password to regain access.</p>
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
                  <strong>Password Reset Successful!</strong>
                  <p>Logging you in and redirecting to store...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="signup-form">
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className={`input-wrapper ${error && error.includes('Password is') ? 'has-error' : ''}`}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
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

              {/* Password Strength Indicator & Rules Checklist */}
              {password && (
                <div className="password-meter">
                  <div className="meter-track">
                    <div
                      className="meter-bar"
                      style={{
                        width: `${passwordValidation.percentage}%`,
                        backgroundColor: passwordValidation.color
                      }}
                    ></div>
                  </div>
                  <span className="meter-label" style={{ color: passwordValidation.color }}>
                    {passwordValidation.label}
                  </span>
                </div>
              )}

              <div className="password-rules-grid">
                {passwordValidation.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`rule-item ${rule.valid ? 'valid' : 'invalid'}`}
                  >
                    {rule.valid ? (
                      <CheckCircle2 size={13} color="#10b981" />
                    ) : (
                      <span className="rule-dot" />
                    )}
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className={`input-wrapper ${error && error.includes('match') ? 'has-error' : ''}`}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
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
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting || submitSuccess}
            >
              {isSubmitting ? (
                <span className="spinner-wrapper">
                  <span className="spinner"></span> Resetting...
                </span>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
