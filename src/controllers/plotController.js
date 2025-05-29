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

    const updatedPlot = await Plot.findOneAndUpdate(
      { _id: plotId, user: userId }, // Ensures the plot belongs to the user
      updatedData,
      { new: true }
    );

    if (!updatedPlot) {
      console.warn(`⚠️ Plot not found or not authorized. ID: ${plotId}, User: ${userId}`);
      return res.status(404).json({ message: "Plot not found or not authorized" });
    }

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

    console.log("📥 Request to fetch user's plots");
    console.log("👤 Authenticated user ID:", userId);

    const userPlots = await Plot.find({ user: userId });

    if (!userPlots.length) {
      console.warn(`⚠️ No plots found for user with ID: ${userId}`);
      return res.status(404).json({ message: "No plots found for this user" });
    }

    console.log(`✅ Found ${userPlots.length} plots for the user`);

    res.status(200).json({
      message: "User plots fetched successfully",
      plots: userPlots
    });
  } catch (error) {
    console.error("❌ Error fetching user's plots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPlot,
  getUserPlots,
  updatePlot,
  deletePlot,
  getPlotCountByUser
};