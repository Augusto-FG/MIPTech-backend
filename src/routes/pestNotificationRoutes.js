const express = require("express");
const router = express.Router();
const { validateJwt  } = require("../middlewares/authMiddleware.js");
const {
  getUserNotificationsByRegion,

} = require("../controllers/notificationController.js");



router.get("/pest-notifications", validateJwt, getUserNotificationsByRegion);


module.exports = router;