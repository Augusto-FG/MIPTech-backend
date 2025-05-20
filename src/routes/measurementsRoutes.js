const express = require("express");
const router = express.Router();
const { validateJwt  } = require("../middlewares/authMiddleware.js");
const {
  createMeasurement,
  getMeasurementsByCampaign,
  deleteMeasurement
} = require("../controllers/measurementsController");

console.log("✅ measurementsRoutes.js cargado correctamente");

// Crear una medición
router.post("/measurements", validateJwt, createMeasurement);

// Obtener mediciones por campaña
router.get("/measurements/campaign/:campaignId", validateJwt, getMeasurementsByCampaign);

// Eliminar una medición por ID
router.delete("/measurements/:measurementId", validateJwt, deleteMeasurement);

module.exports = router;