// este componente es para crear un mail de bienvenida, lo usa regiterController
const nodemailer = require("nodemailer");
require("dotenv").config();
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = require("../constants/index.js");

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const welcomeMessage = `
     <h1>¡Bienvenido a MipTech, ${name}!</h1>

      <p>Es un placer darte la bienvenida a nuestra plataforma. En MipTech, trabajamos para brindarte herramientas que te ayuden a gestionar tus lotes de forma eficiente y tomar decisiones informadas sobre el control de plagas.</p>
      <p>Si tenés alguna pregunta o necesitás soporte, no dudes en escribirnos. Estamos para ayudarte.</p>
      <p>¡Gracias por confiar en MipTech!</p>
      
      <p>El equipo de MipTech</p>
    `;

    await transporter.sendMail({
      from: `"MipTech" <${EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido a MipTech!",
      html: welcomeMessage,
    });

    console.log(`✅ Welcome email sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email: ${error}`);
  }
};

module.exports = sendWelcomeEmail;
