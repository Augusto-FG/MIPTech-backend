// src/controllers/chatAiServiceController.js

const { sendMessageToOpenRouter } = require("../utils/AiOpenRouterAPI.js");

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;

  console.log("📥 Nueva solicitud recibida en /chatWithAI");
  console.log("📝 Mensaje recibido:", message);

  if (!message) {
    console.warn("⚠️ No se recibió un mensaje en el body");
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log("📡 Enviando mensaje a OpenRouter...");
    const aiResponse = await sendMessageToOpenRouter(message);

    console.log("✅ Respuesta recibida de OpenRouter:", aiResponse);

    return res.status(200).json(aiResponse);
  } catch (err) {
    console.error("❌ Error al procesar la respuesta de OpenRouter:", err);

    return res.status(500).json({
      error: "Error processing AI response",
      details: err.message || err.toString(),
    });
  }
};