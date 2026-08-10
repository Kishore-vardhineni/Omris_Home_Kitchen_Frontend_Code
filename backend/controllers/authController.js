import User from '../models/User.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Register a new user (Signup)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, addresses, role } = req.body;

    // 1. Validation: Ensure required fields are present
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and phone',
      });
    }

    // 2. Format inputs
    const formattedEmail = email.toLowerCase().trim();

    // 3. Email format regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // 4. Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 5. Phone number validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    // 6. Check if user already exists
    const userExists = await User.findOne({ email: formattedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists',
      });
    }

    // 7. Role restriction (prevent unauthorized admin creation from public endpoint)
    const userRole = role === 'admin' && req.body.adminSecret === process.env.ADMIN_SECRET ? 'admin' : 'customer';

    // 8. Create user document (Password is automatically hashed by User.js pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: formattedEmail,
      password,
      phone: cleanPhone,
      addresses: Array.isArray(addresses) ? addresses : [],
      role: userRole,
    });

    if (user) {
      // 9. Generate JWT Token & Auth Cookie
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      // 10. Send HTTP 201 Created Response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    
    // Mongoose duplicate key error fallback
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered',
      });
    }

    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during user registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Ensure 'Gude veeranya' has admin role
      if (user.name && user.name.toLowerCase() === 'gude veeranya' && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          isVerified: user.isVerified,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host').replace('3001', '5173')}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
        htmlMessage: `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
                      <p>Please click the link below to reset your password:</p>
                      <a href="${resetUrl}" target="_blank">Reset Password</a>`,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during forgot password',
      error: error.message,
    });
  }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/resetpassword/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Generate token and login automatically (optional)
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during reset password',
      error: error.message,
    });
  }
};
