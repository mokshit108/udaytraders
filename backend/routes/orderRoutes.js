const express = require('express');
const { createOrder, getUserDetails } = require('../controllers/orderController');

const router = express.Router();

// Route to handle creating a new order
router.get('/form-details/:userId', getUserDetails);
router.post('/', createOrder);

module.exports = router;
