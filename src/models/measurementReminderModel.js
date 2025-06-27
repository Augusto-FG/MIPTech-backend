const mongoose = require("mongoose");

const measurementReminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastMeasurementDate: Date,
        message: { type: String, required: true },
        plot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plot",
            required: true,
        },
        read: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "MeasurementReminder",
    measurementReminderSchema
);
