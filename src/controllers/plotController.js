const Plot = require("../models/plotModel.js");

const createPlot = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      field_name,
      plot_name,
      surface,
      province,
      partido_or_department,
      localty
    } = req.body;

    // Log de los datos entrantes
    console.log("📥 Datos recibidos para crear plot:", {
      field_name,
      plot_name,
      surface,
      province,
      partido_or_department,
      localty
    });

    // Log de autenticación
    console.log("🔐 Usuario autenticado con ID:", userId);

    // Validación básica
    if (!field_name || !plot_name || !surface) {
      console.warn("⚠️ Faltan campos obligatorios");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Crear instancia del plot
    const newPlot = new Plot({
      user: userId,
      field_name,
      plot_name,
      surface,
      province,
      partido_or_department,
      localty,
    });

    console.log("🛠️ Instancia de Plot creada:", newPlot);

    // Guardar en la base de datos
    await newPlot.save();

    console.log("✅ Plot guardado exitosamente en la BD");

    // Respuesta al cliente
    res.status(201).json({
      message: "Plot created successfully",
      plot: newPlot,
    });
  } catch (error) {
    console.error("❌ Error creando plot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePlot = async (req, res) => {
  try {
    const plotId = req.params.id;
    const userId = req.user.id;
    const updatedData = req.body;

    const updatedPlot = await Plot.findOneAndUpdate(
      { _id: plotId, user: userId }, // Asegura que el plot pertenezca al usuario
      updatedData,
      { new: true }
    );

    if (!updatedPlot) {
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

    res.status(200).json({
      message: "Plot updated successfully",
      plot: updatedPlot
    });
  } catch (error) {
    console.error("❌ Error updating plot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePlot = async (req, res) => {
  const plotId = req.params.id;
  console.log(`🗑️ Solicitando eliminación para plot con id: ${plotId}`);

  try {
    const plot = await Plot.findByIdAndDelete(plotId);

    if (!plot) {
      console.warn(`⚠️ Plot con id ${plotId} no encontrado`);
      return res.status(404).json({ mensaje: 'Plot no encontrado' });
    }

    console.log(`✅ Plot eliminado exitosamente: ${JSON.stringify(plot)}`);
    res.status(200).json({ mensaje: 'Plot eliminado exitosamente' });
  } catch (error) {
    console.error(`❌ Error al eliminar el plot: ${error.message}`);
    res.status(500).json({ error: 'Error al eliminar el plot' });
  }
};

module.exports = {
  createPlot,
  updatePlot,
  deletePlot
};