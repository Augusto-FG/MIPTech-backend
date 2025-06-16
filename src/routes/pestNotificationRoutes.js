const express = require("express");
const router = express.Router();
const { validateJwt  } = require("../middlewares/authMiddleware.js");
const { getNotificationsByPlot } = require("../controllers/notificationController.js");



router.get("/pest-notifications/:plotId", validateJwt, getNotificationsByPlot);


module.exports = router;