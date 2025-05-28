const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { connectToDatabase } = require("./database/database.js");
const { PORT } = require("./constants/index.js");
const calculateParametersRoutes = require('./routes/calculateParametersRoutes.js');
const authRoutes = require('./routes/authRoutes.js'); 
const plotRoutes = require('./routes/plotRoutes.js');
const campaignRoutes = require('./routes/campaignRoutes.js');
const measurementsRoutes = require('./routes/measurementsRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');


const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

app.use(calculateParametersRoutes);
app.use(authRoutes);
app.use(userRoutes); 
app.use(plotRoutes);
app.use(campaignRoutes);
app.use(measurementsRoutes);
app.use(chatRoutes)

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