const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🟢 Token received: ", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded user: ", decoded);
    req.user = decoded;  // Attach user to request
    next();
  } catch (error) {
    console.error("❌ Token verification failed: ", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = { authenticateUser, authenticateAdmin };



module.exports = authenticateUser;
