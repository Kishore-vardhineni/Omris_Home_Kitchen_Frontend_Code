import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    upiId: {
      type: String,
      default: '',
    },
    upiQrCode: {
      type: String, // base64 data URL or hosted image URL
      default: '',
    },
    upiName: {
      type: String,
      default: 'Omris Home Kitchen',
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
