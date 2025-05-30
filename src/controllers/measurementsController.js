const Measurement = require("../models/measurementsModel");
const Campaign = require("../models/campaignModel");
const Plot = require("../models/plotModel");

// Crear una nueva medición
const createMeasurement = async (req, res) => {
  try {
    const { date, pestType, pestDensity, unit, campaign } = req.body;
    const user = req.user.id;


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

    const newMeasurement = new Measurement({
      date: measurementDate,
      pestType,
      pestDensity,
      unit,
      campaign,
      user
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

module.exports = {
  createMeasurement,
  getMeasurementsByCampaign,
  deleteMeasurement
};