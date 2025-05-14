const mongoose = require('mongoose');

const economicParameterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
nde: { type: Number, required: true },
  ude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EconomicParameter', economicParameterSchema);
