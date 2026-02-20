/**
 * Seed admin user - run: node scripts/seedAdmin.js
 * Creates admin user if not exists: admin@example.com / admin123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();
  const email = 'admin@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists');
      process.exit(0);
      return;
    }
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing user to admin');
    process.exit(0);
    return;
  }
  await User.create({
    name: 'Admin',
    email,
    password: 'admin123',
    role: 'admin',
  });
  console.log('Admin user created: admin@example.com / admin123');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
