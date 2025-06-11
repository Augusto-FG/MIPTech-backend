const Measurement = require("../models/measurementsModel");
const Campaign = require("../models/campaignModel");
const Plot = require("../models/plotModel");
const Notification = require("../models/pestNotificationModel");


// Crear una nueva medición
const createMeasurement = async (req, res) => {
  try {
    const { date, pestType, pestDensity, unit, campaign } = req.body;
    const user = req.user.id;
    const notifyNearbyProducers = 
      req.body.notifyNearbyProducers === true ||
      req.body.notifyNearbyProducers === 'true';
    // Validación de campos obligatorios
    if (!date || !pestType || !pestDensity || !unit || !campaign) { 
      console.log("❌ Faltan campos obligatorios");
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validar unidad
    const validUnits = ["insecto/metro lineal", "insecto/foliolo", "insecto/hoja"];
    if (!validUnits.includes(unit)) {
      console.log("❌ Unidad no válida");
      return res.status(400).json({ message: "Unidad no válida" });
    }

    // Validar densidad
    if (pestDensity <= 0) {
      console.log("❌ Densidad debe ser mayor a 0");
      return res.status(400).json({ message: "La densidad debe ser mayor a 0" });
    }
    
    // Buscamos la campaña y populamos el plot
    const campaignData = await Campaign.findById(campaign).populate("plot");
    if (!campaignData) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }

    // Validar que el plot asociado esté activo
    if (!campaignData.plot || campaignData.plot.active === false) {
      return res.status(403).json({ message: "No se pueden crear mediciones para un lote inactivo" });
    }

    // Validar fecha
    const measurementDate = new Date(date);
    const currentDate = new Date();

    if (
      measurementDate < campaignData.sowing_date ||
      measurementDate > currentDate || measurementDate > campaignData.harvest_date
    ) {
      return res.status(400).json({ message: "Fecha fuera de los límites permitidos" });
    }
    // Comprobamos si corresponde notificar a productores
      if (notifyNearbyProducers) {
        const nearbyPlots = await Plot.find({
          partido_or_department: campaignData.plot.partido_or_department, //Búsqueda de lotes en el mismo partido.
          active: true,
        });

        const notifiedUsers = new Set(); //usamos un set ya que si el mismo usuario
        // tiene más de un lote en el partido, buscamos enviarle una sola notificación.
        for (const plot of nearbyPlots) {
          notifiedUsers.add(plot.user.toString());
        }

        for (const userId of notifiedUsers) {
          await Notification.create({
            notifiedUser: userId,
            title: "Alerta de plaga cercana",
            message: `¡Alerta! Se reportó la presencia de ${pestType} en un lote cercano en este partido (${campaignData.plot.partido_or_department}).`,
            pestType,
            pestDensity,
            densityUnit: unit,
            date: measurementDate,
            partido_or_department: campaignData.plot.partido_or_department
          });
        }
      }
    const newMeasurement = new Measurement({
      date: measurementDate,
      pestType,
      pestDensity,
      unit,
      campaign,
      user,
      notifyNearbyProducers
    });

    const savedMeasurement = await newMeasurement.save();
    console.log("✅ Medición guardada correctamente");

    res.status(201).json(savedMeasurement);
    } catch (error) {
    console.error("❌ Error al guardar medición:", error);
    res.status(500).json({ message: "Error al guardar la medición" });
  }
};

// Obtener todas las mediciones de una campaña especifica
const getMeasurementsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    console.log(`🔎 Buscando mediciones para la campaña: ${campaignId}, página ${page}`);

    // Contar total de mediciones para la campaña (para paginación)
    const totalMeasurements = await Measurement.countDocuments({ campaign: campaignId });

    const measurements = await Measurement.find({ campaign: campaignId })
      .select("-user") // Evitamos enviar los datos del usuario
      .populate("campaign", "crop variety sowing_date harvest_date")
      .skip(skip)
      .limit(limit);

    if (!measurements || measurements.length === 0) {
      console.log("⚠️ No se encontraron mediciones para esta campaña");
      return res.status(404).json({ message: "No se encontraron mediciones para esta campaña" });
    }

    const totalPages = Math.ceil(totalMeasurements / limit);

    console.log(`✅ Página ${page}: ${measurements.length} mediciones encontradas`);

    res.status(200).json({
      measurements,
      pagination: {
        total: totalMeasurements,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("❌ Error al obtener mediciones:", error);
    res.status(500).json({ message: "Error al obtener las mediciones" });
  }
};

// Eliminar una medición
const deleteMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.params;

    console.log(`🗑️ Attempting to delete measurement with ID: ${measurementId}`);

    const measurement = await Measurement.findById(measurementId).populate({
      path: "campaign",
      populate: { path: "plot" }
    });

    if (!measurement) {
      console.log("❌ Measurement not found");
      return res.status(404).json({ message: "Measurement not found" });
    }

    if (!measurement.campaign.plot || measurement.campaign.plot.active === false) {
      console.log("🚫 Cannot delete measurements from an inactive plot");
      return res.status(403).json({ message: "Cannot delete measurements from an inactive plot" });
    }

    await Measurement.findByIdAndDelete(measurementId);

    console.log("✅ Measurement successfully deleted");
    res.status(200).json({ message: "Measurement successfully deleted" });
  } catch (error) {
    console.error("❌ Error deleting measurement:", error);
    res.status(500).json({ message: "Error deleting the measurement" });
  }
};

