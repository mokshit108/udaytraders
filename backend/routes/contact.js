const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

// Handle contact form submission
router.post('/submit', submitContactForm);

module.exports = router;
