const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasMembership: { type: Boolean, default: false },
  //Los siguientes campos manejan el flujo de expiracion de membresias.
  membershipExpiresAt: { type: Date, default: null },
  autoRenew: { type: Boolean, default: true },
  unsubscribed: { type: Boolean, default: false },
  needsCleanup: { type: Boolean, default: false }

});

module.exports = mongoose.model("User", userSchema);