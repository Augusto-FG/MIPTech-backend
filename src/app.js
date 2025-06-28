const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("./database/database.js");
const { PORT, JWT_SECRET } = require("./constants/index.js");
const User = require("./models/userModel.js");
const calculateParametersRoutes = require("./routes/calculateParametersRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const plotRoutes = require("./routes/plotRoutes.js");
const campaignRoutes = require("./routes/campaignRoutes.js");
const soybeanPestsRoutes = require("./routes/soybeanPestRoutes.js");
const measurementsRoutes = require("./routes/measurementsRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const locationRoutes = require("./routes/locationRoutes");
const scheduleMembershipJobs = require("./jobs/checkMemberships.js");
const measurementReminderJob = require("./jobs/measurementReminderJob.js");

const mercadoPagoRoutes = require("./routes/mercadoPagoRoutes.js");
const pagoController = require("./controllers/pagoController");

const pestNotificationRoutes = require("./routes/pestNotificationRoutes.js");
const measurementReminderRoutes = require("./routes/measurementReminderRoutes.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Token no proporcionado"));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error("Token inválido"));
    }
});

let connectedUsers = new Map();
io.on("connection", async (socket) => {
    console.log("Usuario conectado:", socket.user.id);
    connectedUsers.set(socket.user.id, socket);

    try {
        const user = await User.findById(socket.user.id);
        if (user && user.needsCleanup) {
            socket.emit("needsCleanup", {
                needsCleanup: true,
            });
        }
    } catch (error) {
        console.error(
            "Error al verificar needsCleanup para usuario:",
            socket.user.id,
            error
        );
    }

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.user.id);
        connectedUsers.delete(socket.user.id);
    });
});

app.set("io", io);
app.set("connectedUsers", connectedUsers);

// middlewares
app.use(cors());
app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

app.use(calculateParametersRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(plotRoutes);
app.use(campaignRoutes);
app.use(measurementsRoutes);
app.use(chatRoutes);
app.use(locationRoutes);
app.use(soybeanPestsRoutes);

app.use(mercadoPagoRoutes);
app.post("/pago", pagoController.webhook);
app.get("/payment-status/:orderId", pagoController.getPaymentStatus);

app.use(pestNotificationRoutes);
app.use(measurementReminderRoutes);

connectToDatabase().then(() => {
    scheduleMembershipJobs();
    httpServer.listen(PORT, () => {
        measurementReminderJob(app);
        console.log("📱 Socket.IO configurado correctamente");
        console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
        console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
        console.log(`
     ╔════════════════════════════════════╗
     ║ 🚀 Welcome to MIPTech backend!     ║
     ╚════════════════════════════════════╝
    `);
    });
});
