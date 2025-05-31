const OpenRouterAPIClient = require('../utils/OpenRouterAPIClient.js');

const apiKey = "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"; // reemplaza por tu clave real (o usa process.env.OPENROUTER_API_KEY)
const client = new OpenRouterAPIClient(apiKey);

const sendMessageToOpenRouter = async (userMessage) => {
  const systemPrompt = `
    Sos un asistente virtual experto exclusivamente en Agronomia.
    Tu tarea es brindar respuestas claras, profesionales y concisas relacionadas con agronomía, campo, siembra, cosecha.

    Si el usuario pregunta algo fuera del tema (como programación, comida, historia, etc.),
    respondé con el siguiente mensaje exactamente:
    
    "La pregunta solicitada se escapa de los parámetros indicados."

    Si no estás seguro si la pregunta entra en el tema, respondé de forma educada indicando que solo respondés preguntas sobre agronomía, campo, siembra, cosecha.
  "`;
  
  return await client.sendChatMessage([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ]);
};

module.exports = { sendMessageToOpenRouter };
