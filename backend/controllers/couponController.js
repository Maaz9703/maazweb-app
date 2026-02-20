const Coupon = require('../models/Coupon');

/**
 * @desc    Validate coupon
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon limit reached' });
    }

    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, orderTotal);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount,
        finalAmount: orderTotal - discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { validateCoupon, getCoupons, createCoupon, deleteCoupon };
