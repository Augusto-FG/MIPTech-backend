const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../constants");

const sendPremiumWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const message = `
      <h1>¡Bienvenido a tu suscripción Premium, ${name}!</h1>
      <p>Gracias por elegir nuestro plan Premium. Ahora tenés acceso exclusivo a todas las funcionalidades y beneficios que mejorarán tu experiencia.</p>
      <ul>
        <li>Acceso ilimitado a contenido exclusivo</li>
        <li>Soporte prioritario 24/7</li>
        <li>Actualizaciones y novedades en primera instancia</li>
      </ul>
      <p>Si tenés alguna consulta, no dudes en contactarnos a soporte@miptech.com.</p>
      <p>¡Disfrutá al máximo tu suscripción!</p>
      <p>Equipo de Mitech</p>
    `;

    await transporter.sendMail({
      from: `"Mitech" <${EMAIL_USER}>`,
      to: email,
      subject: "🎉 ¡Bienvenido a la suscripción Premium!",
      html: message,
    });

    console.log(`✅ Mail de bienvenida Premium enviado a: ${email}`);
  } catch (error) {
    console.error(`❌ Error enviando mail Premium: ${error.message}`);
  }
};

module.exports = sendPremiumWelcomeEmail;
