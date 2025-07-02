const MeasurementReminder = require("../models/measurementReminderModel");
const mongoose = require("mongoose");

const buildBaseAggregation = (
    userId,
    additionalMatchStage = {},
    includeProjection = false
) => {
    const lookupStage = {
        from: "plots",
        localField: "plot",
        foreignField: "_id",
        as: "plot",
    };

    if (includeProjection) {
        lookupStage.pipeline = [
            { $match: { active: true } },
            {
                $project: {
                    plot_name: 1,
                    field_name: 1,
                    active: 1,
                },
            },
        ];
    }

    return [
        {
            $match: {
                user: mongoose.Types.ObjectId.createFromHexString(userId),
                ...additionalMatchStage,
            },
        },
        { $lookup: lookupStage },
        { $unwind: "$plot" },
        ...(includeProjection ? [] : [{ $match: { "plot.active": true } }]),
    ];
};

const getMeasurementReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 12 } = req.query;
        const reminders = await MeasurementReminder.aggregate([
            ...buildBaseAggregation(userId, {}, true),
            { $sort: { read: 1, createdAt: -1 } },
            { $limit: parseInt(limit) },
        ]);

        const [remindersCountResult, unreadCountResult] = await Promise.all([
            MeasurementReminder.aggregate([
                ...buildBaseAggregation(userId),
                { $count: "total" },
            ]),
            MeasurementReminder.aggregate([
                ...buildBaseAggregation(userId, { read: false }),
                { $count: "total" },
            ]),
        ]);
        res.status(200).json({
            reminders,
            remindersCount: remindersCountResult[0]?.total || 0,
            unreadCount: unreadCountResult[0]?.total || 0,
        });
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
