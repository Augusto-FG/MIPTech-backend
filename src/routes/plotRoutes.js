const express = require('express');
const router = express.Router();
const plotController = require("../controllers/plotController.js");
const { validateJwt  } = require("../middlewares/authMiddleware.js");
 
 
router.post("/", validateJwt , plotController.createPlot);
router.put("/:id", validateJwt, plotController.updatePlot);
router.delete("/:id", validateJwt, plotController.deletePlot);
 
module.exports = router;