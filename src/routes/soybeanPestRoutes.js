const express = require('express');
const router = express.Router();
const { getSoybeanPests } = require('../controllers/soybeanPests.js');
const { validateJwt } = require('../middlewares/authMiddleware.js');

router.get('/soybean-pests',validateJwt, getSoybeanPests);

module.exports = router;
