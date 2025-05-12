const express = require('express');
const router = express.Router();

const { calculateParameters } = require('../controllers/calculateParameters.controller');

// Cuando alguien haga POST a esta puerta, usamos el cerebro
router.post('/', calculateParameters);

module.exports = router;
