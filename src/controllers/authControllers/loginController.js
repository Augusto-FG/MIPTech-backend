const UserModel = require("../../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../constants/index.js");

exports.login = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const user = await UserModel.findOne({ $or: [{ email }, { username }] });
      if (!user) {
        console.log(`[LOGIN] Failed login attempt for username/email: ${username || email}`);
        return res.status(404).json({
          code: 404,
          message: "Invalid credentials",
        });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log(`[LOGIN] Failed login attempt for username/email: ${username || email}`);
        return res.status(400).json({
          code: 400,
          message: "Invalid credentials",
        });
      }
  
      const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      console.log(`[LOGIN] User logged in successfully: ${username || email}`);
  
      return res.status(200).json({
        code: 200,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          surname: user.surname,
          gender: user.gender,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LOGIN] Error en login:", error);
      return res.status(500).json({
        code: 500,
        message: "Server error",
      });
    }
};