// /routes/otpRoutes.js
const express = require('express');
const { requestPasswordReset, verifyOtpAndResetPassword } = require('../controllers/otpController');

const router = express.Router();

router.post('/requestpasswordreset', requestPasswordReset);
router.post('/verifyotpresetpassword', verifyOtpAndResetPassword);

module.exports = router;