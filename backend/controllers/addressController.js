const Address = require('../models/Address');

/**
 * @desc    Get user addresses
 * @route   GET /api/addresses
 * @access  Private
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort('-isDefault');
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create address
 * @route   POST /api/addresses
 * @access  Private
 */
const createAddress = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const address = await Address.create(req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set default address
 * @route   PUT /api/addresses/:id/default
 * @access  Private
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    address.isDefault = true;
    await address.save();

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
