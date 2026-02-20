const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Shofy' },
    storeDescription: { type: String, default: 'Your trusted e-commerce platform' },
    enableEmailNotifications: { type: Boolean, default: true },
    notifications: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
