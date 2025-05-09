const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  role: { type: String, enum: ["producer", "agronomist", "technician", "other"], required: true },
});

module.exports = mongoose.model("User", userSchema);