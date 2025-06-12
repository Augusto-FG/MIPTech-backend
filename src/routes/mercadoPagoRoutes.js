const express = require('express');
const router = express.Router();
const { crearPreferencia } = require('../controllers/mercadoPagoController');
const { validateJwt  } = require("../middlewares/authMiddleware.js");

router.post('/mercadopago', validateJwt, crearPreferencia);

module.exports = router;
