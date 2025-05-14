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

module.exports = {
  createPlot,
};
