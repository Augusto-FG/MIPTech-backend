const UserModel = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constans/index.js");

exports.register = async (req, res) => {
    try {
      console.log("[REGISTER] Incoming request:", req.body);
  
      const { email, name, surname, username, password, gender, role } = req.body;
  
      if (!email || !name || !surname || !username || !password || !gender || !role) {
        console.warn("[REGISTER] Missing required fields");
        return res.status(400).json({
          code: 400,
          message: "Missing required fields"
        });
      }
  
      console.log("[REGISTER] Checking for existing user with email or username");
      const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        console.warn("[REGISTER] User already exists:", { email, username });
        return res.status(400).json({
          code: 400,
          message: "The user already exists"
        });
      }
  
      console.log("[REGISTER] Hashing password");
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new UserModel({
        email,
        name,
        surname,
        username,
        password: hashedPassword,
        gender,
        role,
      });
  
      console.log("[REGISTER] Saving new user to database");
      await newUser.save();
  
      console.log("[REGISTER] Generating JWT token");
      const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      console.log("[REGISTER] Registration successful:", { userId: newUser._id });
  
      return res.status(200).json({
        code: 200,
        message: "Registration completed successfully.",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          surname: newUser.surname,
          gender: newUser.gender,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error("[REGISTER] Error occurred during registration:", error);
      return res.status(500).json({
        code: 500,
        message: "Server error"
      });
    }
  };

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
  