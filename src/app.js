const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { connectToDatabase } = require("./database/database.js");
const { PORT } = require("./constants/index.js");
const calculateParametersRoutes = require('./routes/calculateParametersRoutes.js');
const authRoutes = require('./routes/authRoutes.js'); 
const userRoutes = require('./routes/userRoutes.js');
const plotRoutes = require('./routes/plotRoutes.js');
const campaignRoutes = require('./routes/campaignRoutes.js');
const measurementsRoutes = require('./routes/measurementsRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const locationRoutes = require("./routes/locationRoutes");
const scheduleMembershipJobs = require('./jobs/checkMemberships.js');

const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes.js');
const pagoController = require("./controllers/pagoController");



const pestNotificationRoutes = require('./routes/pestNotificationRoutes.js')


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
app.use(chatRoutes);
app.use(locationRoutes);

app.use(mercadoPagoRoutes);
app.post("/pago", pagoController.webhook);
app.get("/payment-status/:orderId", pagoController.getPaymentStatus);

app.use(pestNotificationRoutes);

connectToDatabase().then(() => {
  scheduleMembershipJobs(); 
  app.listen(PORT, () => {
  
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log(`
     ╔════════════════════════════════════╗
     ║ 🚀 Welcome to MIPTech backend!     ║ 
     ╚════════════════════════════════════╝
    `);
  });
});