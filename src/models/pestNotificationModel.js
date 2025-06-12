const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
    required: true,
    index:true
    //Al indexar en MongoDB puede realizar consultas más rápidas sobre este atributo (que es el que se usa después para filtrar).
  }
  

});

module.exports = mongoose.model('PestNotification', notificationSchema);
