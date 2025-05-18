const express = require('express');
const router = express.Router();
const { validateJwt } = require('../middlewares/authMiddleware.js');
const { calculateParameters } = require('../controllers/EconomicParametersController.js');

router.post('/economic-parameters/', validateJwt, calculateParameters);

module.exports = router;
