const mongoose = require('mongoose');

const economicParameterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  plotID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: true
  },

  treatmentCost: { type: Number, required: true },
  soybeanValue: { type: Number, required: true },
  treatmentEfficiency: { type: Number, required: true },
  soyState: { type: String, required: true },
  percentageForUDE: { type: Number, required: true },
  rowSpacing: { type: Number, required: true },
  nde: { type: Number, required: true },
  ude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EconomicParameter', economicParameterSchema);
