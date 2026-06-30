// routes/users.js
const express = require('express');
const { importExcelData } = require('../controllers/importController');

const router = express.Router();

router.post('/data/:table', importExcelData);

module.exports = router;
