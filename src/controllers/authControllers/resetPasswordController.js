const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../../models/userModel.js");
const { JWT_SECRET } = require("../../constants/index.js");
const sendRecoveryCodeMail = require("../../utils/sendVerificationEmail.js");

const verificationCodes = {};

// Send verification code to email
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.warn("[AUTH] User not found for recovery");
            return res.status(404).json({ error: "User not found" });
        }

        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
        verificationCodes[user.email] = verificationCode;

        console.log(
            `[AUTH] Generated verification code ${verificationCode} for ${user.email}`
        );

        await sendRecoveryCodeMail(user, verificationCode);

        return res
            .status(200)
            .json({ message: "Verification code sent successfully" });
    } catch (error) {
        console.error("[MAIL] Error sending recovery email:", error);
        return res
            .status(500)
            .json({ error: "Failed to send verification email" });
    }
};

// Validate code and return JWT
exports.loginWithCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.warn("[AUTH] User not found during login");
            return res.status(404).json({ error: "User not found" });
        }

        const savedCode = verificationCodes[user.email];
        if (savedCode !== code) {
            console.warn("[AUTH] Invalid verification code");
            return res.status(400).json({ error: "Invalid verification code" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "14d",
        });
        delete verificationCodes[user.email];

        console.log(
            `[AUTH] Authentication successful for ${user.email}, JWT issued`
        );

        return res.status(200).json({
            token,
            user: {
                email: user.email,
                name: user.name,
                lastname: user.lastname,
            },
        });
    } catch (error) {
        console.error("[AUTH] Error validating verification code:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update user password
exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.warn("[AUTH] No token provided in password update");
        return res.status(401).json({ error: "Token not provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            console.warn("[AUTH] User not found in password update");
            return res.status(404).json({ error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`[AUTH] Password updated successfully for ${user.email}`);
        return res
            .status(200)
            .json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("[AUTH] Failed to update password:", error);
        return res.status(500).json({ error: "Failed to update password" });
    }
};
