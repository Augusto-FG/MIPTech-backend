const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  field_name: String,
  plot_name: String,
  surface: Number,
  // Referencia a campaña actual
  current_campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
  // Referencia a campañas pasadas
  previous_campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  province: String,
  partido_or_department: String,
  locality: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Plot", plotSchema);
