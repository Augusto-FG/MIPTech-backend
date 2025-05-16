const express = require('express');
const router = express.Router();
const { validateJwt } = require('../middlewares/authMiddleware.js');
const { calculateParameters } = require('../controllers/EconomicParametersController.js');

router.post('/', validateJwt, calculateParameters);

module.exports = router;
