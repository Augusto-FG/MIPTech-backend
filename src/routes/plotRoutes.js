const express = require("express");
const router = express.Router();
const plotController = require("../controllers/plotController.js");
const { validateJwt } = require("../middlewares/authMiddleware.js");

router.post("/plot/", validateJwt, plotController.createPlot);
router.get("/plot/", validateJwt, plotController.getUserPlots);
router.put("/plot/:id", validateJwt, plotController.updatePlot);
router.delete("/plot/:id", validateJwt, plotController.deletePlot);
router.get("/plot/count", validateJwt, plotController.getPlotCountByUser);
router.patch(
    "/plot/deactivate/:id",
    validateJwt,
    plotController.deactivatePlot
);
router.patch(
    "/plot/reactivate/:id",
    validateJwt,
    plotController.reactivatePlot
);
router.get("/plotId/:id", validateJwt, plotController.getPlotById);

module.exports = router;
