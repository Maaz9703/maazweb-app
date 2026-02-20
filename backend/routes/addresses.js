const express = require('express');
const router = express.Router();
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getAddresses).post(protect, createAddress);
router.route('/:id').put(protect, updateAddress).delete(protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

module.exports = router;
