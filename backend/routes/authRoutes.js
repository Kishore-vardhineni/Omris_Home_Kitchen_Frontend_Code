import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  getUserProfile,
  addUserAddress,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/signup (Alias for register)
router.post('/signup', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (email or mobile)
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/send-otp
// @desc    Send OTP to a registered mobile number
// @access  Public
router.post('/send-otp', sendOtp);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and log user in
// @access  Public
router.post('/verify-otp', verifyOtp);

// @route   POST /api/auth/forgotpassword
// @desc    Forgot Password – send reset email
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/auth/resetpassword/:token
// @desc    Reset Password
// @access  Public
router.put('/resetpassword/:token', resetPassword);

// @route   GET /api/auth/profile
// @desc    Get logged-in user's profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update logged-in user's profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/auth/profile/address
// @desc    Add a delivery address to user's profile
// @access  Private
router.post('/profile/address', protect, addUserAddress);

export default router;
