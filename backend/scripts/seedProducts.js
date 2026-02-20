/**
 * Seed sample products - run: node scripts/seedProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const products = [
  { title: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery', price: 149.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', stock: 50, category: 'Electronics' },
  { title: 'Smart Watch', description: 'Fitness tracker with heart rate and GPS', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', stock: 30, category: 'Electronics' },
  { title: 'Running Shoes', description: 'Lightweight athletic shoes for running', price: 89.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', stock: 100, category: 'Footwear' },
  { title: 'Leather Wallet', description: 'Handcrafted genuine leather wallet', price: 49.99, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', stock: 75, category: 'Accessories' },
  { title: 'Cotton T-Shirt', description: '100% organic cotton t-shirt', price: 24.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', stock: 200, category: 'Clothing' },
];

const seed = async () => {
  await connectDB();
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('Products already exist, skipping seed');
    process.exit(0);
    return;
  }
  await Product.insertMany(products);
  console.log(`${products.length} products seeded`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
