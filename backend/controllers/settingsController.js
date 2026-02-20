const Settings = require('../models/Settings');

// Get settings (single document)
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Update settings (create if missing)
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body || {};
    const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
