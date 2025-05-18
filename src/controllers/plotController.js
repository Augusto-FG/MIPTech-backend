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
    console.log("📥 Se recibieron datos par crear plot");
 
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
 
    console.log("🛠️ Instancia de Plot creada");
 
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

    console.log("📌 Plot ID:", plotId);
    console.log("👤 Usuario autenticado:", userId);
    console.log("🔄 Datos de actualización:", updatedData);

    const updatedPlot = await Plot.findOneAndUpdate(
      { _id: plotId, user: userId }, // Asegura que el plot pertenezca al usuario
      updatedData,
      { new: true }
    );

    if (!updatedPlot) {
      console.warn(`⚠️ Plot no encontrado o no autorizado. ID: ${plotId}, Usuario: ${userId}`);
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

    console.log("✅ Plot actualizado con éxito");

    res.status(200).json({
      message: "Plot updated successfully",
      plot: updatedPlot
    });
  } catch (error) {
    console.error("❌ Error actualizando plot:", error);
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

const getUserPlots = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("📥 Solicitando plots del usuario");
    console.log("👤 Usuario autenticado con ID:", userId);

    const userPlots = await Plot.find({ user: userId });

    if (!userPlots.length) {
      console.warn(`⚠️ No se encontraron plots para el usuario con ID: ${userId}`);
      return res.status(404).json({ message: "No plots found for this user" });
    }

    console.log(`✅ Se encontraron ${userPlots.length} plots para el usuario`);

    res.status(200).json({
      message: "User plots fetched successfully",
      plots: userPlots
    });
  } catch (error) {
    console.error("❌ Error al obtener los plots del usuario:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPlot,
  getUserPlots,
  updatePlot,
  deletePlot
};