import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/register (or /api/users/register)
// @desc    Register a new user account
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/signup (Alias for register)
router.post('/signup', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/forgotpassword
// @desc    Forgot Password
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/auth/resetpassword/:token
// @desc    Reset Password
// @access  Public
router.put('/resetpassword/:token', resetPassword);

export default router;
