const express = require('express');
const router = express.Router();
const { getUsers, getStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', protect, admin, getUsers);
router.get('/stats', protect, admin, getStats);

module.exports = router;
