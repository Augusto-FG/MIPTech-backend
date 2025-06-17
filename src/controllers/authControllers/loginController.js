const UserModel = require("../../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../constants/index.js");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log(`[LOGIN] Failed login attempt for email: ${email}`);
            return res.status(404).json({
                code: 404,
                message: "Invalid credentials",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log(
                `[LOGIN] Incorrect password attempt for email: ${email}`
            );
            return res.status(400).json({
                code: 400,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "14d",
        });

        console.log(`[LOGIN] User logged in successfully: ${email}`);

        return res.status(200).json({
            code: 200,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                needsCleanup: !!user.needsCleanup,
            },
        });
    } catch (error) {
        console.error("[LOGIN] Error during login:", error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
        });
    }
};
