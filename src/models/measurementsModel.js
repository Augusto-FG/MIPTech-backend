const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  pestType: { type: String, required: true },
  pestDensity: { type: Number, required: true },
  unit: {
    type: String,
    required: true,
    enum: ["insecto/metro lineal", "insecto/foliolo", "insecto/hoja"]
  },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Measurement", measurementSchema);