const mongoose = require('mongoose');
const Plot = require('../models/plotModel');
const { connectToDatabase } = require("../database/database.js");

async function run() {
  try {
    // Conectamos a la BD
    await connectToDatabase();
    console.log('🔗 Conectado a MongoDB desde el script de migración');

    // Ejecutamos la actualización de los que no tengan los atributos nuevos.
    const result = await Plot.updateMany(
      { active: { $exists: false } },
      {
        $set: {
          active: true,
          createdAt : null, 
          updatedAt: null
        }
      }
    );

    console.log(`✅ Documents matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
  } catch (err) {
    console.error('❌ Error en el script de migración:', err);
  } finally {
    // Cerramos la conexión y terminamos
    mongoose.connection.close();
    process.exit(0);
  }
}

run();
