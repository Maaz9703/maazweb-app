const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/validate', protect, validateCoupon);
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
