// routes/users.js
const express = require('express');
const { registerUser,handleGoogleSignup, loginUser, handleGoogleLogin, registerPhoneNumber } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/google-signup', handleGoogleSignup,);
router.post('/login', loginUser);
router.post('/google-login', handleGoogleLogin); // Add Google login route
router.post("/register-phone", registerPhoneNumber);


module.exports = router;