// Actualizar una medición
const updateMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, pestType, pestDensity, unit, campaign } = req.body;
    const user = req.user.id;
    const notifyNearbyProducers = 
      req.body.notifyNearbyProducers === true ||
      req.body.notifyNearbyProducers === 'true';

    // Validación de campos obligatorios
    if (!date || !pestType || !pestDensity || !unit || !campaign) {
      console.log("❌ Faltan campos obligatorios");
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validar unidad
    const validUnits = ["insecto/metro lineal", "insecto/foliolo", "insecto/hoja"];
    if (!validUnits.includes(unit)) {
      console.log("❌ Unidad no válida");
      return res.status(400).json({ message: "Unidad no válida" });
    }

    // Validar densidad
    if (pestDensity <= 0) {
      console.log("❌ Densidad debe ser mayor a 0");
      return res.status(400).json({ message: "La densidad debe ser mayor a 0" });
    }

    // Buscar la medición
    const measurement = await Measurement.findById(id).populate({
      path: 'campaign',
      populate: { path: 'plot' }
    });
    if (!measurement) {
      return res.status(404).json({ message: "Medición no encontrada" });
    }
    // Validar que el usuario que intenta modificarlo sea el mismo que la creo.
    if (measurement.user.toString() !== user) {
      console.log("🚫 Usuario no autorizado para modificar esta medición");
      return res.status(403).json({ message: "No autorizado para modificar esta medición" });
    }

    // Validar que la campaña y el plot existan y estén activos
    const campaignData = measurement.campaign;
    if (!campaignData) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }
    if (!campaignData.plot || campaignData.plot.active === false) {
      return res.status(403).json({ message: "No se pueden actualizar mediciones para un lote inactivo" });
    }

    // Validar fecha
    const measurementDate = new Date(date);
    const currentDate = new Date();
    if (
      measurementDate < campaignData.sowing_date ||
      measurementDate > currentDate ||
      measurementDate > campaignData.harvest_date
    ) {
      return res.status(400).json({ message: "Fecha fuera de los límites permitidos" });
    }

    // Notificar a productores cercanos si corresponde
    //Aca nos fijamos en que esté en true notifyNearbyProducers
    //Pero también en que anteriormente no estuviera en true, ya que en ese caso
    //ya le habia enviado previamente la notificación (evitamos spam, 
    //porque si no, si modificaramos el mismo record 50 veces,
    //le mandariamos 50 notificaciones a cada productor vecino). 
    if (notifyNearbyProducers && !measurement.notifyNearbyProducers) {
      const nearbyPlots = await Plot.find({
        partido_or_department: campaignData.plot.partido_or_department,
        active: true,
      });

      const notifiedUsers = new Set();
      for (const plot of nearbyPlots) {
        notifiedUsers.add(plot.user.toString());
      }

      for (const userId of notifiedUsers) {
        await Notification.create({
          user: userId,
          title: "Alerta de plaga cercana",
          message: `¡Alerta! Se reportó la presencia de ${pestType} en un lote cercano (${campaignData.plot.field_name}).`,
          pestType,
          pestDensity,
          densityUnit: unit,
          date: measurementDate,
          partido_or_department: campaignData.plot.partido_or_department
        });
      }
    
    }

    // Actualizar la medición
    measurement.date = measurementDate;
    measurement.pestType = pestType;
    measurement.pestDensity = pestDensity;
    measurement.unit = unit;
    measurement.campaign = campaign;
    measurement.notifyNearbyProducers = notifyNearbyProducers;

    const updatedMeasurement = await measurement.save();
    console.log("✅ Medición actualizada correctamente");

    res.status(200).json(updatedMeasurement);
  } catch (error) {
    console.error("❌ Error al actualizar la medición:", error);
    res.status(500).json({ message: "Error al actualizar la medición" });
  }
};


module.exports = {
  createMeasurement,
  getMeasurementsByCampaign,
  deleteMeasurement,
  updateMeasurement
};