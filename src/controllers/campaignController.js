const Campaign = require('../models/campaignModel'); 
const mongoose = require('mongoose');
const Plot = require('../models/plotModel');



// Controller for Campaign
const campaignController = {

  // Get active campaigns for user
  getActiveCampaigns: async (req, res) => {
    try {
      const campaigns = await Campaign.find({ user: req.user.id, is_active: true });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      res.status(500).json({ message: 'Error fetching active campaigns' });
    }
  },

  // Get past (closed) campaigns for user
  getPastCampaigns: async (req, res) => {
    try {
      const campaigns = await Campaign.find({ user: req.user.id, is_active: false });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching past campaigns:', error);
      res.status(500).json({ message: 'Error fetching past campaigns' });
    }
  },

  // Create campaign (default isActive: true)
  createCampaign: async (req, res) => {
  try {
    const { crop, variant, sowing_date, harvest_date, is_active, plot } = req.body;

    // Validación básica
    if (!crop || !variant || !sowing_date || !plot) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const userId = req.user.id;

    // Si no se especifica isActive o si es true, se asume que es una campaña actual
    const isCreatingActual = is_active === undefined || is_active === true;

    if (isCreatingActual) {
      // Desactivar campañas actuales anteriores del mismo usuario y lote
      await Campaign.updateMany(
        { user: userId, plot: plot, is_active: true },
        { $set: { is_active: false } }
      );
    }

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
    res.status(201).json(newCampaign);

  } catch (error) {
    console.error("Error al crear campaña:", error);
    res.status(500).json({ error: "Error al crear la campaña" });
  }
},

  // Update campaign 
  updateCampaign: async (req, res) => {
    try {
      const campaignId = req.params.id;
      const updates = req.body;

      // Find campaign by user and id
      const campaign = await Campaign.findOne({ _id: campaignId, user: req.user.id });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.is_active) {
        // Active campaign: example - do not allow sowingDate change
        if (updates.sowing_date) {
          return res.status(400).json({ message: 'Cannot modify sowingDate in active campaigns' });
        }
      } else {
        // Past campaign: only allow harvestActual to be modified
        const allowedFields = ['harvestActual'];
        const invalidFields = Object.keys(updates).filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
          return res.status(400).json({ message: `Cannot modify ${invalidFields.join(', ')} in past campaigns` });
        }
      }

      // Apply allowed updates
      Object.assign(campaign, updates);
      const updatedCampaign = await campaign.save();

      res.json(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Error updating campaign' });
    }
  },

  deleteCampaign: async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Validar si el ID tiene el formato correcto de ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    // Buscar y eliminar la campaña por ID y usuario autenticado
    const campaign = await Campaign.findOneAndDelete({
      _id: campaignId,
      user: req.user.id
    });

    if (!campaign) {
      console.warn(`⚠️ Campaign with id ${campaignId} not found or does not belong to user`);
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({ message: 'Internal server error while deleting campaign' });
  }
}

};

module.exports = campaignController;
