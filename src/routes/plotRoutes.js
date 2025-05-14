const express = require('express');
const router = express.Router();
const plotController = require("../controllers/plotController.js"); 
const { validateJwt  } = require("../middlewares/authMiddleware.js");
    

router.post("/", validateJwt , plotController.createPlot);

module.exports = router;
