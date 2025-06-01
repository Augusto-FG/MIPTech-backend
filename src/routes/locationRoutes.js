const express = require("express");
const router = express.Router();
const {
  getProvincias,
  getDepartamentosByProvincia,
  getLocalidadesByDepartamento
} = require("../controllers/locationController");

// GET /location/provincias
router.get("/provincias", getProvincias);

// GET /location/provincia/:provincia/departamentos
router.get("/provincia/departamentos/:provincia", getDepartamentosByProvincia);

// GET /location/provincia/:provincia/departamento/:departamento/localidades
router.get("/provincia/:provincia/departamento/:departamento/localidades", getLocalidadesByDepartamento);

module.exports = router;