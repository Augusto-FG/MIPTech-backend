const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { connectToDatabase } = require("./database/database.js");
const { PORT } = require("./constans/index.js");
const authRoutes = require('./routes/authRoutes.js'); 
const userRoutes = require('./routes/userRoutes.js');
const calculateParametersRoutes = require('./routes/calculateParameters.routes');


const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));


app.use( authRoutes);
app.use(userRoutes); 
app.use('/api/v1/calculate-parameters', calculateParametersRoutes);

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

