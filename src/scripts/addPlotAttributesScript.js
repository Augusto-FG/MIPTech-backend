const mongoose = require('mongoose');
const Plot = require('../models/plotModel');
const { connectToDatabase } = require("../database/database.js");

async function run() {
  try {
    // 1) Conectamos a la BD
    await connectToDatabase();
    console.log('🔗 Conectado a MongoDB desde el script de migración (createdAt)');

    // 2) Fecha actual como fallback
    const ahora = new Date();

    // 3) Buscamos todos los documentos de Plot que no tengan `createdAt`
    //    y les asignamos:
    //      createdAt: si ya tienen `updatedAt`, usamos ese valor;
    //                 si no, usamos `ahora`.
    const cursor = Plot.find(
      { createdAt: { $exists: false } },
      { _id: 1, updatedAt: 1 }
    ).cursor();

    let matched = 0;
    let modified = 0;

    for await (const doc of cursor) {
      matched++;
      const newCreatedAt = doc.updatedAt ? doc.updatedAt : ahora;

      const result = await Plot.updateOne(
        { _id: doc._id },
        { $set: { createdAt: newCreatedAt } }
      );

      if (result.modifiedCount > 0) {
        modified++;
        console.log(`  🛠️  Plot ${doc._id} → createdAt set to ${newCreatedAt.toISOString()}`);
      }
    }

    console.log(`✅ Total documents without createdAt: ${matched}, actually modified: ${modified}`);
  } catch (err) {
    console.error('❌ Error en el script de migración (createdAt):', err);
  } finally {
    // 4) Cerramos la conexión y terminamos
    mongoose.connection.close();
    process.exit(0);
  }
}

run();
