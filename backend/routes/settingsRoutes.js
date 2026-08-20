import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get global settings (public - needed for checkout QR code)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      // Return defaults if not yet configured
      settings = { upiId: '', upiQrCode: '', upiName: 'Omris Home Kitchen' };
    }
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
