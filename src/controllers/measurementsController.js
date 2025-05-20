const Measurement = require("../models/measurementsModel");
const Campaign = require("../models/campaignModel");

// Crear una nueva medición
const createMeasurement = async (req, res) => {
  try {
    const { date, pestType, pestDensity, unit, campaign, user } = req.body;

    console.log("📥 Datos recibidos para nueva medición:", req.body);

    // Validación de campos obligatorios
    if (!date || !pestType || !pestDensity || !unit || !campaign || !user) {
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

    // Validar fecha
    const measurementDate = new Date(date);
    const currentDate = new Date();

    const campaignData = await Campaign.findById(campaign);
    if (!campaignData) {
      console.log("❌ Campaña no encontrada");
      return res.status(404).json({ message: "Campaña no encontrada" });
    }

    if (
      measurementDate < campaignData.sowingDate ||
      measurementDate > currentDate ||
      (campaignData.harvestEstimated && measurementDate > campaignData.harvestEstimated)
    ) {
      console.log("❌ Fecha fuera de los límites permitidos");
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
    console.log("✅ Medición guardada correctamente:", savedMeasurement);

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

    console.log(`🔎 Buscando mediciones para la campaña: ${campaignId}`);

    // Buscamos todas las mediciones que coincidan con el ID de campaña
    const measurements = await Measurement.find({ campaign: campaignId })
      .populate("user", "name lastname email")
      .populate("campaign", "crop variety sowingDate harvestEstimated");

    if (!measurements || measurements.length === 0) {
      console.log("⚠️ No se encontraron mediciones para esta campaña");
      return res.status(404).json({ message: "No se encontraron mediciones para esta campaña" });
    }

    console.log(`✅ Se encontraron ${measurements.length} mediciones`);
    res.status(200).json(measurements);
  } catch (error) {
    console.error("❌ Error al obtener mediciones:", error);
    res.status(500).json({ message: "Error al obtener las mediciones" });
  }
};

// Eliminar una medición
const deleteMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.params;

    console.log(`🗑️ Intentando eliminar medición con ID: ${measurementId}`);

    const deletedMeasurement = await Measurement.findByIdAndDelete(measurementId);

    if (!deletedMeasurement) {
      console.log("❌ Medición no encontrada");
      return res.status(404).json({ message: "Medición no encontrada" });
    }

    console.log("✅ Medición eliminada correctamente");
    res.status(200).json({ message: "Medición eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar medición:", error);
    res.status(500).json({ message: "Error al eliminar la medición" });
  }
};

module.exports = {
  createMeasurement,
  getMeasurementsByCampaign,
  deleteMeasurement
};