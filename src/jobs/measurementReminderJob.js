const cron = require("node-cron");
const Measurement = require("../models/measurementsModel");
const Campaign = require("../models/campaignModel");
const MeasurementReminder = require("../models/measurementReminderModel");

let io;
let connectedUsers;

const initializeSocket = (app) => {
    if (!app) {
        console.warn(
            "App no proporcionada, las notificaciones por socket no estarán disponibles"
        );
        return;
    }
    try {
        io = app.get("io");
        connectedUsers = app.get("connectedUsers");
        console.log(
            "Socket inicializado correctamente en measurementReminderJob"
        );
    } catch (error) {
        console.error("Error al inicializar socket:", error);
    }
};

module.exports = function scheduleMeasurementReminderJob(app) {
    initializeSocket(app);
    measurementReminderCheck();

    cron.schedule("0 8 * * *", measurementReminderCheck);
};

const sendNotification = async (userId, reminder) => {
    await reminder.save();
    if (connectedUsers && connectedUsers.has(userId.toString())) {
        const socket = connectedUsers.get(userId);
        socket.emit("measurementReminder", reminder);
    }
    await reminder.save();
};

const hasRecentReminder = async (userId, plotId) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingReminder = await MeasurementReminder.findOne({
        user: userId,
        plot: plotId,
        createdAt: { $gte: sevenDaysAgo },
    });
    return !!existingReminder;
};

const measurementReminderCheck = async () => {
    const now = new Date();
    console.log(
        `⏰ Measurement reminder cron running at ${new Date().toLocaleTimeString()}`
    );
    const activeCampaigns = await Campaign.find({
        is_active: true,
        sowing_date: { $lte: now },
        harvest_date: { $gte: now },
    }).populate("plot");
    console.log(
        `📊 Found ${activeCampaigns.length} active campaigns for measurement reminders.`
    );

    for (const campaign of activeCampaigns) {
        const lastMeasurement = await Measurement.findOne({
            campaign: campaign._id,
        }).sort({ date: -1 });

        if (!lastMeasurement) {
            // Verificar si ya existe un recordatorio para este lote en los últimos 7 días
            if (
                !(await hasRecentReminder(campaign.user, campaign.plot)) &&
                campaign.plot.active
            ) {
                try {
                    const newReminder = new MeasurementReminder({
                        user: campaign.user,
                        plot: campaign.plot,
                        lastMeasurementDate: null,
                        message: `Todavía no tomaste ningún registro de plagas para el lote ${campaign.plot.plot_name} del campo ${campaign.plot.field_name}.`,
                        read: false,
                    });
                    await sendNotification(
                        campaign.user.toString(),
                        newReminder
                    );
                } catch (error) {
                    console.error(
                        `Error al crear recordatorio para campaña ${campaign}:`,
                        error
                    );
                }
            }
            continue;
        }

        const lastMeasurementDate = new Date(lastMeasurement.date);
        const daysSinceLastMeasurement = Math.floor(
            (now - lastMeasurementDate) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastMeasurement >= 7) {
            try {
                if (
                    !(await hasRecentReminder(campaign.user, campaign.plot)) &&
                    campaign.plot.active
                ) {
                    try {
                        const newReminder = new MeasurementReminder({
                            user: campaign.user,
                            plot: campaign.plot,
                            lastMeasurementDate: lastMeasurementDate,
                            message: `Hace ${daysSinceLastMeasurement} días que no tomás un registro de plagas para el lote ${campaign.plot.plot_name} del campo ${campaign.plot.field_name}.`,
                            read: false,
                        });
                        await sendNotification(
                            campaign.user.toString(),
                            newReminder
                        );
                    } catch (error) {
                        console.error(
                            `Error al crear recordatorio para campaña ${campaign}:`,
                            error
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `Error al procesar campaña ${campaign._id}:`,
                    error
                );
            }
        }
    }
    console.log(
        `📊 Measurement reminder cron completed at ${new Date().toLocaleTimeString()}`
    );
};
