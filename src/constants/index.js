require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://neobytear:BaW1UHbyQJpoyofZ@cluster0.apnjyye.mongodb.net/miptech',
  JWT_SECRET: process.env.JWT_SECRET || 'this_is_my_secret',

  // Autenticación para usar con Nodemailer:
  EMAIL_USER: process.env.EMAIL_USER || "neobytear@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "ctzkvpvgnjbqyonc",

  MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ||"APP_USR-6532587248250647-061120-3f1aa54dd162635bc09b3a7985d8c83a-2492370502"

};