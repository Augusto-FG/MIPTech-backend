const Campaign = require('../models/campaignModel'); 
const mongoose = require('mongoose');
const Plot = require('../models/plotModel');

const campaignController = {

  // Obtener campañas activas del usuario
  getActiveCampaigns: async (req, res) => {
    try {
      const campaigns = await Campaign.find({ user: req.user.id, is_active: true });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      res.status(500).json({ message: 'Error fetching active campaigns' });
    }
  },

  // Obtener campañas pasadas (cerradas), paginadas
  getPastCampaigns: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;

      const totalPastCampaigns = await Campaign.countDocuments({ user: userId, is_active: false });

      const campaigns = await Campaign.find({ user: userId, is_active: false })
        .sort({ sowing_date: -1 })
        .skip(skip)
        .limit(limit);

      if (!campaigns.length) {
        return res.status(404).json({ message: "No past campaigns found for this page" });
      }

      res.status(200).json({
        message: "Past campaigns fetched successfully",
        campaigns
      });

    } catch (error) {
      console.error('❌ Error fetching past campaigns:', error);
      res.status(500).json({ message: 'Error fetching past campaigns' });
    }
  },

  // Crear nueva campaña
  createCampaign: async (req, res) => {
  try {
    const { crop, variant, sowing_date, harvest_date, is_active, plot } = req.body;

    if (!crop || !variant || !sowing_date || !plot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(plot)) {
      return res.status(400).json({ error: "Invalid plot ID" });
    }

    const selectedPlot = await Plot.findOne({ _id: plot, user: userId });
    if (!selectedPlot) {
      return res.status(404).json({ error: "Plot not found or does not belong to the user" });
    }

    if (!selectedPlot.active) {
      return res.status(400).json({ error: "Cannot create a campaign on an inactive plot" });
    }

    const isCreatingActual = is_active === undefined || is_active === true;

    if (isCreatingActual) {
      // Desactiva campañas anteriores activas del mismo usuario en este lote
      await Campaign.updateMany(
        { user: userId, plot: plot, is_active: true },
        { $set: { is_active: false } }
      );
    }

    // Crear la nueva campaña
    const newCampaign = new Campaign({
      crop,
      variant,
      sowing_date,
      harvest_date,
      is_active: is_active ?? true,
      plot,
      user: userId
    });

    await newCampaign.save();

    // ACTUALIZAR EL LOTE
    if (isCreatingActual) {
      if (selectedPlot.current_campaign) {
        selectedPlot.previous_campaigns ??= [];
        selectedPlot.previous_campaigns.push(selectedPlot.current_campaign);
      }
      selectedPlot.current_campaign = newCampaign._id;
    } else {
      selectedPlot.previous_campaigns ??= [];
      selectedPlot.previous_campaigns.push(newCampaign._id);
    }

    await selectedPlot.save();

    res.status(201).json(newCampaign);

  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
},

  // Actualizar campaña
  updateCampaign: async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findOne({ _id: campaignId, user: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Validación del nuevo lote si se quiere cambiar
    if (updates.plot) {
      if (!mongoose.Types.ObjectId.isValid(updates.plot)) {
        return res.status(400).json({ message: 'Invalid plot ID' });
      }

      const selectedPlot = await Plot.findOne({ _id: updates.plot, user: req.user.id });
      if (!selectedPlot) {
        return res.status(404).json({ message: 'Plot not found or does not belong to the user' });
      }

      if (!selectedPlot.active) {
        return res.status(400).json({ message: 'Cannot assign an inactive plot to a campaign' });
      }
    }

    if (campaign.is_active) {
      if (updates.sowing_date) {
        return res.status(400).json({ message: 'Cannot modify sowing_date in active campaigns' });
      }
    } else {
      const allowedFields = ['harvestActual'];
      const invalidFields = Object.keys(updates).filter(key => !allowedFields.includes(key));
      if (invalidFields.length > 0) {
        return res.status(400).json({ message: `Cannot modify ${invalidFields.join(', ')} in past campaigns` });
      }
    }

    Object.assign(campaign, updates);
    const updatedCampaign = await campaign.save();

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign' });
  }
},


  // Eliminar campaña
  deleteCampaign: async (req, res) => {
    try {
      const campaignId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      const campaign = await Campaign.findOne({
        _id: campaignId,
        user: req.user.id
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const plot = await Plot.findOne({ _id: campaign.plot, user: req.user.id });
      if (!plot) {
        return res.status(404).json({ message: 'Associated plot not found or not owned by user' });
      }

      if (!plot.active) {
        return res.status(400).json({ message: 'Cannot delete campaign linked to an inactive plot' });
      }

      await campaign.deleteOne();
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      res.status(500).json({ message: 'Internal server error while deleting campaign' });
    }
  },

  // Obtener una campaña específica por ID
  getCampaignById: async (req, res) => {
    try {
      const campaignId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      const campaign = await Campaign.findOne({ _id: campaignId, user: req.user.id });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found or does not belong to the user' });
      }

      res.status(200).json(campaign);
    } catch (error) {
      console.error('❌ Error fetching campaign by ID:', error);
      res.status(500).json({ message: 'Internal server error while fetching campaign' });
    }
  }

};

module.exports = campaignController;
