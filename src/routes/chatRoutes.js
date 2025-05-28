const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/chatAiServiceController.js");

router.post("/chat", chatWithAI);

module.exports = router;