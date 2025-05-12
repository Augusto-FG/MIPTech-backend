const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const UserModel = require("../../models/userModel.js");
const { JWT_SECRET, EMAIL_USER, EMAIL_PASS } = require("../../constants/index.js");

const verificationCodes = {};

//Acá estamos configurando Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

//Con esto enviamos el código al correo
exports.sendVerificationCode = async (req, res) => {
  const { emailOrUsername } = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[user.email] = verificationCode;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: 'MipTech - Código de recuperación de contraseña',
      text: `Hola ${user.name},

        Recibimos una solicitud para recuperar tu contraseña en MipTech. Usa el siguiente código para continuar:

        Código de verificación: ${verificationCode}

        Este código es válido por tiempo limitado. Si no solicitaste este código, puedes ignorar este mensaje.

        Gracias,
        El equipo de MipTech`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

//Validamos código y generamos un JWT
exports.loginWithCode = async (req, res) => {
  const { emailOrUsername, code } = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const savedCode = verificationCodes[user.email];
    if (savedCode !== code) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    delete verificationCodes[user.email];

    return res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname,
        gender: user.gender,
      }
    });
  } catch (error) {
    console.error('Error al validar código:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }
  
    try {
      // Verificar el token y extraer el ID del usuario
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Guardar la nueva contraseña
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ error: "Failed to update password" });
    }
  };