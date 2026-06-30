// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');
const savePaymentController = require('../controllers/savePaymentController');
const authenticateToken = require('../middlewares/authMiddleware');
// Route for payment verification
router.post('/verify-payment',authenticateToken, verifyPayment);
// Route to save payment details
router.post('/save-payment',authenticateToken, savePaymentController.savePayment);

module.exports = router;