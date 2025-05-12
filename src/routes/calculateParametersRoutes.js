const express = require('express');
const router = express.Router();

const { calculateParameters } = require('../controllers/EconomicParametersController.js');

router.post('/', calculateParameters);

module.exports = router;
