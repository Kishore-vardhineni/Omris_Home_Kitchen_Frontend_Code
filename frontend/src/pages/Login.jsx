import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Sparkles,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import './Signup.css';
import './Login.css';
import logo from '../assets/images/Omris_Home_Kitchen_logo1.png';
import bannerImg from '../assets/images/Mango_Pickel.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/* ─────────────────────────────────────────────
   MODE 1 — Email + Password
───────────────────────────────────────────── */
const EmailPasswordForm = ({ onSwitchToOtp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const passwordValidation = getPasswordValidation(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
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
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch {
      setErrors({ server: 'Unable to connect to server. Please check your network.' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="signup-form login-mode-form">
      <AnimatePresence>
        {errors.server && (
          <motion.div
            className="success-alert"
            style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <div><strong>Sign In Failed</strong><p>{errors.server}</p></div>
          </motion.div>
        )}
        {submitSuccess && (
          <motion.div className="success-alert"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={20} />
            <div><strong>Welcome Back!</strong><p>Redirecting to store...</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="ep-email">Email ID</label>
        <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
          <Mail className="field-icon" size={18} />
          <input
            type="email" id="ep-email" name="email"
            placeholder="Enter your active email ID"
            value={formData.email} onChange={handleChange}
            disabled={isSubmitting || submitSuccess}
            autoComplete="email"
          />
        </div>
        {errors.email && <span className="error-message"><AlertCircle size={13} /> {errors.email}</span>}
      </div>

      {/* Password */}
      <div className="form-group">
        <div className="login-label-row">
          <label htmlFor="ep-password">Password</label>
          <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
        </div>
        <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
          <Lock className="field-icon" size={18} />
          <input
            type={showPassword ? 'text' : 'password'} id="ep-password" name="password"
            placeholder="Enter your password"
            value={formData.password} onChange={handleChange}
            disabled={isSubmitting || submitSuccess}
            autoComplete="current-password"
          />
          <button type="button" className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <span className="error-message"><AlertCircle size={13} /> {errors.password}</span>}

        {/* Password Strength Indicator & Interactive Rules Grid */}
        {formData.password && (
          <div className="password-meter" style={{ marginTop: '0.4rem' }}>
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

        <div className="password-rules-grid" style={{ marginTop: '0.4rem' }}>
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

      {/* Sign In Button */}
      <motion.button type="submit" className="submit-btn"
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        disabled={isSubmitting || submitSuccess}
        style={{ marginTop: '0.25rem' }}
      >
        {isSubmitting
          ? <span className="spinner-wrapper"><span className="spinner" /> Signing In...</span>
          : <><ArrowRight size={18} /> Sign In</>}
      </motion.button>

      {/* Switch to OTP */}
      <div className="login-switch-row">
        <button type="button" className="login-otp-switch-btn" onClick={onSwitchToOtp}>
          <MessageSquare size={15} /> Use OTP to Login
        </button>
      </div>

      {/* Divider + Google */}
      <div className="divider"><span>OR</span></div>
      <button type="button" className="social-btn google-btn"
        onClick={() => alert('Google Sign-In initialized!')}
        disabled={isSubmitting || submitSuccess}>
        <svg className="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Sign in with Google
      </button>

      <div className="login-prompt">
        Don't have an account?{' '}
        <Link to="/signup" className="login-link">Create Account</Link>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────
   MODE 2 — Mobile + OTP
───────────────────────────────────────────── */
const MobileOtpForm = ({ onSwitchToEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const validateMobile = () => {
    const digits = mobile.replace(/\D/g, '');
    if (!mobile.trim()) {
      setErrors({ mobile: 'Mobile number is required' });
      return false;
    }
    if (digits.length !== 10) {
      setErrors({ mobile: 'Please enter a valid 10-digit mobile number' });
      return false;
    }
    setErrors({});
    return true;
  };

  const [devOtp, setDevOtp] = useState('');

  const handleGetOtp = async () => {
    if (!validateMobile()) return;
    setIsRequesting(true);
    setErrors({});
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.replace(/\D/g, '') }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrors({ mobile: data.message || 'Failed to send OTP. Please try again.' });
        setIsRequesting(false);
        return;
      }
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep('otp');
      startResendTimer();
    } catch {
      setErrors({ mobile: 'Unable to connect to server. Please check your network.' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (errors.otp) setErrors({});
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return;
    }
    setIsVerifying(true);
    setErrors({});
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.replace(/\D/g, ''), otp: otpString }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrors({ otp: data.message || 'Invalid OTP. Please try again.' });
        setIsVerifying(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }
      setIsVerifying(false);
      setSubmitSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch {
      setErrors({ otp: 'Unable to connect to server. Please check your network.' });
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setErrors({});
    handleGetOtp();
  };

  return (
    <div className="signup-form login-mode-form">
      <AnimatePresence mode="wait">
        {submitSuccess && (
          <motion.div className="success-alert"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={20} />
            <div><strong>Welcome Back!</strong><p>Redirecting to store...</p></div>
          </motion.div>
        )}

        {/* ── Step 1: Enter Mobile ── */}
        {step === 'mobile' && (
          <motion.div key="mobile-step"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
          >
            <div className="form-group">
              <label htmlFor="otp-mobile">Mobile Number</label>
              <div className={`input-wrapper phone-wrapper ${errors.mobile ? 'has-error' : ''}`}>
                <Phone className="field-icon" size={18} />
                <span className="country-code">+91 -</span>
                <input
                  type="tel" id="otp-mobile" name="mobile"
                  placeholder="Enter your 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(val);
                    if (errors.mobile) setErrors({});
                  }}
                  disabled={isRequesting}
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>
              {errors.mobile
                ? <span className="error-message"><AlertCircle size={13} /> {errors.mobile}</span>
                : <span className="login-otp-hint">You will receive an OTP on this number</span>
              }
            </div>

            <motion.button type="button" className="submit-btn"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleGetOtp} disabled={isRequesting}
            >
              {isRequesting
                ? <span className="spinner-wrapper"><span className="spinner" /> Sending OTP...</span>
                : <><MessageSquare size={17} /> Get OTP</>}
            </motion.button>

            <div className="divider"><span>OR</span></div>

            <button type="button" className="social-btn login-email-switch-btn" onClick={onSwitchToEmail}>
              <Mail size={17} /> Use Email to Login
            </button>

            <div className="divider"><span>OR</span></div>

            <button type="button" className="social-btn google-btn"
              onClick={() => alert('Google Sign-In initialized!')}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google
            </button>

            <div className="login-prompt">
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">Create Account</Link>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Enter OTP ── */}
        {step === 'otp' && (
          <motion.div key="otp-step"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Sent to indicator */}
            <div className="otp-sent-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <p>OTP sent to <strong>+91 {mobile}</strong> and your registered email!</p>
              </div>
              {devOtp && (
                <button
                  type="button"
                  onClick={() => setOtp(devOtp.split(''))}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '0.2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  ⚡ Test OTP: {devOtp} (Click to Auto-fill)
                </button>
              )}
            </div>

            {/* OTP Boxes */}
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <div className="otp-boxes-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text" inputMode="numeric" maxLength={1}
                    className={`otp-box ${errors.otp ? 'otp-box--error' : ''} ${digit ? 'otp-box--filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={isVerifying || submitSuccess}
                  />
                ))}
              </div>
              {errors.otp && <span className="error-message"><AlertCircle size={13} /> {errors.otp}</span>}
            </div>

            {/* Resend */}
            <div className="otp-resend-row">
              <span className="otp-resend-text">Didn't receive the OTP?</span>
              <button type="button" className="otp-resend-btn" onClick={handleResend}
                disabled={resendTimer > 0 || isVerifying}>
                {resendTimer > 0
                  ? <><RefreshCw size={13} /> Resend in {resendTimer}s</>
                  : <><RefreshCw size={13} /> Resend OTP</>}
              </button>
            </div>

            {/* Verify Button */}
            <motion.button type="button" className="submit-btn"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleVerifyOtp} disabled={isVerifying || submitSuccess}
            >
              {isVerifying
                ? <span className="spinner-wrapper"><span className="spinner" /> Verifying...</span>
                : <><CheckCircle2 size={17} /> Verify & Sign In</>}
            </motion.button>

            {/* Change number */}
            <button type="button" className="login-otp-switch-btn"
              onClick={() => { setStep('mobile'); setOtp(['', '', '', '', '', '']); setErrors({}); }}>
              ← Change Mobile Number
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN Login Page
───────────────────────────────────────────── */
const Login = () => {
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'otp'

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">

        {/* ── Left Banner ── */}
        <motion.div className="signup-banner shadow-lg"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
        >
          <div className="banner-overlay" />
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
                  <p>Encrypted payment processing &amp; safe account privacy.</p>
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

        {/* ── Right Form Card ── */}
        <motion.div className="signup-card"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-header">
            <h3>Sign In</h3>
            <p>Access your kitchen account below</p>
          </div>

          {/* ── Mode Toggle Tabs ── */}
          <div className="login-mode-tabs">
            <button
              className={`login-tab ${loginMode === 'email' ? 'login-tab--active' : ''}`}
              onClick={() => setLoginMode('email')}
              type="button"
            >
              <Mail size={15} /> Email &amp; Password
            </button>
            <button
              className={`login-tab ${loginMode === 'otp' ? 'login-tab--active' : ''}`}
              onClick={() => setLoginMode('otp')}
              type="button"
            >
              <Phone size={15} /> Mobile OTP
            </button>
            {/* Sliding indicator */}
            <motion.span
              className="login-tab-indicator"
              animate={{ x: loginMode === 'email' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          </div>

          {/* ── Mode Content ── */}
          <AnimatePresence mode="wait">
            {loginMode === 'email' ? (
              <motion.div key="email-mode"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <EmailPasswordForm onSwitchToOtp={() => setLoginMode('otp')} />
              </motion.div>
            ) : (
              <motion.div key="otp-mode"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <MobileOtpForm onSwitchToEmail={() => setLoginMode('email')} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
