const UserModel = require("../../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../constants/index.js");
const sendWelcomeEmail = require("../../utils/welcomeEmail.js");

exports.register = async (req, res) => {
    try {
        console.log("[REGISTER] Incoming request:", req.body);

        const { email, name, lastname, password } = req.body;

        if (!email || !name || !lastname || !password) {
            console.warn("[REGISTER] Missing required fields");
            return res.status(400).json({
                code: 400,
                message: "Missing required fields",
            });
        }

        console.log("[REGISTER] Checking for existing user with email");
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            console.warn("[REGISTER] User already exists:", { email });
            return res.status(400).json({
                code: 400,
                message: "The user already exists",
            });
        }

        console.log("[REGISTER] Hashing password");
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            email,
            name,
            lastname,
            password: hashedPassword,
        });

        console.log("[REGISTER] Saving new user to database");
        await newUser.save();

        // Enviar email de bienvenida
        await sendWelcomeEmail(newUser.email, newUser.name);

        console.log("[REGISTER] Generating JWT token");
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
            expiresIn: "14d",
        });

        console.log("[REGISTER] Registration successful:", {
            userId: newUser._id,
        });

        return res.status(200).json({
            code: 200,
            message: "Registration completed successfully.",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                lastname: newUser.lastname,
            },
        });
    } catch (error) {
        console.error("[REGISTER] Error occurred during registration:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
};
