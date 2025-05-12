const express = require('express');
const router = express.Router();

const { calculateParameters } = require('../controllers/calculateParameters.controller');

router.post('/', calculateParameters);

module.exports = router;
