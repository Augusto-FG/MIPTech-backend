const axios = require("axios");
const config = require("../constants");

// Simulación temporal de DB
const orders = {
  "abc123": { status: "paid" },
  "def456": { status: "pending" },
};

const webhook = async (req, res) => {
  try {
    const body = req.body;
    console.log("📬 Webhook recibido:", body);

    if ((body.type === "payment" || body.topic === "payment") && body.data?.id) {
      const paymentId = body.data.id;

      console.log("🔎 Consultando pago con ID:", paymentId);

      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${config.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = response.data;

      console.log("✅ Detalle completo del pago:", payment);

      if (payment.status === "approved") {
        console.log("🎉 Pago aprobado ✅");
        // Aquí deberías guardar en DB el estado aprobado, asociarlo a un orderId
      } else {
        console.log("🕓 Pago no aprobado todavía. Estado:", payment.status);
      }
    } else {
      console.log("🚫 Webhook ignorado (no es un pago válido de MercadoPago).");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en Webhook:", error.message);
    res.sendStatus(500);
  }
};

const getPaymentStatus = (req, res) => {
  const orderId = req.params.orderId;
  const order = orders[orderId];

  if (!order) {
    return res.status(404).json({ message: "Orden no encontrada" });
  }

  if (order.status === "paid") {
    return res.status(200).json({ message: "Pago aprobado" });
  } else {
    return res.status(400).json({ message: "Pago no aprobado" });
  }
};

module.exports = { webhook, getPaymentStatus };
