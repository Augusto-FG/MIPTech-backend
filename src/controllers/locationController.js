const axios = require("axios");

// Obtener todas las provincias
const getProvincias = async (req, res) => {
  try {
    const response = await axios.get("https://apis.datos.gob.ar/georef/api/provincias");
    const provincias = response.data.provincias;
    res.status(200).json(provincias);
  } catch (error) {
    console.error("❌ Error al obtener provincias:", error.message);
    res.status(500).json({ message: "Error al obtener provincias" });
  }
};

// Obtener departamentos de una provincia
const getDepartamentosByProvincia = async (req, res) => {
  try {
    const { provincia } = req.params;
    const response = await axios.get(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(provincia.toLowerCase())}&max=4000`);
    const departamentos = response.data.departamentos;
    res.status(200).json(departamentos);
  } catch (error) {
    console.error("❌ Error al obtener departamentos:", error.message);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
};

// Obtener localidades por provincia y departamento
const getLocalidadesByDepartamento = async (req, res) => {
  try {
    const { provincia, departamento } = req.params;
    const response = await axios.get(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(provincia.toLowerCase())}&departamento=${encodeURIComponent(departamento)}&max=4000`);
    const localidades = response.data.localidades;
    res.status(200).json(localidades);
  } catch (error) {
    console.error("❌ Error al obtener localidades:", error.message);
    res.status(500).json({ message: "Error al obtener localidades" });
  }
};

module.exports = {
  getProvincias,
  getDepartamentosByProvincia,
  getLocalidadesByDepartamento
};