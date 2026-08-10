import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { name: { $regex: /Gude veeranya/i } },
      { $set: { role: 'admin' } }
    );
    
    console.log('Update result:', result);

    const users = await User.find({ name: { $regex: /Gude veeranya/i } });
    console.log('Updated users:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
