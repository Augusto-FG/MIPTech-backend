const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notifiedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  pestType: {
    type: String,
    required: true
  },
  pestDensity: {
    type: Number,
    required: true
  },
  densityUnit: {
    type: String,
    required: true
  },
  partido_or_department: {
    type: String,
    required: true
  }
  

});

module.exports = mongoose.model('PestNotification', notificationSchema);
