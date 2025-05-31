const mongoose = require('mongoose');
const User = require('../models/userModel');
const { connectToDatabase } = require("../database/database.js");

async function run() {
  try {
    // Conectamos a la BD
    await connectToDatabase();
    console.log('🔗 Conectado a MongoDB desde el script de migración');

    // Ejecutamos la actualización de los que no tengan los atributos nuevos.
    const result = await User.updateMany(
      { membershipExpiresAt: { $exists: false } },
      {
        $set: {
          hasMembership:       false,
          membershipExpiresAt: null,
          autoRenew:           true,
          unsubscribed:        false,
          needsCleanup:        false
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
