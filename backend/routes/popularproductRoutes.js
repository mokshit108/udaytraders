const express = require('express');
const router = express.Router();
const { getPopularProducts } = require('../controllers/popularProductController');

// Route to get popular products
router.get('/popular', getPopularProducts);

module.exports = router;