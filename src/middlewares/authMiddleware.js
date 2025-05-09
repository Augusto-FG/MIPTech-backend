const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constans/index.js");

exports.validateJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token not provided in Authorization header");
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("Token validated successfully");
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};