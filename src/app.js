const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { connectToDatabase } = require("./database/database.js");
const { PORT } = require("./constans/index.js");
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));


connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log(`
     ╔════════════════════════════════════╗
     ║ 🚀 Welcome to MIPTech backend!     ║ 
     ╚════════════════════════════════════╝
      `);
  });
});

