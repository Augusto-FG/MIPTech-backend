// utils/sendWelcomeEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

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
      <p>Nos alegra mucho que te hayas unido a nuestra comunidad. Aquí puedes compartir momentos especiales, explorar contenido interesante y conectar con personas de todo el mundo.</p>
      <p>Si tenes alguna duda, no dudes en contactarnos. ¡Disfruta de la experiencia!</p>
      <p>El equipo de VibeShare.</p>
    `;

    await transporter.sendMail({
      from: `"MipTech" <${EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido a MipTech!",
      html: welcomeMessage,
    });

    console.log(`✅ Welcome email sent to:: ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email:: ${error}`);
  }
};

module.exports = sendWelcomeEmail;
