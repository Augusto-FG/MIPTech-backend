const express = require("express");
const router = express.Router();
const {
    getMeasurementReminders,
    markReminderAsRead,
    markAllRemindersAsRead,
    deleteReminder,
} = require("../controllers/measurementReminderController.js");
const { validateJwt } = require("../middlewares/authMiddleware.js");

router.get("/measurement-reminders", validateJwt, getMeasurementReminders);
router.patch(
    "/measurement-reminders/:reminderId/read",
    validateJwt,
    markReminderAsRead
);
router.patch(
    "/measurement-reminders/read-all",
    validateJwt,
    markAllRemindersAsRead
);
router.delete(
    "/measurement-reminders/:reminderId",
    validateJwt,
    deleteReminder
);

module.exports = router;
