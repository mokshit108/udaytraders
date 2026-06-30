const express = require('express');
const { getAllProductsDetails } = require('../controllers/productDetailsController');

const router = express.Router();

// Route to get all products and categories
router.get('/', getAllProductsDetails);

module.exports = router;
