const express = require('express');
const router = express.Router();
const { validateJwt } = require('../middlewares/authMiddleware.js');
const controllers = require('../controllers/EconomicParametersController.js');

router.post   ('/economic-parameters',     validateJwt, controllers.calculateParameters);
router.put    ('/economic-parameters/:id', validateJwt, controllers.updateParameters);
router.get    ('/economic-parameters',     validateJwt, controllers.getAllParametersByUser);
router.get    ('/economic-parameters/:id', validateJwt, controllers.getParameterById);
router.delete ('/economic-parameters/:id', validateJwt, controllers.deleteParameter);

module.exports = router;
