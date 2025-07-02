const Notification = require("../models/pestNotificationModel");
const Plot = require("../models/plotModel");

const getNotificationsByPlot = async (req, res) => {
    try {
        const { plotId } = req.params;

        if (!plotId) {
            return res
                .status(400)
                .json({
                    message:
                        "'plotId' parameter is required as a query parameter.",
                });
        }

        // Buscamos la región asociada al plot
        const plot = await Plot.findOne({ _id: plotId, active: true });
        if (!plot || !plot.partido_or_department) {
            return res.status(404).json({ message: "Plot not found." });
        }

        if (plot.user.toString() !== req.user.id) {
            return res
                .status(403)
                .json({
                    message:
                        "The requester user is not the user associated to this plot.",
                });
        }

        const partido_or_department = plot.partido_or_department;

        // Buscamos las últimas 12 notificaciones de ese partido
        const filter = {
            partido_or_department: {
                $regex: new RegExp(partido_or_department, "i"),
                //esta expresión regular es para que no sea sensible a mayúsculas y minúsculas (por las dudas).
            },
        };

        const notifications = await Notification.find(filter)
            .sort({ date: -1 }) //de la más reciente a la más antigua.
            .limit(12);

        console.log("Notifications found for this location.");
        res.status(200).json(notifications);
    } catch (error) {
        console.error(
            "Error fetching the notifications for this location:",
            error
        );
        res.status(500).json({
            message: "Error fetching the notifications for this location.",
        });
    }
};

module.exports = {
    getNotificationsByPlot,
};
