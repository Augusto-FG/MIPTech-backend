const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  variant: { type: String, required: true },
  sowing_date: { type: Date, required: true },
  harvest_date: { type: Date },
  is_active: { type: Boolean, default: true },
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
//en el caso de simplemente querer crear la campaña actual, no hay que poner
//is active porque queda por defecto en true
//en el caso de querer crear una campaña pasada, hay que poner isActive en false

module.exports = mongoose.model("Campaign", campaignSchema);