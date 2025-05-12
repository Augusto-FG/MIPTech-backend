const express = require("express");
const router = express.Router();
const registerController = require("../controllers/authControllers/registerController.js");
const loginController = require("../controllers/authControllers/loginController.js");
const forgotPasswordController = require("../controllers/authControllers/resetPasswordController.js");


router.post("/register", registerController.register);
router.post("/login", loginController.login);

router.post('/send-code', forgotPasswordController.sendVerificationCode);
router.post('/verify-code', forgotPasswordController.loginWithCode);
router.post("/update-password", forgotPasswordController.updatePassword);

module.exports = router;