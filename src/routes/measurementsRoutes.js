const express = require("express");
const router = express.Router();
const { validateJwt  } = require("../middlewares/authMiddleware.js");
const {
  createMeasurement,
  getMeasurementsByCampaign,
  deleteMeasurement,
  updateMeasurement
} = require("../controllers/measurementsController");


// Crear una medición
router.post("/measurements", validateJwt, createMeasurement);

// Obtener mediciones por campaña
router.get("/measurements/campaign/:campaignId", validateJwt, getMeasurementsByCampaign);

// Eliminar una medición por ID
router.delete("/measurements/:measurementId", validateJwt, deleteMeasurement);

// Actualizar una medición por ID. Es necesario ser el dueño de la medición.
router.put("/measurements/:id", validateJwt, updateMeasurement);

module.exports = router;