const express = require('express');
const { validateCoupon } = require('../controllers/couponController');

const router = express.Router();

// Validate coupon code
router.post('/validate-coupon', validateCoupon);

module.exports = router;
