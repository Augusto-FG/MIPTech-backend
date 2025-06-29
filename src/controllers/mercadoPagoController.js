const { MercadoPagoConfig, Preference } = require("mercadopago");
const config = require("../constants");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants");
const UserModel = require("../models/userModel");
const sendPremiumWelcomeEmail = require("../utils/sendPremiumWelcomeEmail");

// Verificación inicial del ACCESS_TOKEN
if (!config.MERCADO_PAGO_ACCESS_TOKEN) {
  console.error("❌ ACCESS_TOKEN de MercadoPago no definido. Verificá el archivo .env");
  throw new Error("ACCESS_TOKEN de MercadoPago no definido");
}

// Configuración del cliente de MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: config.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000, // Opcional, para evitar que se cuelgue
  },
});

const crearPreferencia = async (req, res) => {
  try {
    const items = req.body.items || [
      {
        id: "producto-prueba",
        title: "Producto prueba",
        quantity: 1,
        unit_price: 100,
      },
    ];

    console.log("🛒 Creando preferencia con items:", items);

    // ✅ Verificamos y decodificamos el JWT del header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token no provisto" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const preference = new Preference(mercadopago);

    const result = await preference.create({
      body: {
        items,
        metadata: {
          usuario: user.name,
          email: user.email,
          extraInfo: "dato personalizado",
        },
        back_urls: {
          success: "http://localhost:5173/home",
          failure: "http://localhost:3000/failure",
          pending: "http://localhost:3000/pending",
        },
        // auto_return: "approved",
        notification_url: "https://9pkgkz72-3000.brs.devtunnels.ms/pago",
      },
    });

    console.log("✅ Preferencia de pago creada correctamente. ID:", result.id);

    // ✅ Enviamos mail de bienvenida a suscripción Premium
    await sendPremiumWelcomeEmail(user.email, user.name);

    res.status(200).json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      preference_id: result.id,
    });

  } catch (error) {
    console.error("❌ Error creando la preferencia:", error.message || error);

    if (error.cause) {
      console.error("Detalles del error:", error.cause);
    }

    res.status(500).json({
      error: "Error creando la preferencia",
      message: error.message || "Error desconocido",
    });
  }
};

module.exports = {
  crearPreferencia,
};
