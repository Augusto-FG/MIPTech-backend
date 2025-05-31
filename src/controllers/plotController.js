const Plot = require("../models/plotModel.js");
const User = require('../models/userModel');

const getPlotCountByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Plot.countDocuments({ user: userId });

    res.status(200).json({
      message: "User's plot count",
      count: count,
    });
  } catch (error) {
    console.error("❌ Error while counting plots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createPlot = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      field_name,
      plot_name,
      surface,
      province,
      partido_or_department,
      locality
    } = req.body;

    console.log("📥 Received data to create plot");
    console.log("🔐 Authenticated user ID:", userId);

    // ✅ Required fields validation
    if (!field_name || !plot_name || surface === undefined) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Type validation
    if (typeof field_name !== 'string' || typeof plot_name !== 'string') {
      return res.status(400).json({ message: "Field name and plot name must be strings" });
    }

    if (typeof surface !== 'number') {
      return res.status(400).json({ message: "Surface must be a number" });
    }

    // ✅ Surface must be greater than 0
    if (surface <= 0) {
      return res.status(400).json({ message: "Surface must be greater than 0" });
    }

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Unique plot name validation within the same field per user
    const existingPlot = await Plot.findOne({
      user: userId,
      field_name: field_name,
      plot_name: plot_name
    });

    if (existingPlot) {
      return res.status(400).json({
        message: "A plot with that name already exists in this field"
      });
    }

    // ✅ Membership and plot limit validation
    const plotCount = await Plot.countDocuments({ user: userId });
    console.log(`📊 User currently has ${plotCount} plots`);

    if (!user.hasMembership && plotCount >= 8) {
      console.warn("🚫 Free user reached the limit of 8 plots");
      return res.status(403).json({
        message: "Plot limit reached for free users. Upgrade your membership to add more plots."
      });
    }

    // ✅ Create new plot
    const newPlot = new Plot({
      user: userId,
      field_name,
      plot_name,
      surface,
      province,
      partido_or_department,
      locality,
      active:true // Por defecto, el lote está activo
    });

    await newPlot.save();
    console.log("✅ Plot successfully saved to the database");

    res.status(201).json({
      message: "Plot created successfully",
      plot: newPlot,
    });

  } catch (error) {
    console.error("❌ Error creating plot:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 
const updatePlot = async (req, res) => {
  try {
    const plotId = req.params.id;
    const userId = req.user.id;
    const updatedData = req.body;

    console.log("📌 Plot ID:", plotId);
    console.log("👤 Authenticated user ID:", userId);
    console.log("🔄 Update data:", updatedData);

    // Buscar el lote y verificar si es del usuario y está activo
    const plot = await Plot.findOne({ _id: plotId, user: userId });

    if (!plot) {
      console.warn(`⚠️ Plot not found or not authorized. ID: ${plotId}, User: ${userId}`);
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

    if (!plot.active) {
      console.warn(`❌ Attempt to update an inactive plot. ID: ${plotId}`);
      return res.status(403).json({ message: "Cannot update an inactive plot" });
    }

    // Actualizar el lote
    const updatedPlot = await Plot.findByIdAndUpdate(plotId, updatedData, { new: true });

    console.log("✅ Plot updated successfully");

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
  console.log(`🗑️ Request to delete plot with ID: ${plotId}`);

  try {
    const plot = await Plot.findByIdAndDelete(plotId);

    if (!plot) {
      console.warn(`⚠️ Plot with ID ${plotId} not found`);
      return res.status(404).json({ message: 'Plot not found' });
    }

    console.log(`✅ Plot successfully deleted: ${JSON.stringify(plot)}`);
    res.status(200).json({ message: 'Plot deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting plot: ${error.message}`);
    res.status(500).json({ error: 'Error deleting plot' });
  }
};

const getUserPlots = async (req, res) => {
  try {
    const userId = req.user.id;

    // Paginar si es necesario
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Obtener todos los lotes del usuario (activos e inactivos)
    const allUserPlots = await Plot.find({ user: userId });

    // Solo los activos (para retornar en el campo "plots")
    const activePlots = allUserPlots.filter(p => p.active);

    const paginatedActivePlots = activePlots.slice(skip, skip + limit);
    const totalPages = Math.ceil(activePlots.length / limit);

    // Calcular el resumen
    const total_area = activePlots.reduce((sum, plot) => sum + (plot.surface || 0), 0);
    const plots_with_active_campaign = activePlots.filter(plot => plot.current_campaign !== null).length;
    const plots_without_active_campaign = activePlots.length - plots_with_active_campaign;
    const has_inactive_plots = allUserPlots.some(p => !p.active);

    res.status(200).json({
      message: "Active user plots fetched successfully",
      plots: paginatedActivePlots,
      current_page: page,
      total_pages: totalPages,
      summary: {
        total_area,
        plots_with_active_campaign,
        plots_without_active_campaign,
        has_inactive_plots
      }
    });

  } catch (error) {
    console.error("Error fetching user plots:", error);
    res.status(500).json({ message: "Error fetching user plots" });
  }
};

// Deactivate a plot
const deactivatePlot = async (req, res) => {
  const plotId = req.params.id;
  const userId = req.user.id;

  try {
    const plot = await Plot.findOne({ _id: plotId, user: userId });

    if (!plot) {
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

    if (!plot.active) {
      return res.status(400).json({ message: "Plot is already inactive" });
    }

    plot.active = false;
    await plot.save();

    res.status(200).json({
      message: "Plot deactivated successfully",
      plot,
    });
  } catch (error) {
    console.error("❌ Error deactivating plot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const reactivatePlot = async (req, res) => {
  const plotId = req.params.id;
  const userId = req.user.id;

  try {
    const plot = await Plot.findOne({ _id: plotId, user: userId });

    if (!plot) {
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

    if (plot.active) {
      return res.status(400).json({ message: "Plot is already active" });
    }

    plot.active = true;
    await plot.save();

    console.log(`✅ Plot with ID ${plotId} was reactivated`);
    res.status(200).json({
      message: "Plot reactivated successfully",
      plot,
    });
  } catch (error) {
    console.error("❌ Error reactivating plot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPlot,
  getUserPlots,
  updatePlot,
  deletePlot,
  getPlotCountByUser,
  deactivatePlot,
  reactivatePlot
};