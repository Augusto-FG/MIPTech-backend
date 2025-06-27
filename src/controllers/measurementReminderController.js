const MeasurementReminder = require("../models/measurementReminderModel");

const getMeasurementReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 12 } = req.query;
        const reminders = await MeasurementReminder.find({ user: userId })
            .populate("plot", "plot_name field_name")
            .sort({ read: 1, createdAt: -1 })
            .limit(limit);

        const remindersCount = await MeasurementReminder.countDocuments({
            user: userId,
        });
        const unreadCount = await MeasurementReminder.countDocuments({
            user: userId,
            read: false,
        });
        res.status(200).json({ reminders, remindersCount, unreadCount });
    } catch (error) {
        console.error("Error fetching measurement reminders:", error);
        res.status(500).json({
            message: "Error fetching measurement reminders.",
        });
    }
};

const markReminderAsRead = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await MeasurementReminder.findOneAndUpdate(
            { _id: reminderId, user: userId },
            { read: true },
            { new: true }
        );
        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found." });
        }
        res.status(200).json(reminder);
    } catch (error) {
        console.error("Error marking reminder as read:", error);
        res.status(500).json({
            message: "Error marking reminder as read.",
        });
    }
};

const markAllRemindersAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await MeasurementReminder.updateMany(
            { user: userId, read: false },
            { read: true }
        );

        res.status(200).json({
            message: "All unread reminders marked as read.",
        });
    } catch (error) {
        console.error("Error marking all reminders as read:", error);
        res.status(500).json({
            message: "Error marking all reminders as read.",
        });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await MeasurementReminder.findOneAndDelete({
            _id: reminderId,
            user: userId,
        });
        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found." });
        }
        res.status(200).json({ message: "Reminder deleted successfully." });
    } catch (error) {
        console.error("Error deleting reminder:", error);
        res.status(500).json({
            message: "Error deleting reminder.",
        });
    }
};

module.exports = {
    getMeasurementReminders,
    markReminderAsRead,
    markAllRemindersAsRead,
    deleteReminder,
};
