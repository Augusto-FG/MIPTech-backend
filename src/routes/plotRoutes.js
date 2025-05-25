const express = require('express');
const router = express.Router();
const plotController = require("../controllers/plotController.js");
const { validateJwt  } = require("../middlewares/authMiddleware.js");
 
 
router.post("/plot/", validateJwt , plotController.createPlot);
router.get("/plot/", validateJwt , plotController.getUserPlots);
router.put("/plot/:id", validateJwt, plotController.updatePlot);
router.delete("/plot/:id", validateJwt, plotController.deletePlot);
router.get('/plot/count', validateJwt, plotController.getPlotCountByUser);

 
module.exports = router;