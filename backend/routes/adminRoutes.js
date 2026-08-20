import express from 'express';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all registered users (admin only)
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
    }
    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user (admin only)
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (phone) user.phone = phone;
    if (role && ['customer', 'admin'].includes(role)) user.role = role;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -resetPasswordToken -resetPasswordExpire');

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'Server error updating user', error: error.message });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update global settings (UPI QR code, UPI ID, etc.) — admin only
// @access  Private/Admin
router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    const { upiId, upiQrCode, upiName } = req.body;
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = new Settings({ key: 'global' });
    }
    if (upiId !== undefined) settings.upiId = upiId;
    if (upiQrCode !== undefined) settings.upiQrCode = upiQrCode;
    if (upiName !== undefined) settings.upiName = upiName;
    await settings.save();
    return res.status(200).json({ success: true, message: 'Settings updated', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
