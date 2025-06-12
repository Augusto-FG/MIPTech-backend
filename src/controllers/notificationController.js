const Notification = require("../models/pestNotificationModel");

const getUserNotificationsByRegion = async (req, res) => {
    try {
      const {partido_or_department} = req.query;
      if (!partido_or_department) {
          return res.status(400).json({ message: "'partido_or_department' parameter is missing " });
      } 
      //filtramos por usuario y por partido
      const filter = { 
          // la expresión regular es para que no diferencia por mayusculas o minusculas
          partido_or_department: {
              $regex: new RegExp(partido_or_department, "i")  // Elimina ^ y $ para buscar en cualquier parte
            }
          }
      const notifications = await Notification.find(filter).sort({ date: -1 }).limit(12);
      console.log('Notifications fetched correctly')
      res.status(200).json(notifications);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  };

/* Esta al final no será usada por como el front estructuró las notificaciones.
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      user: userId
    });

    if (!notification) {
      console.log("❌ Notificación no encontrada");
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    notification.read = true;
    await notification.save();

    console.log("✅ Notificación marcada como leída");
    res.status(200).json({ message: "Notificación marcada como leída", notification });
  } catch (error) {
    console.error("❌ Error al marcar notificación como leída:", error);
    res.status(500).json({ message: "Error al marcar notificación como leída" });
  }
};

*/

/* Esta al final no será usada por como el front estructuró las notificaciones.

const deleteNotification = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
  
      const notification = await Notification.findOne({
        _id: id,
        user: userId
      });
  
      if (!notification) {
        console.log("❌ Notificación no encontrada");
        return res.status(404).json({ message: "Notificación no encontrada" });
      }
  
      await notification.deleteOne();
  
      console.log("✅ Notificación eliminada correctamente");
      res.status(200).json({ message: "Notificación eliminada correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar la notificación:", error);
      res.status(500).json({ message: "Error al eliminar la notificación" });
    }
  };
  */

module.exports = {
  getUserNotificationsByRegion
};
