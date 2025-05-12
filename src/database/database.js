const mongoose = require('mongoose');
const { MONGODB_URI } = require("../constants/index.js");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión a MongoDB establecida');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectToDatabase };