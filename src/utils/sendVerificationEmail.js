//acá estamos generando el mail con el código para recuperar contraseña
const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../constants/index");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function sendRecoveryCodeMail(user, code) {
  const mailOptions = {
    from: EMAIL_USER,
    to: user.email,
    subject: 'MipTech - Código de recuperación de contraseña',
    text: `Hola ${user.name},

    Recibimos una solicitud para recuperar tu contraseña en MipTech. Usa el siguiente código para continuar:

    Código de verificación: ${code}

    Este código es válido por tiempo limitado. Si no solicitaste este código, puedes ignorar este mensaje.

    Gracias,
    El equipo de MipTech`
  };

  console.log(`[MAIL] Sending recovery code to ${user.email}...`);
  await transporter.sendMail(mailOptions);
  console.log(`[MAIL] Email successfully sent to ${user.email}`);
}

module.exports = sendRecoveryCodeMail;
