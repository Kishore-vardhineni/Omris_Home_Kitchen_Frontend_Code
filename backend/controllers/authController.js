import User from '../models/User.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import sendSms from '../utils/sendSms.js';

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
    const { email, mobile, password } = req.body;

    // Must provide either email or mobile, plus password
    if ((!email && !mobile) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or mobile number along with your password',
      });
    }

    let user = null;

    if (mobile) {
      // Login via mobile/phone number
      const cleanMobile = String(mobile).replace(/\D/g, '');
      user = await User.findOne({ phone: cleanMobile }).select('+password');
    } else {
      // Login via email
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    }

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
        message: 'Invalid credentials. Please check your email/mobile and password.',
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
        message: 'Invalid or expired password reset token',
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a password with at least 6 characters',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
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
      message: 'Server error during password reset',
      error: error.message,
    });
  }
};

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty',
        });
      }
      user.name = trimmedName;
    }

    if (email !== undefined && email !== null) {
      const formattedEmail = String(email).toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formattedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }

      if (formattedEmail !== user.email) {
        const existingUser = await User.findOne({ email: formattedEmail });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'This email address is already in use by another account',
          });
        }
        user.email = formattedEmail;
      }
    }

    if (phone !== undefined && phone !== null) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      if (!/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number',
        });
      }
      user.phone = cleanPhone;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
  } catch (error) {
    console.error('Error in updateUserProfile:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Send OTP to a registered mobile number for login
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a mobile number',
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    const user = await User.findOne({ phone: cleanMobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this mobile number. Please register first.',
      });
    }

    // Generate OTP using model method (stores hashed OTP + expiry on user doc)
    const otp = user.generateLoginOtp();
    await user.save({ validateBeforeSave: false });

    // 1. Send OTP to registered email (using existing working Gmail SMTP)
    try {
      await sendEmail({
        email: user.email,
        subject: `Your Login OTP - ${otp} | Omris Home Kitchen`,
        message: `Your login OTP is ${otp}. It is valid for 10 minutes.`,
        htmlMessage: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1C1500; background-color: #FEF3C0; border-radius: 10px;">
            <h2 style="color: #1C1500; margin-bottom: 10px;">Omri's Home Kitchen - Login OTP</h2>
            <p>Hello <strong>${user.name || 'Valued Customer'}</strong>,</p>
            <p>You requested a 6-digit OTP to log into your account with mobile number <strong>+91 ${cleanMobile}</strong>.</p>
            <div style="background-color: #1C1500; color: #F5B800; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 15px 25px; display: inline-block; border-radius: 8px; margin: 15px 0;">
              ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e2d9c5; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666666;">If you did not request this OTP, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('⚠️ Could not send OTP email fallback:', emailErr.message);
    }

    // 2. Send the OTP via SMS (Twilio)
    const smsMessage = `Your Omris Home Kitchen login OTP is ${otp}. It is valid for 10 minutes.`;
    await sendSms(cleanMobile, smsMessage);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile} (and to ${user.email})`,
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP and log user in
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both mobile number and OTP',
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');

    // Hash the submitted OTP to compare with stored hash
    const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const user = await User.findOne({
      phone: cleanMobile,
      loginOtp: hashedOtp,
      loginOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    // Clear OTP fields after successful verification
    user.loginOtp = undefined;
    user.loginOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'OTP verified. Login successful.',
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
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP',
      error: error.message,
    });
  }
};

