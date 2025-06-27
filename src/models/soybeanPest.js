const mongoose = require('mongoose');

const soybeanPestSchema = new mongoose.Schema({
  scientificName: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('SoybeanPest', soybeanPestSchema, 'soybeanPests');
